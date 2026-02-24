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
import { TestScenarioService } from './test-scenario.service';
import { CreateTestScenarioDto, UpdateTestScenarioDto, GenerateScriptDto } from './test-scenario.dto';

@ApiTags('Test Scenarios')
@Controller('api/test-scenarios')
export class TestScenarioController {
  constructor(private readonly testScenarioService: TestScenarioService) {}

  @Post()
  create(@Body() createTestScenarioDto: CreateTestScenarioDto) {
    return this.testScenarioService.create(createTestScenarioDto);
  }

  @Get()
  findAll(@Query('testPlanId') testPlanId?: string) {
    return this.testScenarioService.findAll(testPlanId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testScenarioService.findOne(id);
  }

  @Post('generate-script')
  generateScript(@Body() generateScriptDto: GenerateScriptDto) {
    return this.testScenarioService.generateScript(generateScriptDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestScenarioDto: UpdateTestScenarioDto) {
    return this.testScenarioService.update(id, updateTestScenarioDto);
  }

  @Patch(':id/script')
  updateScript(@Param('id') id: string, @Body() { script }: { script: string }) {
    return this.testScenarioService.updateScript(id, script);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testScenarioService.remove(id);
  }
}
