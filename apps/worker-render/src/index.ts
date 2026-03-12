import 'dotenv/config';
import { Worker } from 'bullmq';
import { createAppDataSource } from './db';
import {
  DEFAULT_RENDER_QUEUE_NAME,
  type RenderQueueJobPayload,
} from './constants';
import { logError, logInfo } from './logger';
import { Asset } from './entities/asset.entity';
import { ReelProject } from './entities/reel-project.entity';
import { RenderJob } from './entities/render-job.entity';
import { Template } from './entities/template.entity';
import { ReelRendererService } from './render/reel-renderer.service';
import { TemplateRendererService } from './render/template-renderer.service';
import { FfmpegService } from './render/ffmpeg.service';
import { S3StorageService } from './storage/s3-storage.service';
import { createHealthServer } from './health-server';
import { consumeRenderQueueJob } from './processor';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

async function bootstrap() {
  const redisHost = requiredEnv('REDIS_HOST');
  const redisPort = Number(process.env.REDIS_PORT ?? '6379');
  const redisDb = Number(process.env.REDIS_DB ?? '0');
  const redisPassword = process.env.REDIS_PASSWORD;
  const queueName = process.env.RENDER_QUEUE_NAME ?? DEFAULT_RENDER_QUEUE_NAME;
  const workerConcurrency = Math.max(
    1,
    Number(process.env.RENDER_WORKER_CONCURRENCY ?? '1'),
  );
  const healthPort = Number(process.env.WORKER_HEALTH_PORT ?? '3010');

  const state = {
    isReady: false,
    isAlive: true,
    queueName,
  };

  const healthServer = createHealthServer(healthPort, () => state);
  await healthServer.start();
  logInfo('health server started', { healthPort });

  const dataSource = createAppDataSource();
  await dataSource.initialize();

  const renderer = new ReelRendererService(
    dataSource.getRepository(ReelProject),
    dataSource.getRepository(RenderJob),
    dataSource.getRepository(Asset),
    dataSource.getRepository(Template),
    new S3StorageService(),
    new TemplateRendererService(),
    new FfmpegService(),
  );

  const worker = new Worker<RenderQueueJobPayload>(
    queueName,
    async (job) => {
      await consumeRenderQueueJob(job, renderer);
    },
    {
      connection: {
        host: redisHost,
        port: redisPort,
        db: redisDb,
        password: redisPassword,
        maxRetriesPerRequest: null,
      },
      concurrency: workerConcurrency,
    },
  );

  worker.on('ready', () => {
    state.isReady = true;
    logInfo('worker is ready', { queueName });
  });

  worker.on('completed', (job) => {
    logInfo('job completed', {
      queueJobId: job.id,
      renderJobId: job.data.renderJobId,
      projectId: job.data.projectId,
    });
  });

  worker.on('failed', (job, error) => {
    const attempts = job?.attemptsMade ?? 0;
    const maxAttempts = job?.opts.attempts ?? 1;
    const movedToFailedSet = attempts >= maxAttempts;

    logError('job failed', {
      queueJobId: job?.id,
      renderJobId: job?.data.renderJobId,
      projectId: job?.data.projectId,
      error: error.message,
      attempts,
      maxAttempts,
      movedToFailedSet,
    });
  });

  worker.on('error', (error) => {
    state.isReady = false;
    logError('worker runtime error', { error: error.message });
  });

  let isShuttingDown = false;
  const shutdown = async () => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;
    state.isReady = false;
    state.isAlive = false;

    logInfo('worker shutdown requested');
    await worker.close();
    await dataSource.destroy();
    await healthServer.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });
}

void bootstrap().catch((error: Error) => {
  logError('worker bootstrap failed', { error: error.message });
  process.exit(1);
});
