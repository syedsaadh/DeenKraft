import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://localhost:9000',
    credentials: {
      accessKeyId: 'minio',
      secretAccessKey: 'minio123',
    },
    forcePathStyle: true,
  });

  private bucket = 'assets';

  async generateUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 300 }); // 5 minutes
  }

  async generateDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 300 });
  }
}
