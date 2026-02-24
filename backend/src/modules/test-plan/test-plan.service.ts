import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestPlan, TestScenario } from '../../database/entities';
import { CreateTestPlanDto, UpdateTestPlanDto, GeneratePlanDto } from './test-plan.dto';
import axios from 'axios';

@Injectable()
export class TestPlanService {
  constructor(
    @InjectRepository(TestPlan)
    private testPlanRepository: Repository<TestPlan>,
    @InjectRepository(TestScenario)
    private testScenarioRepository: Repository<TestScenario>,
  ) {}

  async create(createTestPlanDto: CreateTestPlanDto): Promise<TestPlan> {
    const testPlan = this.testPlanRepository.create(createTestPlanDto);
    return this.testPlanRepository.save(testPlan);
  }

  async findAll(projectId?: string): Promise<TestPlan[]> {
    const query = this.testPlanRepository.createQueryBuilder('testPlan');
    if (projectId) {
      query.where('testPlan.projectId = :projectId', { projectId });
    }
    return query.leftJoinAndSelect('testPlan.testScenarios', 'scenarios').getMany();
  }

  async findOne(id: string): Promise<TestPlan | null> {
    return this.testPlanRepository.findOne({
      where: { id },
      relations: ['testScenarios'],
    });
  }

  async update(id: string, updateTestPlanDto: UpdateTestPlanDto): Promise<TestPlan | null> {
    await this.testPlanRepository.update(id, updateTestPlanDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.testPlanRepository.delete(id);
  }

  async generatePlan(generatePlanDto: GeneratePlanDto): Promise<any> {
    // Call OpenAI to generate test cases based on acceptance criteria
    const scenarios = await this.callOpenAIForTestGeneration(generatePlanDto);
    return {
      success: true,
      scenarios: scenarios,
    };
  }

  async linkScenarios(planId: string, scenarioIds: string[]): Promise<TestPlan | null> {
    const testPlan = await this.findOne(planId);
    if (!testPlan) throw new Error('TestPlan not found');
    const scenarios = await this.testScenarioRepository.findByIds(scenarioIds);
    testPlan.testScenarios = scenarios;
    return this.testPlanRepository.save(testPlan);
  }

  private async callOpenAIForTestGeneration(generatePlanDto: GeneratePlanDto): Promise<any> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const apiVersion = process.env.OPENAI_API_VERSION || '2023-03-15-preview';
      const deploymentName = process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4o';

      if (!apiKey || !endpoint) {
        // Fallback to mock data if API keys are not configured
        return this.generateMockTestCases(generatePlanDto);
      }

      const prompt = this.buildTestGenerationPrompt(generatePlanDto);

      const response = await axios.post(
        `${endpoint}openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
        {
          messages: [
            {
              role: 'system',
              content: 'You are an expert QA engineer. Generate detailed test cases as JSON array.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const scenarios = JSON.parse(jsonMatch[0]);
        return scenarios.map((scenario: any) => ({
          name: scenario.name || scenario.title || 'Untitled Test Case',
          steps: Array.isArray(scenario.steps) ? scenario.steps : (scenario.steps?.split('→') || []),
          expectedOutput: scenario.expectedOutput || scenario.expected || 'Verify successful completion',
          priority: scenario.priority || 'medium',
        }));
      }

      return this.generateMockTestCases(generatePlanDto);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      // Fallback to mock data on error
      return this.generateMockTestCases(generatePlanDto);
    }
  }

  private buildTestGenerationPrompt(generatePlanDto: GeneratePlanDto): string {
    return `
    Generate comprehensive test cases for the following acceptance criteria:

    **Acceptance Criteria:**
    ${generatePlanDto.acceptanceCriteria}

    **Navigation Flow:**
    ${generatePlanDto.navigationFlow || 'User interacting with the application'}

    **Additional Instructions:**
    ${generatePlanDto.prompt || 'Generate detailed, practical test cases'}

    Please generate test cases in the following JSON format:
    [
      {
        "name": "Test Case Name",
        "steps": ["Step 1", "Step 2", "Step 3"],
        "expectedOutput": "Description of expected result",
        "priority": "high|medium|low"
      }
    ]

    Generate at least 3-5 test cases covering:
    - Positive scenarios (happy path)
    - Negative scenarios (error conditions)
    - Edge cases
    - Boundary conditions

    Ensure test cases are specific, measurable, and actionable.
    Return ONLY valid JSON array, no additional text.
    `;
  }

  private generateMockTestCases(generatePlanDto: GeneratePlanDto): any[] {
    // Parse acceptance criteria to create relevant mock test cases
    const criteria = generatePlanDto.acceptanceCriteria.toLowerCase();
    
    const baseTestCases = [
      {
        name: 'Verify successful completion of user journey',
        steps: ['Navigate to application', 'Perform required actions', 'Verify successful outcome'],
        expectedOutput: 'User completes the workflow successfully',
        priority: 'high',
      },
      {
        name: 'Verify error handling for invalid inputs',
        steps: ['Attempt to use invalid data', 'Observe error handling', 'Verify error message'],
        expectedOutput: 'Appropriate error message is displayed',
        priority: 'high',
      },
      {
        name: 'Verify edge case scenarios',
        steps: ['Test with boundary values', 'Verify system behavior', 'Confirm expected results'],
        expectedOutput: 'System handles edge cases appropriately',
        priority: 'medium',
      },
    ];

    // Enhance mock data based on acceptance criteria
    if (criteria.includes('login') || criteria.includes('auth')) {
      baseTestCases.unshift({
        name: 'Verify user authentication flow',
        steps: ['Navigate to login page', 'Enter credentials', 'Submit form'],
        expectedOutput: 'User is authenticated and redirected to dashboard',
        priority: 'high',
      });
    }

    if (criteria.includes('form') || criteria.includes('submit')) {
      baseTestCases.push({
        name: 'Verify form validation',
        steps: ['Attempt to submit empty form', 'Fill required fields', 'Verify submission success'],
        expectedOutput: 'Form validates correctly and submits successfully',
        priority: 'high',
      });
    }

    return baseTestCases;
  }
}
