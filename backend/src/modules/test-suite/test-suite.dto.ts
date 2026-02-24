import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateTestSuiteDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  scenarioIds?: string[];
}

export class UpdateTestSuiteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddScenariosDto {
  @IsArray()
  @IsUUID('4', { each: true })
  scenarioIds: string[];
}
