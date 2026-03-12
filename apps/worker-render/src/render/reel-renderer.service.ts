import { createWriteStream } from 'fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import { pipeline } from 'stream/promises';
import { Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { ReelProject } from '../entities/reel-project.entity';
import { RenderJob } from '../entities/render-job.entity';
import { Template } from '../entities/template.entity';
import { logError, logInfo } from '../logger';
import type { StorageProvider } from '../storage/storage.interface';

type TimelineTrackType = 'video' | 'overlay' | 'audio';

interface TimelineTrack {
  type: TimelineTrackType;
  assetId?: string;
  imageUrl?: string;
  templateId?: string;
  variables?: Record<string, unknown>;
  start?: number;
  duration?: number;
}

interface TimelineDefinition {
  width: number;
  height: number;
  fps: number;
  duration: number;
  tracks: TimelineTrack[];
}

interface OverlayInput {
  filePath: string;
  start: number;
  duration: number;
}

type FfmpegServiceLike = {
  concatenateClips: (
    clips: Array<{ filePath: string; duration?: number }>,
    outputPath: string,
    preset: { width: number; height: number; fps: number },
  ) => Promise<void>;
  applyOverlays: (
    baseVideoPath: string,
    overlays: OverlayInput[],
    outputPath: string,
    preset: { width: number; height: number; fps: number },
  ) => Promise<void>;
  addBackgroundAudio: (
    videoPath: string,
    audioPath: string,
    outputPath: string,
    videoDuration: number,
    audioStart: number,
    preset: { width: number; height: number; fps: number },
  ) => Promise<void>;
  addSilentAudioTrack: (
    videoPath: string,
    outputPath: string,
    videoDuration: number,
    preset: { width: number; height: number; fps: number },
  ) => Promise<void>;
};

export class ReelRendererService {
  constructor(
    private readonly projectRepository: Repository<ReelProject>,
    private readonly renderJobRepository: Repository<RenderJob>,
    private readonly assetRepository: Repository<Asset>,
    private readonly templateRepository: Repository<Template>,
    private readonly storageProvider: StorageProvider,
    private readonly templateRendererService: {
      renderHtmlToPng: (html: string) => Promise<Buffer>;
    },
    private readonly ffmpegService: FfmpegServiceLike,
  ) {}

  async processRenderJob(renderJobId: string): Promise<void> {
    let workingDir: string | null = null;
    let projectId: string | undefined;

    try {
      const renderJob = await this.getRenderJobOrFail(renderJobId);
      if (renderJob.status === 'completed' && renderJob.outputUrl) {
        logInfo('skipping already completed render', { jobId: renderJob.id });
        return;
      }

      await this.updateRenderStatus(renderJob, 'processing');

      const project = await this.getProjectOrFail(renderJob.projectId);
      projectId = project.id;
      await this.projectRepository.update(
        { id: project.id },
        { status: 'rendering' },
      );

      logInfo('render start', { jobId: renderJob.id, projectId: project.id });
      const timeline = this.parseTimeline(project.timeline);

      const baseTmpDir = process.env.REEL_RENDER_TMP_DIR ?? this.getDefaultTempDir();
      await mkdir(baseTmpDir, { recursive: true });
      workingDir = await mkdtemp(join(baseTmpDir, `${project.id}-`));

      const videoTracks = timeline.tracks
        .filter((track) => track.type === 'video')
        .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
      if (videoTracks.length === 0) {
        throw new Error('Timeline must contain at least one video track');
      }

      const clipInputs: Array<{ filePath: string; duration?: number }> = [];

      for (let index = 0; index < videoTracks.length; index += 1) {
        const track = videoTracks[index];
        const filePath = await this.downloadAssetTrack(
          track,
          workingDir,
          `clip-${index}.mp4`,
        );

        clipInputs.push({
          filePath,
          duration:
            typeof track.duration === 'number' && track.duration > 0
              ? track.duration
              : undefined,
        });
      }

      const combinedVideoPath = join(workingDir, 'combined.mp4');
      await this.ffmpegService.concatenateClips(clipInputs, combinedVideoPath, {
        width: timeline.width,
        height: timeline.height,
        fps: timeline.fps,
      });

      const overlayTracks = timeline.tracks
        .filter((track) => track.type === 'overlay')
        .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

      const overlayInputs: OverlayInput[] = [];

      for (let index = 0; index < overlayTracks.length; index += 1) {
        const track = overlayTracks[index];
        const overlayFilePath = await this.resolveOverlayTrack(
          track,
          workingDir,
          index,
        );

        overlayInputs.push({
          filePath: overlayFilePath,
          start: track.start ?? 0,
          duration: track.duration ?? timeline.duration,
        });
      }

      const overlaidVideoPath = join(workingDir, 'overlaid.mp4');
      await this.ffmpegService.applyOverlays(
        combinedVideoPath,
        overlayInputs,
        overlaidVideoPath,
        {
          width: timeline.width,
          height: timeline.height,
          fps: timeline.fps,
        },
      );

      const audioTrack = timeline.tracks.find((track) => track.type === 'audio');
      const finalVideoPath = join(workingDir, 'final.mp4');

      if (audioTrack?.assetId) {
        const audioPath = await this.downloadAssetTrack(
          audioTrack,
          workingDir,
          'background-audio.mp3',
        );
        await this.ffmpegService.addBackgroundAudio(
          overlaidVideoPath,
          audioPath,
          finalVideoPath,
          timeline.duration,
          audioTrack.start ?? 0,
          {
            width: timeline.width,
            height: timeline.height,
            fps: timeline.fps,
          },
        );
      } else {
        await this.ffmpegService.addSilentAudioTrack(
          overlaidVideoPath,
          finalVideoPath,
          timeline.duration,
          {
            width: timeline.width,
            height: timeline.height,
            fps: timeline.fps,
          },
        );
      }

      const outputKey = `reels/${project.id}/final.mp4`;
      const finalBuffer = await readFile(finalVideoPath);
      await this.storageProvider.uploadObject({
        key: outputKey,
        body: finalBuffer,
        contentType: 'video/mp4',
      });

      renderJob.outputUrl = this.buildObjectUrl(outputKey);
      renderJob.errorMessage = null;
      await this.updateRenderStatus(renderJob, 'completed');

      await this.projectRepository.update({ id: project.id }, { status: 'completed' });

      logInfo('render completed', {
        jobId: renderJob.id,
        projectId: project.id,
        outputUrl: renderJob.outputUrl,
      });
    } catch (error) {
      await this.failRenderJob(renderJobId, projectId, error);
    } finally {
      if (workingDir) {
        await rm(workingDir, { recursive: true, force: true });
      }
    }
  }

  private async resolveOverlayTrack(
    track: TimelineTrack,
    workingDir: string,
    index: number,
  ): Promise<string> {
    if (track.imageUrl) {
      return this.downloadOverlayImage(track.imageUrl, workingDir, index);
    }

    if (track.templateId) {
      return this.renderOverlayFromTemplate(track, workingDir, index);
    }

    throw new Error('Overlay track requires imageUrl or templateId');
  }

  private async renderOverlayFromTemplate(
    track: TimelineTrack,
    workingDir: string,
    index: number,
  ): Promise<string> {
    const template = await this.templateRepository.findOne({
      where: { id: track.templateId },
    });

    if (!template) {
      throw new Error(`Template ${track.templateId} not found`);
    }

    const html = this.renderTemplateHtml(template.html, track.variables ?? {});
    const pngBuffer = await this.templateRendererService.renderHtmlToPng(html);

    const overlayPath = join(workingDir, `overlay-template-${index}.png`);
    await writeFile(overlayPath, pngBuffer);
    return overlayPath;
  }

  private async downloadOverlayImage(
    imageUrl: string,
    workingDir: string,
    index: number,
  ): Promise<string> {
    const outputPath = join(workingDir, `overlay-${index}.png`);

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const response = await fetch(imageUrl);
      if (!response.ok || !response.body) {
        throw new Error(`Failed to download overlay image: ${imageUrl}`);
      }

      await pipeline(response.body, createWriteStream(outputPath));
      return outputPath;
    }

    const storageKey = this.extractStorageKeyFromUrl(imageUrl);
    const objectStream = await this.storageProvider.getObjectStream(storageKey);
    await pipeline(objectStream, createWriteStream(outputPath));
    return outputPath;
  }

  private async downloadAssetTrack(
    track: TimelineTrack,
    workingDir: string,
    defaultFilename: string,
  ): Promise<string> {
    const assetId = Number(track.assetId);
    if (!Number.isInteger(assetId)) {
      throw new Error(`Invalid assetId for track: ${track.assetId ?? 'undefined'}`);
    }

    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }

    const filename = asset.originalName || defaultFilename;
    const outputPath = join(workingDir, `${asset.id}-${basename(filename)}`);

    const objectStream = await this.storageProvider.getObjectStream(asset.storageKey);
    await pipeline(objectStream, createWriteStream(outputPath));
    return outputPath;
  }

  private parseTimeline(timeline: Record<string, unknown>): TimelineDefinition {
    const width = this.toPositiveNumber(timeline.width, 1080);
    const height = this.toPositiveNumber(timeline.height, 1920);
    const fps = this.toPositiveNumber(timeline.fps, 30);
    const duration = this.toPositiveNumber(timeline.duration, 15);
    const tracks = Array.isArray(timeline.tracks)
      ? (timeline.tracks as TimelineTrack[])
      : [];

    return { width, height, fps, duration, tracks };
  }

  private toPositiveNumber(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }

    return fallback;
  }

  private renderTemplateHtml(
    html: string,
    variables: Record<string, unknown>,
  ): string {
    let rendered = html;

    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered
        .split(`{{${key}}}`)
        .join(this.stringifyTemplateValue(value));
    }

    return rendered;
  }

  private stringifyTemplateValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return `${value}`;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return JSON.stringify(value);
  }

  private extractStorageKeyFromUrl(value: string): string {
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return value;
    }

    const parsedUrl = new URL(value);
    return decodeURIComponent(parsedUrl.pathname.replace(/^\//, ''));
  }

  private async getRenderJobOrFail(id: string): Promise<RenderJob> {
    const renderJob = await this.renderJobRepository.findOne({ where: { id } });
    if (!renderJob) {
      throw new Error('Render job not found');
    }

    return renderJob;
  }

  private async getProjectOrFail(id: string): Promise<ReelProject> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new Error('Reel project not found');
    }

    return project;
  }

  private async updateRenderStatus(
    renderJob: RenderJob,
    status: RenderJob['status'],
  ): Promise<void> {
    const snapshot = { ...renderJob, status };
    await this.renderJobRepository.save(snapshot as RenderJob);
    renderJob.status = status;
  }

  private async failRenderJob(
    renderJobId: string,
    projectId: string | undefined,
    error: unknown,
  ): Promise<void> {
    const message = error instanceof Error ? error.message : 'Unknown render error';
    const renderJob = await this.renderJobRepository.findOne({
      where: { id: renderJobId },
    });

    if (!renderJob) {
      logError('render failed but render job not found', { jobId: renderJobId, message });
      return;
    }

    renderJob.status = 'failed';
    renderJob.errorMessage = message;
    await this.renderJobRepository.save(renderJob);

    const failedProjectId = projectId ?? renderJob.projectId;
    await this.projectRepository.update({ id: failedProjectId }, { status: 'failed' });

    logError('render failed', {
      jobId: renderJob.id,
      projectId: failedProjectId,
      message,
    });
  }

  private buildObjectUrl(storageKey: string): string {
    const bucketName = process.env.AWS_BUCKET_NAME ?? '';
    if (!bucketName) {
      return storageKey;
    }

    const region = process.env.AWS_REGION ?? 'us-east-1';
    const encodedKey = storageKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    if (region === 'us-east-1') {
      return `https://${bucketName}.s3.amazonaws.com/${encodedKey}`;
    }

    return `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
  }

  private getDefaultTempDir(): string {
    if (process.platform === 'win32') {
      return join(tmpdir(), 'reel-render');
    }

    return '/tmp/reel-render';
  }
}
