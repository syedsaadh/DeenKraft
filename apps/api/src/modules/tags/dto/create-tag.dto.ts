import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'nasheed' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}
