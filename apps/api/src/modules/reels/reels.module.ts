import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from '../assets/asset.entity';
import { StorageModule } from '../storage/storage.module';
import { TemplateRendererService } from '../templates/template-renderer.service';
import { Template } from '../templates/template.entity';
import { ReelProject } from './entities/reel-project.entity';
import { RenderJob } from './entities/render-job.entity';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { FfmpegService } from './renderer/ffmpeg.service';
import { ReelRendererService } from './renderer/reel-renderer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReelProject, RenderJob, Asset, Template]),
    StorageModule,
  ],
  controllers: [ReelsController],
  providers: [
    ReelsService,
    FfmpegService,
    ReelRendererService,
    TemplateRendererService,
  ],
  exports: [ReelsService],
})
export class ReelsModule {}
