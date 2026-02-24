import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestPlanService } from './test-plan.service';
import { CreateTestPlanDto, UpdateTestPlanDto, GeneratePlanDto } from './test-plan.dto';

@ApiTags('Test Plans')
@Controller('api/test-plans')
export class TestPlanController {
  constructor(private readonly testPlanService: TestPlanService) {}

  @Post()
  create(@Body() createTestPlanDto: CreateTestPlanDto) {
    return this.testPlanService.create(createTestPlanDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.testPlanService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testPlanService.findOne(id);
  }

  @Post(':id/generate')
  generatePlan(@Param('id') id: string, @Body() generatePlanDto: GeneratePlanDto) {
    return this.testPlanService.generatePlan(generatePlanDto);
  }

  @Post(':id/link-scenarios')
  linkScenarios(
    @Param('id') id: string,
    @Body() { scenarioIds }: { scenarioIds: string[] },
  ) {
    return this.testPlanService.linkScenarios(id, scenarioIds);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestPlanDto: UpdateTestPlanDto) {
    return this.testPlanService.update(id, updateTestPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testPlanService.remove(id);
  }
}
