import { IsString } from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  mimeType: string;

  @IsString()
  originalName: string;
}
