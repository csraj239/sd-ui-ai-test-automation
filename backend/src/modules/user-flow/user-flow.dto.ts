import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateUserFlowDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  projectId!: string;
}

export class UpdateUserFlowDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateUserFlowStepDto {
  @IsNumber()
  stepNumber!: number;

  @IsString()
  action!: string; // Launch, Click, Enter, Hover, verifyText, Pause, CloseBrowser

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  locator?: string;

  @IsString()
  @IsOptional()
  data?: string;
}

export class UpdateUserFlowStepDto {
  @IsNumber()
  @IsOptional()
  stepNumber?: number;

  @IsString()
  @IsOptional()
  action?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  locator?: string;

  @IsString()
  @IsOptional()
  data?: string;
}

export class ExecuteUserFlowDto {
  @IsString()
  @IsOptional()
  appUrl?: string;

  @IsOptional()
  headless?: boolean;
}

export class ExecuteUserFlowResponseDto {
  success!: boolean;
  output?: string;
  error?: string;
  dom?: string;
  accessibility?: string;
  screenshots?: string[];
  testCases?: any[];
}
