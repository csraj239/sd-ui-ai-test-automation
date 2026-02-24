import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsArray, Allow } from 'class-validator';
import { ScriptScenario } from '../../database/entities';

export class CreateScriptScenarioDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  playwrightScript?: string;

  @IsOptional()
  @IsArray()
  steps?: string[];

  @IsOptional()
  @IsString()
  expectedOutput?: string;

  @IsOptional()
  @IsString()
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class UpdateScriptScenarioDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  playwrightScript?: string;

  @IsOptional()
  @IsArray()
  steps?: string[];

  @IsOptional()
  @IsString()
  expectedOutput?: string;

  @IsOptional()
  @IsString()
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  executionCount?: number;

  @IsOptional()
  passCount?: number;

  @IsOptional()
  failCount?: number;
}

@Injectable()
export class ScriptScenarioService {
  constructor(
    @InjectRepository(ScriptScenario)
    private scriptScenarioRepository: Repository<ScriptScenario>,
  ) {}

  async create(createScriptScenarioDto: CreateScriptScenarioDto): Promise<ScriptScenario> {
    const scenario = this.scriptScenarioRepository.create(createScriptScenarioDto);
    return this.scriptScenarioRepository.save(scenario);
  }

  async findAll(projectId?: string): Promise<ScriptScenario[]> {
    const query = this.scriptScenarioRepository.createQueryBuilder('scenario');
    if (projectId) {
      query.where('scenario.projectId = :projectId', { projectId });
    }
    // Only return scenarios with generated scripts
    query.andWhere('scenario.playwrightScript IS NOT NULL');
    return query.orderBy('scenario.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<ScriptScenario | null> {
    return this.scriptScenarioRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updateScriptScenarioDto: UpdateScriptScenarioDto): Promise<ScriptScenario | null> {
    await this.scriptScenarioRepository.update(id, updateScriptScenarioDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.scriptScenarioRepository.delete(id);
  }

  async updateScript(id: string, script: string): Promise<ScriptScenario | null> {
    return this.update(id, { playwrightScript: script });
  }

  async incrementExecutionCount(id: string, passed: boolean): Promise<void> {
    const scenario = await this.findOne(id);
    if (!scenario) throw new Error('ScriptScenario not found');
    scenario.executionCount++;
    if (passed) {
      scenario.passCount++;
    } else {
      scenario.failCount++;
    }
    await this.scriptScenarioRepository.save(scenario);
  }
}
