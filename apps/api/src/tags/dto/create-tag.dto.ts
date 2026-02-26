import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Islamic Art' })
  @IsString()
  @MinLength(2)
  name: string;
}
