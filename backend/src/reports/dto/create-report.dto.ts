import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItemDto } from '../../items/dto/create-item.dto';

export class CreateReportDto {
  @IsString()
  readonly title: string;

  @IsEnum(['lost', 'found'])
  readonly type: 'lost' | 'found';

  @IsString()
  readonly location: string;

  @IsDateString()
  readonly date: Date;

  @IsString()
  readonly contactInfo: string;

  @IsOptional()
  @IsString()
  readonly reward?: string;
  @ValidateNested()
  @Type(() => CreateItemDto)
  readonly item: CreateItemDto;
}
