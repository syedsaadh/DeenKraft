export const DEFAULT_RENDER_QUEUE_NAME = 'reel-render-jobs';
export const RENDER_JOB_NAME = 'render-reel';

export interface RenderQueueJobPayload {
  renderJobId: string;
  projectId: string;
}
