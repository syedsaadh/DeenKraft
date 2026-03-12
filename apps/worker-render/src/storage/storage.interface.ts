import { Readable } from 'stream';

export interface UploadObjectInput {
  key: string;
  body: Buffer;
  contentType?: string;
}

export interface StorageProvider {
  uploadObject(input: UploadObjectInput): Promise<void>;
  getObjectStream(key: string): Promise<Readable>;
}
