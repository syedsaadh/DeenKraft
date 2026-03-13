import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SlideContentDto {
  @ApiProperty({ enum: ['cover', 'content', 'end'] })
  @IsIn(['cover', 'content', 'end'])
  slideType: string;

  @ApiProperty({ type: Object })
  @IsObject()
  content: Record<string, string>;
}

export class UpdateCarouselDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  topic?: string;

  @ApiProperty({ required: false, type: [SlideContentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlideContentDto)
  slides?: SlideContentDto[];
}
