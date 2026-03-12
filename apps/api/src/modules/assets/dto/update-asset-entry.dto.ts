import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAssetEntryDto {
  @ApiPropertyOptional({ example: 'Updated Asset Name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ type: [Number], example: [2, 3] })
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];
}
