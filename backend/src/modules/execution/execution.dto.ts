import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateExecutionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  scenarioIds: string[];
}

export class ExecuteScenarioDto {
  @IsUUID()
  scenarioId: string;

  @IsOptional()
  headless?: boolean;
}

export class ExecuteSuiteDto {
  @IsUUID()
  suiteId: string;

  @IsOptional()
  headless?: boolean;
}
