import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarouselProject } from '../carousels/carousel-project.entity';
import { StorageModule } from '../storage/storage.module';
import { UploadAsset } from './upload-asset.entity';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadAsset, CarouselProject]),
    StorageModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
