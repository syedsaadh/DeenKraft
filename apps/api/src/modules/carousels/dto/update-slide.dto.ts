import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class UpdateSlideDto {
  @ApiProperty({
    type: Object,
    example: { heading: 'Updated heading', body: 'Updated body text' },
    description:
      'Partial content map — only the keys provided will be merged into the existing slide content.',
  })
  @IsObject()
  @IsNotEmpty()
  content: Record<string, string>;
}

/**
 * Runtime guard: every value in content must be a string.
 * Called in the service layer after DTO validation.
 */
export function assertStringValues(
  content: Record<string, unknown>,
): content is Record<string, string> {
  for (const [key, value] of Object.entries(content)) {
    if (typeof value !== 'string') {
      throw new Error(
        `content["${key}"] must be a string, got ${typeof value}`,
      );
    }
  }
  return true;
}
