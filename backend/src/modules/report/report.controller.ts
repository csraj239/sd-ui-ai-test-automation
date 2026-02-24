import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';

@ApiTags('Reports')
@Controller('api/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  getAllReports() {
    return this.reportService.getAllReports();
  }

  @Get('stats/scenarios')
  getScenarioStats() {
    return this.reportService.getScenarioStats();
  }

  @Get(':id')
  getReportById(@Param('id') id: string) {
    return this.reportService.getReportById(id);
  }

  @Get('scenario/:scenarioId')
  getScenarioExecutionHistory(@Param('scenarioId') scenarioId: string) {
    return this.reportService.getScenarioExecutionHistory(scenarioId);
  }

  @Post('generate')
  generateExecutionReport(@Body() { executionIds }: { executionIds: string[] }) {
    return this.reportService.generateExecutionReport(executionIds);
  }
}
