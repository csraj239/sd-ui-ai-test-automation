import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TestExecution, TestScenario, TestSuite } from '../../database/entities';
import { CreateExecutionDto, ExecuteScenarioDto, ExecuteSuiteDto } from './execution.dto';

@Injectable()
export class ExecutionService {
  constructor(
    @InjectRepository(TestExecution)
    private executionRepository: Repository<TestExecution>,
    @InjectRepository(TestScenario)
    private scenarioRepository: Repository<TestScenario>,
    @InjectRepository(TestSuite)
    private suiteRepository: Repository<TestSuite>,
    @InjectQueue('test-execution') private executionQueue: Queue,
  ) {}

  async create(createExecutionDto: CreateExecutionDto): Promise<any> {
    // Create execution list (placeholder)
    return {
      id: 'exec-' + Date.now(),
      ...createExecutionDto,
      status: 'created',
    };
  }

  async executeScenario(executeScenarioDto: ExecuteScenarioDto): Promise<TestExecution> {
    const scenario = await this.scenarioRepository.findOne({
      where: { id: executeScenarioDto.scenarioId },
    });
    if (!scenario) throw new Error('Scenario not found');

    // Create execution record
    const execution = this.executionRepository.create({
      status: 'pending',
      scenarioId: executeScenarioDto.scenarioId,
    });

    const savedExecution = await this.executionRepository.save(execution);

    // Queue the execution job
    await this.executionQueue.add(
      'run-scenario',
      {
        executionId: savedExecution.id,
        scenarioId: executeScenarioDto.scenarioId,
        script: scenario.playwrightScript,
        headless: executeScenarioDto.headless !== false,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    return savedExecution;
  }

  async executeSuite(executeSuiteDto: ExecuteSuiteDto): Promise<any> {
    const suite = await this.suiteRepository.findOne({
      where: { id: executeSuiteDto.suiteId },
      relations: ['testScenarios'],
    });
    if (!suite) throw new Error('Suite not found');

    const executions = [];
    for (const scenario of suite.testScenarios) {
      const execution = await this.executeScenario({
        scenarioId: scenario.id,
        headless: executeSuiteDto.headless !== false,
      });
      executions.push(execution);
    }

    return {
      suiteId: executeSuiteDto.suiteId,
      executions,
      totalScenarios: suite.testScenarios.length,
    };
  }

  async getExecutionStatus(id: string): Promise<TestExecution | null> {
    return this.executionRepository.findOne({
      where: { id },
      relations: ['testScenario', 'report'],
    });
  }

  async getExecutionHistory(scenarioId?: string): Promise<TestExecution[]> {
    const query = this.executionRepository.createQueryBuilder('execution');
    if (scenarioId) {
      query.where('execution.scenarioId = :scenarioId', { scenarioId });
    }
    return query.orderBy('execution.startedAt', 'DESC').getMany();
  }
}
