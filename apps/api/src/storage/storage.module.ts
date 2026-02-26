import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { STORAGE_PROVIDER } from './storage.constants';
import { S3StorageService } from './s3.storage.service';

@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: () =>
        new S3Client({
          region: process.env.S3_REGION,
          endpoint: process.env.S3_ENDPOINT,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY!,
            secretAccessKey: process.env.S3_SECRET_KEY!,
          },
          forcePathStyle: true,
        }),
    },
    {
      provide: STORAGE_PROVIDER,
      useClass: S3StorageService,
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
