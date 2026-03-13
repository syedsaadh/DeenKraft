import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePreferencesDto {
  @ApiProperty({ required: false, description: 'UUID of preferred template' })
  @IsOptional()
  @IsUUID()
  preferredTemplateId?: string;

  @ApiProperty({
    required: false,
    example: 'Inspirational & warm',
    description: 'Default tone for AI generation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  preferredTone?: string;

  @ApiProperty({
    required: false,
    example: 7,
    description: 'Default number of slides',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(15)
  preferredSlideCount?: number;

  @ApiProperty({
    required: false,
    example: 'Follow for daily reminders',
    description: 'Default CTA style for end slides',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  ctaStyle?: string;

  @ApiProperty({
    required: false,
    enum: ['minimal', 'moderate', 'detailed'],
    description: 'Default text density',
  })
  @IsOptional()
  @IsIn(['minimal', 'moderate', 'detailed'])
  textDensity?: 'minimal' | 'moderate' | 'detailed';

  @ApiProperty({
    required: false,
    example: 'deenkraft',
    description: 'Instagram handle for preview',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  instagramHandle?: string;
}
