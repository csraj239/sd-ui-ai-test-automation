import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestExecution } from '../../database/entities';
import { Logger } from '@nestjs/common';

@Processor('test-execution')
export class ExecutionProcessor {
  private readonly logger = new Logger(ExecutionProcessor.name);

  constructor(
    @InjectRepository(TestExecution)
    private executionRepository: Repository<TestExecution>,
  ) {}

  @Process('run-scenario')
  async runScenario(job: Job) {
    const { executionId, scenarioId, script, headless } = job.data;

    try {
      this.logger.log(`Starting execution ${executionId} for scenario ${scenarioId}`);

      // Update execution status to running
      await this.executionRepository.update(executionId, {
        status: 'running',
      });

      // TODO: Execute the Playwright script via executor service
      // For now, simulate execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update execution status to passed (placeholder)
      await this.executionRepository.update(executionId, {
        status: 'passed',
        completedAt: new Date(),
        duration: 2000,
      });

      this.logger.log(`Execution ${executionId} completed successfully`);
      return { success: true, executionId };
    } catch (error) {
      this.logger.error(`Execution ${executionId} failed: ${(error as any).message}`);

      await this.executionRepository.update(executionId, {
        status: 'failed',
        errorMessage: (error as any).message,
        completedAt: new Date(),
      });

      throw error;
    }
  }
}
