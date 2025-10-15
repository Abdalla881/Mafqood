import { Type } from 'class-transformer';
import { IsInt, isInt, IsOptional, IsString, Min, min } from 'class-validator';

export class QueryOptionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 3;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
