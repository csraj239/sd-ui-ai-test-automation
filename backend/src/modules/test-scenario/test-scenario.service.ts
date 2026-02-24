import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestScenario } from '../../database/entities';
import { CreateTestScenarioDto, UpdateTestScenarioDto, GenerateScriptDto } from './test-scenario.dto';

@Injectable()
export class TestScenarioService {
  constructor(
    @InjectRepository(TestScenario)
    private testScenarioRepository: Repository<TestScenario>,
  ) {}

  async create(createTestScenarioDto: CreateTestScenarioDto): Promise<TestScenario> {
    const scenario = this.testScenarioRepository.create(
      createTestScenarioDto,
    );
    return this.testScenarioRepository.save(scenario);
  }

  async findAll(testPlanId?: string): Promise<TestScenario[]> {
    const query = this.testScenarioRepository.createQueryBuilder('scenario');
    if (testPlanId) {
      query.where('scenario.testPlanId = :testPlanId', { testPlanId });
    }
    return query.getMany();
  }

  async findOne(id: string): Promise<TestScenario | null> {
    return this.testScenarioRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updateTestScenarioDto: UpdateTestScenarioDto): Promise<TestScenario | null> {
    await this.testScenarioRepository.update(id, updateTestScenarioDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.testScenarioRepository.delete(id);
  }

  async generateScript(generateScriptDto: GenerateScriptDto): Promise<any> {
    // This will call the AI Generator agent
    const script = await this.callGeneratorAgent(generateScriptDto);
    return {
      success: true,
      script: script,
    };
  }

  async updateScript(id: string, script: string): Promise<TestScenario | null> {
    return this.update(id, { playwrightScript: script });
  }

  async incrementExecutionCount(id: string, passed: boolean): Promise<void> {
    const scenario = await this.findOne(id);
    if (!scenario) throw new Error('TestScenario not found');
    scenario.executionCount++;
    if (passed) {
      scenario.passCount++;
    } else {
      scenario.failCount++;
    }
    await this.testScenarioRepository.save(scenario);
  }

  private async callGeneratorAgent(generateScriptDto: GenerateScriptDto): Promise<string> {
    // TODO: Integrate with Azure OpenAI to call the Generator Agent
    // This is a placeholder that returns a sample Playwright script
    return `
import { test, expect } from '@playwright/test';

test('${generateScriptDto.scenarioName}', async ({ page }) => {
  // Navigate to application
  await page.goto(process.env.APP_URL || 'https://www.saucedemo.com');
  
  // Perform test actions
  // Add your test steps here
  
  // Verify results
  // Add your assertions here
});
    `;
  }
}
