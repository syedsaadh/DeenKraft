import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateContentDto {
  @ApiProperty({ example: '5 Sunnahs to practice every Friday' })
  @IsString()
  @MinLength(1)
  topic: string;

  @ApiProperty({
    required: false,
    example: 7,
    description: 'Override default slide count from template',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(15)
  slideCount?: number;

  @ApiProperty({
    required: false,
    example: 'Young Muslim professionals aged 20-35',
    description: 'Target audience for tone and vocabulary tuning',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  audience?: string;

  @ApiProperty({
    required: false,
    example: 'inspirational and warm',
    description:
      'Tone of voice — overrides brand profile tone for this generation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tone?: string;

  @ApiProperty({
    required: false,
    example: 'Follow for daily Islamic reminders',
    description:
      'Call-to-action goal for the end slide — overrides brand ctaStyle',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  ctaGoal?: string;

  @ApiProperty({
    required: false,
    example: 'detailed',
    enum: ['minimal', 'moderate', 'detailed'],
    description:
      'How much text to generate per slide. "detailed" produces longer, richer body copy.',
  })
  @IsOptional()
  @IsString()
  @IsIn(['minimal', 'moderate', 'detailed'])
  textDensity?: 'minimal' | 'moderate' | 'detailed';
}
