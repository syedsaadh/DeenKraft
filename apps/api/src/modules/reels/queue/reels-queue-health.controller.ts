import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReelsQueueService } from './reels-queue.service';

@ApiTags('Health')
@Controller('health')
export class ReelsQueueHealthController {
  constructor(private readonly reelsQueueService: ReelsQueueService) {}

  @Get('queue')
  @ApiOperation({
    summary: 'Queue readiness and failed job observability for reel rendering',
  })
  async queueHealth() {
    return this.reelsQueueService.getQueueHealth();
  }
}
