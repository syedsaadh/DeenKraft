import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import type { StorageProvider, UploadObjectInput } from './storage.interface';

export class S3StorageService implements StorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    const region = process.env.AWS_REGION ?? 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? '';
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? '';
    this.bucketName = process.env.AWS_BUCKET_NAME ?? '';

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadObject(input: UploadObjectInput): Promise<void> {
    if (!this.bucketName) {
      throw new Error('AWS_BUCKET_NAME is not configured');
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
  }

  async getObjectStream(key: string): Promise<Readable> {
    if (!this.bucketName) {
      throw new Error('AWS_BUCKET_NAME is not configured');
    }

    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    if (!response.Body || !(response.Body instanceof Readable)) {
      throw new Error('Unable to open object stream');
    }

    return response.Body;
  }
}
