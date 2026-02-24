import { IsString, IsOptional, IsUUID, IsArray, IsEnum } from 'class-validator';

export class CreateTestScenarioDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  playwrightScript?: string;

  @IsArray()
  @IsOptional()
  steps?: string[];

  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @IsEnum(['high', 'medium', 'low'])
  @IsOptional()
  priority?: 'high' | 'medium' | 'low';

  @IsUUID()
  @IsOptional()
  testPlanId?: string;
}

export class UpdateTestScenarioDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  playwrightScript?: string;

  @IsArray()
  @IsOptional()
  steps?: string[];

  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @IsEnum(['high', 'medium', 'low'])
  @IsOptional()
  priority?: 'high' | 'medium' | 'low';
}

export class GenerateScriptDto {
  @IsString()
  scenarioName: string;

  @IsString()
  scenarioDescription: string;

  @IsUUID()
  @IsOptional()
  testPlanId?: string;
}
