import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { SlideSchema, TextConstraints } from '../carousel-template.entity';

export class CreateCarouselTemplateDto {
  @ApiProperty({ example: 'Islamic Wisdom' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'Dark-themed carousel for Islamic quotes and reminders',
  })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({ example: 'islamic' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category: string;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(2)
  @Max(20)
  slideCount: number;

  @ApiProperty({ type: Object })
  @IsObject()
  coverSlideSchema: SlideSchema;

  @ApiProperty({ type: Object })
  @IsObject()
  contentSlideSchema: SlideSchema;

  @ApiProperty({ type: Object })
  @IsObject()
  endSlideSchema: SlideSchema;

  @ApiProperty({ required: false, example: 'educational' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  family?: string;

  @ApiProperty({ type: Object, required: false })
  @IsOptional()
  @IsObject()
  textConstraints?: TextConstraints;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
