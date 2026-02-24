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
import { ScriptScenarioService, CreateScriptScenarioDto, UpdateScriptScenarioDto } from './script-scenario.service';

@ApiTags('Script Scenarios')
@Controller('api/script-scenarios')
export class ScriptScenarioController {
  constructor(private readonly scriptScenarioService: ScriptScenarioService) {}

  @Post()
  create(@Body() createScriptScenarioDto: CreateScriptScenarioDto) {
    return this.scriptScenarioService.create(createScriptScenarioDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.scriptScenarioService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scriptScenarioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScriptScenarioDto: UpdateScriptScenarioDto) {
    return this.scriptScenarioService.update(id, updateScriptScenarioDto);
  }

  @Patch(':id/script')
  updateScript(@Param('id') id: string, @Body() { script }: { script: string }) {
    return this.scriptScenarioService.updateScript(id, script);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scriptScenarioService.remove(id);
  }
}
