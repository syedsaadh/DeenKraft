import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { StorageProvider, UploadObjectInput } from './storage.interface';

@Injectable()
export class S3StorageService implements StorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
      '',
    );
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME', '');

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
      throw new InternalServerErrorException(
        'AWS_BUCKET_NAME is not configured',
      );
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

  async deleteObject(key: string): Promise<void> {
    if (!this.bucketName) {
      throw new InternalServerErrorException(
        'AWS_BUCKET_NAME is not configured',
      );
    }

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  async generateDownloadUrl(
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    if (!this.bucketName) {
      throw new InternalServerErrorException(
        'AWS_BUCKET_NAME is not configured',
      );
    }

    return getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  async objectExists(key: string): Promise<boolean> {
    if (!this.bucketName) {
      throw new InternalServerErrorException(
        'AWS_BUCKET_NAME is not configured',
      );
    }

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async getObjectStream(key: string): Promise<Readable> {
    if (!this.bucketName) {
      throw new InternalServerErrorException(
        'AWS_BUCKET_NAME is not configured',
      );
    }

    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    if (!response.Body || !(response.Body instanceof Readable)) {
      throw new InternalServerErrorException('Unable to open object stream');
    }

    return response.Body;
  }
}
