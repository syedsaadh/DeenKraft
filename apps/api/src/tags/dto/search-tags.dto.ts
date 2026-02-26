import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchTagsDto {
  @ApiPropertyOptional({ example: 'isl' })
  @IsOptional()
  @IsString()
  query?: string;
}
