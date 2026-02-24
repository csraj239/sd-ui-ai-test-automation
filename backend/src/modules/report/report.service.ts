import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionReport, TestExecution } from '../../database/entities';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ExecutionReport)
    private reportRepository: Repository<ExecutionReport>,
    @InjectRepository(TestExecution)
    private executionRepository: Repository<TestExecution>,
  ) {}

  async getAllReports(): Promise<ExecutionReport[]> {
    return this.reportRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getReportById(id: string): Promise<ExecutionReport | null> {
    return this.reportRepository.findOne({
      where: { id },
    });
  }

  async getScenarioStats(): Promise<any> {
    // Get aggregated stats for all scenarios
    return {
      totalRuns: 0,
      passRate: 0,
      failRate: 0,
      scenarios: [],
    };
  }

  async generateExecutionReport(executionIds: string[]): Promise<ExecutionReport> {
    if (executionIds.length === 0) {
      throw new Error('At least one execution ID is required');
    }
    const executions = await this.executionRepository.find({
      where: executionIds.map(id => ({ id } as any)),
    });

    const totalTests = executions.length;
    const passedTests = executions.filter((e) => e.status === 'passed').length;
    const failedTests = executions.filter((e) => e.status === 'failed').length;
    const skippedTests = executions.filter((e) => e.status === 'skipped').length;

    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const totalDuration = executions.reduce((sum, e) => sum + (e.duration || 0), 0);

    const report = this.reportRepository.create({
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      successRate,
      totalDuration,
      summary: `Test Summary: ${passedTests} passed, ${failedTests} failed, ${skippedTests} skipped out of ${totalTests} tests`,
    });

    return this.reportRepository.save(report);
  }

  async getScenarioExecutionHistory(scenarioId: string): Promise<any> {
    const executions = await this.executionRepository.find({
      where: { scenarioId },
      order: { startedAt: 'DESC' },
    });

    const totalExecutions = executions.length;
    const passCount = executions.filter((e) => e.status === 'passed').length;
    const failCount = executions.filter((e) => e.status === 'failed').length;

    return {
      scenarioId,
      totalExecutions,
      passCount,
      failCount,
      passRate: totalExecutions > 0 ? ((passCount / totalExecutions) * 100).toFixed(2) : 0,
      executions,
    };
  }
}
