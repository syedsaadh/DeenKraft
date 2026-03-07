import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class PreviewTemplateDto {
  @ApiProperty({
    type: Object,
    example: {
      title: 'Example title',
      subtitle: 'Example subtitle',
    },
  })
  @IsObject()
  variables: Record<string, unknown>;
}
