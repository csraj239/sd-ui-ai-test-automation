import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateTestPlanDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  navigationFlow: string;

  @IsString()
  acceptanceCriteria: string;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsUUID()
  projectId: string;
}

export class UpdateTestPlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  navigationFlow?: string;

  @IsString()
  @IsOptional()
  acceptanceCriteria?: string;

  @IsString()
  @IsOptional()
  prompt?: string;
}

export class GeneratePlanDto {
  @IsString()
  navigationFlow: string;

  @IsString()
  acceptanceCriteria: string;

  @IsString()
  @IsOptional()
  prompt?: string;
}
