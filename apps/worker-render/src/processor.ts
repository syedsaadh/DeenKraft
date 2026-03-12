import { RENDER_JOB_NAME, type RenderQueueJobPayload } from './constants';
import { logInfo } from './logger';

export interface RenderCore {
  processRenderJob: (renderJobId: string) => Promise<void>;
}

export interface QueueJobLike {
  id?: string | number;
  name: string;
  data: RenderQueueJobPayload;
}

export async function consumeRenderQueueJob(
  job: QueueJobLike,
  renderCore: RenderCore,
): Promise<'processed' | 'ignored'> {
  if (job.name !== RENDER_JOB_NAME) {
    logInfo('ignoring unknown job', {
      jobId: job.id,
      name: job.name,
    });
    return 'ignored';
  }

  await renderCore.processRenderJob(job.data.renderJobId);
  return 'processed';
}
