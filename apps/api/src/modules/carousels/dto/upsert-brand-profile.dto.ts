import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpsertBrandProfileDto {
  @ApiProperty({ example: 'DeenKraft' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  brandName: string;

  @ApiProperty({ example: '#1d9bf0' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{3,8}$/, {
    message: 'primaryColor must be a valid hex color (e.g. #1d9bf0)',
  })
  primaryColor: string;

  @ApiProperty({ example: '#e7e9ea' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{3,8}$/, {
    message: 'secondaryColor must be a valid hex color (e.g. #e7e9ea)',
  })
  secondaryColor: string;

  @ApiProperty({ example: 'Inter, sans-serif' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fontFamily: string;

  @ApiProperty({
    example: 'inspirational and warm',
    description: 'Tone of voice for generated content',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  tone: string;

  @ApiProperty({
    example: 'bold with urgency',
    description: 'Style for call-to-action text',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  ctaStyle: string;

  @ApiProperty({ example: 7, minimum: 3, maximum: 15 })
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(15)
  preferredSlideCount: number;

  @ApiProperty({ enum: ['minimal', 'moderate', 'detailed'] })
  @IsIn(['minimal', 'moderate', 'detailed'])
  textDensity: string;
}
