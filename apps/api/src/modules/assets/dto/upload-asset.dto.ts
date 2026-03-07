import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const transformTagIds = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item));
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.split(',').map((item) => Number(item.trim()));
  }

  return [];
};

export class UploadAssetDto {
  @ApiProperty({ example: 'Ramadan Intro Clip' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    type: [Number],
    description: 'Optional tag ids; supports comma-separated string or repeated fields.',
    example: [1, 2, 3],
  })
  @IsOptional()
  @Transform(transformTagIds)
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  tagIds?: number[];
}
