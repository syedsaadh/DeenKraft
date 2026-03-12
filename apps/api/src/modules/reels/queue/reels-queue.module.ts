import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReelsQueueService } from './reels-queue.service';

@Module({
  imports: [ConfigModule],
  providers: [ReelsQueueService],
  exports: [ReelsQueueService],
})
export class ReelsQueueModule {}
