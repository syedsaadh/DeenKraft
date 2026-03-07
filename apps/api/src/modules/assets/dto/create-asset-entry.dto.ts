import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAssetEntryDto {
  @ApiProperty({ example: 'Lecture Audio' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'assets/1/2026-03-07/uuid.mp3' })
  @IsString()
  @MinLength(1)
  storageKey: string;

  @ApiProperty({ example: 'audio/mpeg' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 'lecture.mp3' })
  @IsString()
  originalName: string;

  @ApiProperty({ example: 1024000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size: number;

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];
}
