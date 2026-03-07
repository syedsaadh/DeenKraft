import { Readable } from 'stream';

export interface UploadObjectInput {
  key: string;
  body: Buffer;
  contentType?: string;
}

export interface StorageProvider {
  uploadObject(input: UploadObjectInput): Promise<void>;
  deleteObject(key: string): Promise<void>;
  generateDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  objectExists(key: string): Promise<boolean>;
  getObjectStream(key: string): Promise<Readable>;
}
