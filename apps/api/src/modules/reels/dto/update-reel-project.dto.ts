import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TimelineTrackDto {
  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  assetId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsOptional()
  variables?: Record<string, unknown>;

  @IsOptional()
  start?: number;

  @IsOptional()
  duration?: number;
}

class TimelineDto {
  @IsOptional()
  width?: number;

  @IsOptional()
  height?: number;

  @IsOptional()
  fps?: number;

  @IsOptional()
  duration?: number;

  @IsOptional()
  tracks?: TimelineTrackDto[];
}

export class UpdateReelProjectDto {
  @ApiPropertyOptional({
    description: 'Project name',
    example: 'Updated Quran Verse Reel',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Updated timeline',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TimelineDto)
  timeline?: Record<string, unknown>;
}
