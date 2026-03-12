import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReelProject } from './entities/reel-project.entity';
import { RenderJob } from './entities/render-job.entity';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReelProject, RenderJob])],
  controllers: [ReelsController],
  providers: [ReelsService],
  exports: [ReelsService],
})
export class ReelsModule {}
