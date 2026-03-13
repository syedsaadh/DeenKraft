import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCarouselDto {
  @ApiProperty({ example: 'Friday Sunnahs' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: '5 Sunnahs to practice every Friday' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  topic: string;

  @ApiProperty({ description: 'ID of the carousel template to use' })
  @IsUUID()
  templateId: string;
}
