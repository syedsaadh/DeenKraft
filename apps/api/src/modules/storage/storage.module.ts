import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3StorageService } from './s3.storage.service';
import { STORAGE_PROVIDER } from './storage.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    S3StorageService,
    {
      provide: STORAGE_PROVIDER,
      useExisting: S3StorageService,
    },
  ],
  exports: [S3StorageService, STORAGE_PROVIDER],
})
export class StorageModule {}
