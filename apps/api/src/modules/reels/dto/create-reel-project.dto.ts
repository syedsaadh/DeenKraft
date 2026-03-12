import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
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

  @IsObject()
  @IsOptional()
  variables?: Record<string, unknown>;

  @IsNumber()
  @Min(0)
  start: number;

  @IsNumber()
  @Min(0)
  duration: number;
}

class TimelineDto {
  @IsInt()
  @Min(1)
  width: number;

  @IsInt()
  @Min(1)
  height: number;

  @IsInt()
  @Min(1)
  fps: number;

  @IsNumber()
  @Min(0)
  duration: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineTrackDto)
  tracks: TimelineTrackDto[];
}

export class CreateReelProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'Quran Verse Reel',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiProperty({
    type: Object,
    description: 'Timeline defining video composition',
    example: {
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 15,
      tracks: [
        {
          type: 'video',
          assetId: 'clip-id',
          start: 0,
          duration: 15,
        },
        {
          type: 'overlay',
          templateId: 'template-id',
          variables: {
            quote: 'Allah is Most Merciful',
            author: 'Quran 39:53',
          },
          start: 2,
          duration: 8,
        },
      ],
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => TimelineDto)
  timeline: Record<string, unknown>;
}
