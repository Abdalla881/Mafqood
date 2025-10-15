// update-report.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateItemDto } from '../../items/dto/update-item.dto';

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsEnum(['lost', 'found'])
  readonly type?: 'lost' | 'found';

  @IsOptional()
  @IsString()
  readonly location?: string;

  @IsOptional()
  @IsDateString()
  readonly date?: Date;

  @IsOptional()
  @IsString()
  readonly contactInfo?: string;

  @IsOptional()
  @IsString()
  readonly reward?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateItemDto)
  item?: UpdateItemDto;
}
