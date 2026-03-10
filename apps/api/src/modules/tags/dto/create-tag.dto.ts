import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'scenery' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}
