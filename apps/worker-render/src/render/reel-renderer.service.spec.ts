import { mkdtemp, readdir, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import { type ObjectLiteral, Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { ReelProject } from '../entities/reel-project.entity';
import { RenderJob } from '../entities/render-job.entity';
import { Template } from '../entities/template.entity';
import { ReelRendererService } from './reel-renderer.service';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('ReelRendererService', () => {
  let projectRepository: MockRepository<ReelProject>;
  let renderJobRepository: MockRepository<RenderJob>;
  let assetRepository: MockRepository<Asset>;
  let templateRepository: MockRepository<Template>;

  const mockStorageProvider = {
    uploadObject: jest.fn(),
    getObjectStream: jest.fn(),
  };

  const mockTemplateRendererService = {
    renderHtmlToPng: jest.fn(),
  };

  const mockFfmpegService = {
    concatenateClips: jest.fn(),
    applyOverlays: jest.fn(),
    addBackgroundAudio: jest.fn(),
    addSilentAudioTrack: jest.fn(),
  };

  let service: ReelRendererService;
  let tempBaseDir: string;

  beforeEach(async () => {
    tempBaseDir = await mkdtemp(join(tmpdir(), 'reel-worker-test-'));
    process.env.REEL_RENDER_TMP_DIR = tempBaseDir;
    process.env.AWS_BUCKET_NAME = 'unit-test-bucket';
    process.env.AWS_REGION = 'us-east-1';

    projectRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    renderJobRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    assetRepository = {
      findOne: jest.fn(),
    };

    templateRepository = {
      findOne: jest.fn(),
    };

    mockStorageProvider.uploadObject.mockReset();
    mockStorageProvider.getObjectStream.mockReset();
    mockTemplateRendererService.renderHtmlToPng.mockReset();
    mockFfmpegService.concatenateClips.mockReset();
    mockFfmpegService.applyOverlays.mockReset();
    mockFfmpegService.addBackgroundAudio.mockReset();
    mockFfmpegService.addSilentAudioTrack.mockReset();

    service = new ReelRendererService(
      projectRepository as unknown as Repository<ReelProject>,
      renderJobRepository as unknown as Repository<RenderJob>,
      assetRepository as unknown as Repository<Asset>,
      templateRepository as unknown as Repository<Template>,
      mockStorageProvider,
      mockTemplateRendererService,
      mockFfmpegService,
    );
  });

  afterEach(async () => {
    delete process.env.REEL_RENDER_TMP_DIR;
    await rm(tempBaseDir, { recursive: true, force: true });
  });

  it('updates statuses on successful render', async () => {
    const renderJob = {
      id: 'job-1',
      projectId: 'project-1',
      status: 'pending',
      outputUrl: null,
      errorMessage: null,
    } as RenderJob;

    const project = {
      id: 'project-1',
      userId: '1',
      name: 'Project 1',
      timeline: {
        width: 1080,
        height: 1920,
        fps: 30,
        duration: 5,
        tracks: [
          { type: 'video', assetId: '1', start: 0, duration: 5 },
        ],
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ReelProject;

    const asset = {
      id: 1,
      storageKey: 'assets/1/source.mp4',
      originalName: 'source.mp4',
    } as Asset;

    renderJobRepository.findOne!.mockResolvedValue(renderJob);
    projectRepository.findOne!.mockResolvedValue(project);
    assetRepository.findOne!.mockResolvedValue(asset);
    renderJobRepository.save!.mockImplementation(async (job: RenderJob) => job);
    projectRepository.update!.mockResolvedValue({ affected: 1 });

    mockStorageProvider.getObjectStream.mockResolvedValue(
      Readable.from(Buffer.from('video-input')),
    );

    mockFfmpegService.concatenateClips.mockResolvedValue(undefined);
    mockFfmpegService.applyOverlays.mockResolvedValue(undefined);
    mockFfmpegService.addSilentAudioTrack.mockImplementation(
      async (_input: string, outputPath: string) => {
        await writeFile(outputPath, Buffer.from('final-video'));
      },
    );

    mockStorageProvider.uploadObject.mockResolvedValue(undefined);

    await service.processRenderJob(renderJob.id);

    expect(renderJobRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'processing' }),
    );
    expect(renderJobRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' }),
    );
    expect(projectRepository.update).toHaveBeenCalledWith(
      { id: project.id },
      { status: 'completed' },
    );
  });

  it('marks render and project as failed on pipeline error', async () => {
    const renderJob = {
      id: 'job-fail',
      projectId: 'project-fail',
      status: 'pending',
      outputUrl: null,
      errorMessage: null,
    } as RenderJob;

    const project = {
      id: 'project-fail',
      userId: '1',
      name: 'Project Fail',
      timeline: {
        width: 1080,
        height: 1920,
        fps: 30,
        duration: 5,
        tracks: [{ type: 'video', assetId: '1', start: 0, duration: 5 }],
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ReelProject;

    const asset = {
      id: 1,
      storageKey: 'assets/1/source.mp4',
      originalName: 'source.mp4',
    } as Asset;

    renderJobRepository.findOne!.mockResolvedValue(renderJob);
    projectRepository.findOne!.mockResolvedValue(project);
    assetRepository.findOne!.mockResolvedValue(asset);
    renderJobRepository.save!.mockImplementation(async (job: RenderJob) => job);
    projectRepository.update!.mockResolvedValue({ affected: 1 });

    mockStorageProvider.getObjectStream.mockResolvedValue(
      Readable.from(Buffer.from('video-input')),
    );
    mockFfmpegService.concatenateClips.mockRejectedValue(
      new Error('ffmpeg failed'),
    );

    await service.processRenderJob(renderJob.id);

    expect(renderJobRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        errorMessage: 'ffmpeg failed',
      }),
    );
    expect(projectRepository.update).toHaveBeenCalledWith(
      { id: project.id },
      { status: 'failed' },
    );
  });

  it('cleans up temporary working directory after processing', async () => {
    const renderJob = {
      id: 'job-cleanup',
      projectId: 'project-cleanup',
      status: 'pending',
      outputUrl: null,
      errorMessage: null,
    } as RenderJob;

    const project = {
      id: 'project-cleanup',
      userId: '1',
      name: 'Project Cleanup',
      timeline: {
        width: 1080,
        height: 1920,
        fps: 30,
        duration: 5,
        tracks: [{ type: 'video', assetId: '1', start: 0, duration: 5 }],
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ReelProject;

    const asset = {
      id: 1,
      storageKey: 'assets/1/source.mp4',
      originalName: 'source.mp4',
    } as Asset;

    renderJobRepository.findOne!.mockResolvedValue(renderJob);
    projectRepository.findOne!.mockResolvedValue(project);
    assetRepository.findOne!.mockResolvedValue(asset);
    renderJobRepository.save!.mockImplementation(async (job: RenderJob) => job);
    projectRepository.update!.mockResolvedValue({ affected: 1 });

    mockStorageProvider.getObjectStream.mockResolvedValue(
      Readable.from(Buffer.from('video-input')),
    );

    mockFfmpegService.concatenateClips.mockResolvedValue(undefined);
    mockFfmpegService.applyOverlays.mockResolvedValue(undefined);
    mockFfmpegService.addSilentAudioTrack.mockImplementation(
      async (_input: string, outputPath: string) => {
        await writeFile(outputPath, Buffer.from('final-video'));
      },
    );
    mockStorageProvider.uploadObject.mockResolvedValue(undefined);

    await service.processRenderJob(renderJob.id);

    const children = await readdir(tempBaseDir);
    expect(children).toEqual([]);
  });
});
