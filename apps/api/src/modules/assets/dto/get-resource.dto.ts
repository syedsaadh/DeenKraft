import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetResourceDto {
  @ApiPropertyOptional({
    enum: ['presignedurl', 'stream'],
    default: 'presignedurl',
  })
  @IsOptional()
  @IsIn(['presignedurl', 'stream'])
  mode: 'presignedurl' | 'stream' = 'presignedurl';

  @ApiPropertyOptional({ example: 3600, default: 3600 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(86400)
  expiresInSeconds = 3600;
}
