import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReelProject } from './entities/reel-project.entity';
import { RenderJob } from './entities/render-job.entity';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { ReelsQueueModule } from './queue/reels-queue.module';
import { ReelsQueueHealthController } from './queue/reels-queue-health.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReelProject, RenderJob]),
    ReelsQueueModule,
  ],
  controllers: [ReelsController, ReelsQueueHealthController],
  providers: [ReelsService],
  exports: [ReelsService],
})
export class ReelsModule {}
