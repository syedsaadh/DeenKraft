import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @ApiProperty({ example: 'clip' })
  type: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 120, required: false })
  duration?: number;

  @IsString()
  @ApiProperty({ example: 'videos/test.mp4' })
  storage_key: string;

  @IsOptional()
  @ApiProperty({ type: Object, required: false })
  metadata?: any;
}