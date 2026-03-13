import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  DEFAULT_RENDER_QUEUE_NAME,
  RENDER_JOB_NAME,
  type RenderQueueJobPayload,
} from './reels-queue.constants';

@Injectable()
export class ReelsQueueService implements OnModuleDestroy {
  private readonly queueName: string;
  private queue: Queue | null = null;
  private readonly retryAttempts: number;
  private readonly retryBackoffMs: number;

  constructor(private readonly configService: ConfigService) {
    this.queueName = this.configService.get<string>(
      'RENDER_QUEUE_NAME',
      DEFAULT_RENDER_QUEUE_NAME,
    );

    const rawAttempts = Number(
      this.configService.get<string>('RENDER_JOB_RETRY_ATTEMPTS', '5'),
    );
    const rawBackoffMs = Number(
      this.configService.get<string>('RENDER_JOB_RETRY_BACKOFF_MS', '2000'),
    );

    this.retryAttempts = Math.max(1, Math.min(10, rawAttempts));
    this.retryBackoffMs = Math.max(250, rawBackoffMs);
  }

  private getQueue(): Queue {
    if (!this.queue) {
      const redisHost = this.configService.get<string>(
        'REDIS_HOST',
        '127.0.0.1',
      );
      const redisPort = Number(
        this.configService.get<string>('REDIS_PORT', '6379'),
      );
      const redisDb = Number(this.configService.get<string>('REDIS_DB', '0'));
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

      this.queue = new Queue(this.queueName, {
        connection: {
          host: redisHost,
          port: redisPort,
          db: redisDb,
          password: redisPassword,
          maxRetriesPerRequest: null,
        },
      });
    }

    return this.queue;
  }

  async enqueueRenderJob(payload: RenderQueueJobPayload): Promise<void> {
    await this.getQueue().add(RENDER_JOB_NAME, payload, {
      attempts: this.retryAttempts,
      backoff: {
        type: 'exponential',
        delay: this.retryBackoffMs,
      },
      removeOnComplete: 1000,
      removeOnFail: false,
    });
  }

  async getQueueHealth() {
    try {
      const queue = this.getQueue();
      const client = await queue.client;
      const pingResponse = await client.ping();
      const counts = await queue.getJobCounts(
        'active',
        'waiting',
        'delayed',
        'failed',
        'completed',
      );

      return {
        queueName: this.queueName,
        status: pingResponse === 'PONG' ? 'ready' : 'degraded',
        retryPolicy: {
          attempts: this.retryAttempts,
          backoffMs: this.retryBackoffMs,
        },
        counts,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      return {
        queueName: this.queueName,
        status: 'down',
        retryPolicy: {
          attempts: this.retryAttempts,
          backoffMs: this.retryBackoffMs,
        },
        counts: {
          active: 0,
          waiting: 0,
          delayed: 0,
          failed: 0,
          completed: 0,
        },
        error: message,
      };
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
    }
  }
}
