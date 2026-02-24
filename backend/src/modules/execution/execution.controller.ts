import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import { CreateExecutionDto, ExecuteScenarioDto, ExecuteSuiteDto } from './execution.dto';

@ApiTags('Execution')
@Controller('api/executions')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  create(@Body() createExecutionDto: CreateExecutionDto) {
    return this.executionService.create(createExecutionDto);
  }

  @Post('scenario')
  executeScenario(@Body() executeScenarioDto: ExecuteScenarioDto) {
    return this.executionService.executeScenario(executeScenarioDto);
  }

  @Post('suite')
  executeSuite(@Body() executeSuiteDto: ExecuteSuiteDto) {
    return this.executionService.executeSuite(executeSuiteDto);
  }

  @Get(':id')
  getExecutionStatus(@Param('id') id: string) {
    return this.executionService.getExecutionStatus(id);
  }

  @Get()
  getExecutionHistory(@Query('scenarioId') scenarioId?: string) {
    return this.executionService.getExecutionHistory(scenarioId);
  }
}
