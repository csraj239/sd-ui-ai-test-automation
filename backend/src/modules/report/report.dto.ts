import { IsString, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsOptional()
  description?: string;
}
