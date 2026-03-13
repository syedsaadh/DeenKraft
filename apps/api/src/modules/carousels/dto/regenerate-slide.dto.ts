import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RegenerateSlideDto {
  @ApiProperty({
    required: false,
    example: 'Make it more engaging and add an emoji',
    description:
      'Optional instructions for how to regenerate this slide. If omitted, the slide is regenerated with the original topic.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instructions?: string;
}
