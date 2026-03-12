import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class RenderTemplateDto {
  @ApiProperty({
    type: Object,
    example: {
      title: 'Islamic Knowledge',
      subtitle: 'Seek knowledge',
    },
  })
  @IsObject()
  variables: Record<string, unknown>;
}
