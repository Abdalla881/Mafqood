import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateItemDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;

  @IsString()
  readonly category: string;

  @IsOptional()
  @IsString()
  readonly brand?: string;

  @IsOptional()
  @IsString()
  readonly color?: string;

  @IsOptional()
  @IsString()
  readonly uniqueMarks?: string;

  @IsOptional()
  @IsArray()
  readonly images?: string[];
}
