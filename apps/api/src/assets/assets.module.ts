import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './asset.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { StorageModule } from '../storage/storage.module';
import { TagsModule } from 'src/tags/tag.module';

@Module({
  imports: [TypeOrmModule.forFeature([Asset]), StorageModule, TagsModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
