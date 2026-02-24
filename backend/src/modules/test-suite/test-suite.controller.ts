import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestSuiteService } from './test-suite.service';
import { CreateTestSuiteDto, UpdateTestSuiteDto, AddScenariosDto } from './test-suite.dto';

@ApiTags('Test Suites')
@Controller('api/test-suites')
export class TestSuiteController {
  constructor(private readonly testSuiteService: TestSuiteService) {}

  @Post()
  create(@Body() createTestSuiteDto: CreateTestSuiteDto) {
    return this.testSuiteService.create(createTestSuiteDto);
  }

  @Get()
  findAll() {
    return this.testSuiteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testSuiteService.findOne(id);
  }

  @Post(':id/scenarios')
  addScenarios(@Param('id') id: string, @Body() addScenariosDto: AddScenariosDto) {
    return this.testSuiteService.addScenarios(id, addScenariosDto);
  }

  @Delete(':id/scenarios/:scenarioId')
  removeScenario(@Param('id') id: string, @Param('scenarioId') scenarioId: string) {
    return this.testSuiteService.removeScenario(id, scenarioId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestSuiteDto: UpdateTestSuiteDto) {
    return this.testSuiteService.update(id, updateTestSuiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testSuiteService.remove(id);
  }
}
