import {
  consumeRenderQueueJob,
  type QueueJobLike,
  type RenderCore,
} from './processor';
import { RENDER_JOB_NAME } from './constants';

describe('queue consume flow (integration style)', () => {
  it('consumes producer payload and calls render core', async () => {
    const renderCore: RenderCore = {
      processRenderJob: jest.fn().mockResolvedValue(undefined),
    };

    const job: QueueJobLike = {
      id: 'queue-job-1',
      name: RENDER_JOB_NAME,
      data: {
        renderJobId: 'render-job-1',
        projectId: 'project-1',
      },
    };

    const result = await consumeRenderQueueJob(job, renderCore);

    expect(result).toBe('processed');
    expect(renderCore.processRenderJob).toHaveBeenCalledWith('render-job-1');
  });

  it('ignores unknown job names safely', async () => {
    const renderCore: RenderCore = {
      processRenderJob: jest.fn().mockResolvedValue(undefined),
    };

    const job: QueueJobLike = {
      id: 'queue-job-2',
      name: 'unknown-job',
      data: {
        renderJobId: 'render-job-2',
        projectId: 'project-2',
      },
    };

    const result = await consumeRenderQueueJob(job, renderCore);

    expect(result).toBe('ignored');
    expect(renderCore.processRenderJob).not.toHaveBeenCalled();
  });
});
