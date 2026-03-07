import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Podcast Intro Layout' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: '<h1>{{title}}</h1><p>{{subtitle}}</p>' })
  @IsString()
  @MinLength(1)
  html: string;

  @ApiPropertyOptional({ example: 'h1 { color: #fff; }' })
  @IsOptional()
  @IsString()
  css?: string;

  @ApiProperty({
    type: Object,
    example: {
      title: 'string',
      subtitle: 'string',
      author: 'string',
    },
  })
  @IsObject()
  variableSchema: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'Keep style minimal and centered.' })
  @IsOptional()
  @IsString()
  promptRecipe?: string;

  @ApiProperty({ minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  version: number;
}
