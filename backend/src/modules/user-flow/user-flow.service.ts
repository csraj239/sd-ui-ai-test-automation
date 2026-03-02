import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFlow, UserFlowStep } from '../../database/entities';
import {
  CreateUserFlowDto,
  UpdateUserFlowDto,
  CreateUserFlowStepDto,
  UpdateUserFlowStepDto,
  ExecuteUserFlowDto,
} from './user-flow.dto';
import axios from 'axios';

@Injectable()
export class UserFlowService {
  // Track running executions
  private runningExecutions = new Map<string, { browser: any; cancelled: boolean }>();

  constructor(
    @InjectRepository(UserFlow)
    private userFlowRepository: Repository<UserFlow>,
    @InjectRepository(UserFlowStep)
    private userFlowStepRepository: Repository<UserFlowStep>,
  ) {}

  async create(createUserFlowDto: CreateUserFlowDto): Promise<UserFlow> {
    const userFlow = this.userFlowRepository.create({
      ...createUserFlowDto,
      status: 'draft',
    });
    return this.userFlowRepository.save(userFlow);
  }

  async findAll(projectId?: string): Promise<UserFlow[]> {
    const query = this.userFlowRepository.createQueryBuilder('userFlow');
    if (projectId) {
      query.where('userFlow.projectId = :projectId', { projectId });
    }
    return query.leftJoinAndSelect('userFlow.steps', 'steps')
      .orderBy('userFlow.createdAt', 'DESC')
      .addOrderBy('steps.stepNumber', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<UserFlow | null> {
    return this.userFlowRepository.findOne({
      where: { id },
      relations: ['steps'],
      order: {
        steps: {
          stepNumber: 'ASC',
        },
      },
    });
  }

  async update(id: string, updateUserFlowDto: UpdateUserFlowDto): Promise<UserFlow | null> {
    await this.userFlowRepository.update(id, updateUserFlowDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userFlowRepository.delete(id);
  }

  async addStep(userFlowId: string, createStepDto: CreateUserFlowStepDto): Promise<UserFlowStep> {
    const step = this.userFlowStepRepository.create({
      ...createStepDto,
      userFlowId,
    });
    return this.userFlowStepRepository.save(step);
  }

  async insertStepAfter(userFlowId: string, createStepDto: CreateUserFlowStepDto, afterStepNumber: number): Promise<UserFlowStep> {
    // Use a transaction to ensure data consistency
    return this.userFlowStepRepository.manager.transaction(async (manager) => {
      // Get all steps for this user flow ordered by step number
      const allSteps = await manager.find(UserFlowStep, {
        where: { userFlowId },
        order: { stepNumber: 'ASC' },
      });

      // Update step numbers for all steps after the insertion point
      for (const step of allSteps) {
        if (step.stepNumber > afterStepNumber) {
          await manager.update(UserFlowStep, { id: step.id }, { stepNumber: step.stepNumber + 1 });
        }
      }

      // Create the new step with the correct step number
      const newStep = manager.create(UserFlowStep, {
        ...createStepDto,
        userFlowId,
        stepNumber: afterStepNumber + 1,
      });

      return manager.save(newStep);
    });
  }

  async updateStep(stepId: string, updateStepDto: UpdateUserFlowStepDto): Promise<UserFlowStep | null> {
    // First check if the step exists
    const existingStep = await this.userFlowStepRepository.findOne({ where: { id: stepId } });
    
    if (!existingStep) {
      throw new Error(`Step with ID ${stepId} not found`);
    }
    
    await this.userFlowStepRepository.update(stepId, updateStepDto);
    return this.userFlowStepRepository.findOne({ where: { id: stepId } });
  }

  async removeStep(stepId: string): Promise<void> {
    await this.userFlowStepRepository.delete(stepId);
  }

  async getStepsByUserFlowId(userFlowId: string): Promise<UserFlowStep[]> {
    return this.userFlowStepRepository.find({
      where: { userFlowId },
      order: { stepNumber: 'ASC' },
    });
  }

  async executeUserFlow(
    userFlowId: string,
    appUrl: string,
    executeDto: ExecuteUserFlowDto,
  ): Promise<any> {
    const userFlow = await this.findOne(userFlowId);
    if (!userFlow) {
      throw new Error('User flow not found');
    }

    // Check if already executing
    if (this.runningExecutions.has(userFlowId)) {
      throw new Error('User flow is already executing');
    }

    // Update status to executing
    await this.userFlowRepository.update(userFlowId, { status: 'executing' });

    let browser = null;
    try {
      // Call Playwright executor to run the user flow
      const playwright = require('playwright');
      browser = await playwright.chromium.launch({
        headless: executeDto.headless !== false,
      });

      // Track the execution
      const executionTracker = { browser, cancelled: false };
      this.runningExecutions.set(userFlowId, executionTracker);

      const context = await browser.newContext();
      const page = await context.newPage();

      const executionResults = {
        success: true,
        output: '',
        dom: '',
        accessibility: '',
        screenshots: [],
        testCases: [],
      };

      let shouldCloseBrowser = false;

      // Ensure steps are sorted by step number before execution
      const sortedSteps = userFlow.steps.sort((a, b) => a.stepNumber - b.stepNumber);
      console.log('Executing steps in order:', sortedSteps.map(s => `${s.stepNumber}: ${s.action}`));

      // Execute each step
      for (const step of sortedSteps) {
        console.log(`Executing step ${step.stepNumber}: ${step.action}`);
        
        // Check if execution was cancelled
        if (executionTracker.cancelled) {
          console.log('Execution cancelled by user');
          executionResults.output += '\nExecution cancelled by user';
          executionResults.success = false;
          break;
        }

        try {
          // Add timeout wrapper to prevent hanging
          await Promise.race([
            this.executeStep(page, step, executionResults, appUrl, executionTracker),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Step execution timeout after 60 seconds')), 60000)
            )
          ]);

          // Check if CloseBrowser was called
          if (step.action.toLowerCase() === 'closebrowser') {
            shouldCloseBrowser = true;
          }

          console.log(`Step ${step.stepNumber} completed successfully`);
        } catch (error: any) {
          console.error(`Error in step ${step.stepNumber}:`, error.message);
          executionResults.output += `\nError in step ${step.stepNumber}: ${error.message}`;
          executionResults.success = false;
          // Continue to next step rather than breaking completely
        }
      }

      // Check if cancelled before finalizing
      if (!executionTracker.cancelled) {
        // Extract final DOM
        const finalDom = await page.content();
        executionResults.dom = finalDom;

        // Extract accessibility info (simple example)
        executionResults.accessibility = await this.extractAccessibilityInfo(page);
      }

      // Only close browser if CloseBrowser action was called, execution was cancelled, or there was an error
      if (shouldCloseBrowser || executionTracker.cancelled || !executionResults.success) {
        await browser.close();
        browser = null;
        console.log('Browser closed due to CloseBrowser action, cancellation, or error');
      } else {
        // Keep browser open for inspection
        console.log('Browser kept open - use CloseBrowser action to close it');
        // Don't close browser, but remove from tracking since execution is complete
        this.runningExecutions.delete(userFlowId);
      }

      // Update status to executed or stopped
      const finalStatus = executionTracker.cancelled ? 'stopped' : 
                         (executionResults.success ? 'executed' : 'failed');
      
      await this.userFlowRepository.update(userFlowId, {
        status: finalStatus,
        executionResult: JSON.stringify(executionResults),
        lastExecutedAt: new Date(),
      });

      return executionResults;
    } catch (error: any) {
      if (browser) {
        try {
          await browser.close();
          console.log('Browser closed due to execution error');
        } catch (closeError) {
          console.error('Error closing browser:', closeError);
        }
      }

      await this.userFlowRepository.update(userFlowId, {
        status: 'failed',
        executionResult: JSON.stringify({
          success: false,
          error: error.message,
        }),
      });
      throw error;
    } finally {
      // Only clean up tracking if browser was closed
      if (!browser) {
        this.runningExecutions.delete(userFlowId);
      }
    }
  }

  async stopExecution(userFlowId: string): Promise<void> {
    const execution = this.runningExecutions.get(userFlowId);
    if (!execution) {
      throw new Error('No running execution found for this user flow');
    }

    // Mark as cancelled
    execution.cancelled = true;

    // Close browser to stop execution immediately
    try {
      await execution.browser.close();
    } catch (error) {
      console.error('Error closing browser during stop:', error);
    }

    // Update status in database
    await this.userFlowRepository.update(userFlowId, {
      status: 'stopped',
      executionResult: JSON.stringify({
        success: false,
        output: 'Execution stopped by user',
      }),
    });

    // Remove from tracking
    this.runningExecutions.delete(userFlowId);
  }

  async generateTestCasesFromUserFlow(userFlowId: string): Promise<any[]> {
    const userFlow = await this.findOne(userFlowId);
    if (!userFlow) {
      throw new Error('User flow not found');
    }

    // Parse execution results if available
    const executionResult = userFlow.executionResult ? JSON.parse(userFlow.executionResult) : null;
    
    const testCases: any[] = [];

    // Generate test cases for each step
    for (const step of userFlow.steps) {
      const testCase = this.generateTestCaseForStep(step);
      testCases.push(testCase);
    }

    return testCases;
  }

  private generateTestCaseForStep(step: UserFlowStep): any {
    const action = step.action.toLowerCase();
    const testCases: any[] = [];

    // Generate positive test case
    const positiveCase: any = {
      name: `${action.toUpperCase()} - ${step.description || 'Default'}`,
      steps: this.generateStepsForAction(step, true),
      expectedOutput: `${step.action} action completed successfully on ${step.page || 'current page'}`,
      priority: 'high',
    };
    testCases.push(positiveCase);

    // Generate negative test case
    const negativeCase: any = {
      name: `${action.toUpperCase()} - Negative Case - ${step.description || 'Default'}`,
      steps: this.generateNegativeSteps(step),
      expectedOutput: `Error handling test for ${step.action} action`,
      priority: 'medium',
    };
    testCases.push(negativeCase);

    // Generate edge case if applicable
    if (action === 'enter') {
      const edgeCase: any = {
        name: `${action.toUpperCase()} - Edge Cases - ${step.description || 'Default'}`,
        steps: this.generateEdgeCaseSteps(step),
        expectedOutput: `Edge case validation for ${step.action} action with special characters and boundary values`,
        priority: 'medium',
      };
      testCases.push(edgeCase);
    }

    return testCases[0]; // Return primary test case (can be extended to return all)
  }

  private generateStepsForAction(step: UserFlowStep, isPositive: boolean): string[] {
    const action = step.action.toLowerCase();
    const steps: string[] = [];

    switch (action) {
      case 'launch':
        steps.push(`Navigate to ${step.data || 'application'}`);
        steps.push(`Verify page loads successfully`);
        steps.push(`Verify page contains expected elements`);
        break;

      case 'click':
        steps.push(`Wait for element: ${step.locator}`);
        steps.push(`Click on element: ${step.locator}`);
        steps.push(`Verify element was clicked (DOM changes or navigation)`);
        break;

      case 'enter':
        steps.push(`Focus on input field: ${step.locator}`);
        steps.push(`Clear existing data`);
        steps.push(`Type data: ${step.data}`);
        steps.push(`Verify data was entered correctly`);
        break;

      case 'hover':
        steps.push(`Hover over element: ${step.locator}`);
        steps.push(`Verify hover state (tooltip, style changes)`);
        break;

      case 'verifytext':
        steps.push(`Navigate to page: ${step.page}`);
        steps.push(`Verify text "${step.data}" is visible on page`);
        steps.push(`Verify text is in expected location`);
        break;

      default:
        steps.push(`Execute ${action} action on ${step.page}`);
    }

    return steps;
  }

  private generateNegativeSteps(step: UserFlowStep): string[] {
    const action = step.action.toLowerCase();
    const steps: string[] = [];

    switch (action) {
      case 'click':
        steps.push(`Attempt to click on non-existent element: ${step.locator || 'invalid-selector'}`);
        steps.push(`Verify appropriate error handling`);
        break;

      case 'enter':
        steps.push(`Attempt to enter data in hidden/disabled field: ${step.locator}`);
        steps.push(`Verify field rejects input appropriately`);
        break;

      case 'verifytext':
        steps.push(`Verify incorrect text is not on page: NOT_${step.data}`);
        steps.push(`Verify correct text validation logic`);
        break;

      default:
        steps.push(`Test error handling for ${action} action`);
    }

    return steps;
  }

  private generateEdgeCaseSteps(step: UserFlowStep): string[] {
    const steps: string[] = [];

    steps.push(`Enter special characters: !@#$%^&*()`);
    steps.push(`Verify field handles special characters`);
    steps.push(`Enter maximum length data`);
    steps.push(`Verify field respects length limits`);
    steps.push(`Enter null/empty values`);
    steps.push(`Verify field validation for empty input`);

    return steps;
  }

  private async executeStep(page: any, step: UserFlowStep, results: any, appUrl: string, executionTracker?: any): Promise<void> {
    const action = step.action.toLowerCase();
    console.log(`Executing action: ${action} with locator: ${step.locator || 'none'} and data: ${step.data || 'none'}`);

    switch (action) {
      case 'launch':
        const url = step.data || appUrl;
        console.log(`Launching URL: ${url}`);
        try {
          await page.goto(url, { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
          });
          // Wait a bit more for the page to stabilize
          await page.waitForTimeout(2000);
          results.output += `\n✓ Launched: ${url}`;
          console.log(`Successfully launched: ${url}`);
        } catch (error: any) {
          console.error(`Failed to launch ${url}:`, error.message);
          throw new Error(`Failed to navigate to ${url}: ${error.message}`);
        }
        break;

      case 'click':
        if (!step.locator) throw new Error('Click action requires locator');
        await page.click(step.locator);
        results.output += `\n✓ Clicked: ${step.locator}`;
        break;

      case 'enter':
        if (!step.locator || !step.data) throw new Error('Enter action requires locator and data');
        await page.fill(step.locator, step.data);
        results.output += `\n✓ Entered data in: ${step.locator}`;
        break;

      case 'hover':
        if (!step.locator) throw new Error('Hover action requires locator');
        await page.hover(step.locator);
        results.output += `\n✓ Hovered over: ${step.locator}`;
        break;

      case 'verifytext':
        if (!step.data) throw new Error('VerifyText action requires data to verify');
        const textContent = await page.textContent('body');
        if (!textContent?.includes(step.data)) {
          throw new Error(`Text not found: ${step.data}`);
        }
        results.output += `\n✓ Text verified: ${step.data}`;
        break;

      case 'pause':
        const timeout = parseInt(step.data) || 1000; // Default to 1 second if not specified
        if (timeout <= 0) throw new Error('Pause action requires a positive timeout value in milliseconds');
        await page.waitForTimeout(timeout);
        results.output += `\n✓ Paused for ${timeout}ms`;
        break;

      case 'closebrowser':
        // Close the browser when this action is encountered
        if (executionTracker && executionTracker.browser) {
          await executionTracker.browser.close();
          results.output += `\n✓ Browser closed`;
        } else {
          results.output += `\n✓ Close browser requested (will close at end)`;
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async extractAccessibilityInfo(page: any): Promise<string> {
    // Simple accessibility extraction - you can enhance this
    try {
      const accessibilityInfo = await page.evaluate(() => {
        // @ts-ignore - document is available in browser context via page.evaluate
        const headings: any[] = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        // @ts-ignore - document is available in browser context via page.evaluate
        const buttons: any[] = Array.from(document.querySelectorAll('button, [role="button"]'));
        // @ts-ignore - document is available in browser context via page.evaluate
        const forms: any[] = Array.from(document.querySelectorAll('form'));
        // @ts-ignore - document is available in browser context via page.evaluate
        const images: any[] = Array.from(document.querySelectorAll('img'));

        return {
          headings: headings.map((h: any) => h.textContent),
          buttons: buttons.map((b: any) => b.textContent),
          formCount: forms.length,
          imagesWithoutAlt: images
            .filter((img: any) => !img.alt)
            .length,
        };
      });
      return JSON.stringify(accessibilityInfo, null, 2);
    } catch (error) {
      return 'Accessibility extraction failed';
    }
  }
}
