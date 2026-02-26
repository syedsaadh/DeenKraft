import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @ApiProperty()
  storageKey: string;

  @IsString()
  @ApiProperty()
  mimeType: string;

  @IsString()
  @ApiProperty()
  originalName: string;

  @IsNumber()
  @ApiProperty()
  size: number;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String], required: false })
  tags?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'clip | audio' })
  type?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  duration?: number;
}
