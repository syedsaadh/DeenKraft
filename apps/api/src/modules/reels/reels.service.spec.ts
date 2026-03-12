import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type ObjectLiteral, Repository } from 'typeorm';
import { ReelProject } from './entities/reel-project.entity';
import { RenderJob } from './entities/render-job.entity';
import { ReelsService } from './reels.service';
import { ReelsQueueService } from './queue/reels-queue.service';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('ReelsService', () => {
  let service: ReelsService;
  let projectRepository: MockRepository<ReelProject>;
  let renderJobRepository: MockRepository<RenderJob>;
  let reelsQueueService: { enqueueRenderJob: jest.Mock };

  beforeEach(async () => {
    projectRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      merge: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    renderJobRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
    };

    reelsQueueService = {
      enqueueRenderJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReelsService,
        {
          provide: getRepositoryToken(ReelProject),
          useValue: projectRepository,
        },
        {
          provide: getRepositoryToken(RenderJob),
          useValue: renderJobRepository,
        },
        {
          provide: ReelsQueueService,
          useValue: reelsQueueService,
        },
      ],
    }).compile();

    service = module.get<ReelsService>(ReelsService);
  });

  it('creates render job and enqueues queue payload', async () => {
    const project = {
      id: 'project-1',
      userId: '1',
      name: 'Project',
      timeline: {},
      status: 'draft',
    } as ReelProject;
    const pendingJob = {
      projectId: project.id,
      status: 'pending',
    } as RenderJob;
    const savedJob = {
      id: 'job-1',
      projectId: project.id,
      status: 'pending',
    } as RenderJob;

    projectRepository.findOne!.mockResolvedValue(project);
    renderJobRepository.create!.mockReturnValue(pendingJob);
    renderJobRepository.save!.mockResolvedValue(savedJob);
    projectRepository.update!.mockResolvedValue({ affected: 1 });
    reelsQueueService.enqueueRenderJob.mockResolvedValue(undefined);

    const result = await service.createRenderJob(project.id, project.userId);

    expect(renderJobRepository.create).toHaveBeenCalledWith({
      projectId: project.id,
      status: 'pending',
    });
    expect(projectRepository.update).toHaveBeenCalledWith(
      { id: project.id },
      { status: 'rendering' },
    );
    expect(reelsQueueService.enqueueRenderJob).toHaveBeenCalledWith({
      renderJobId: savedJob.id,
      projectId: project.id,
    });
    expect(result).toBe(savedJob);
  });

  it('denies access to another user project', async () => {
    projectRepository.findOne!.mockResolvedValue(null);

    await expect(service.getProject('project-1', '99')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('denies access to render job from another user project', async () => {
    const job = {
      id: 'job-1',
      projectId: 'project-1',
      status: 'pending',
    } as RenderJob;

    renderJobRepository.findOne!.mockResolvedValue(job);
    projectRepository.findOne!.mockResolvedValue(null);

    await expect(service.getRenderJob(job.id, '42')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('denies update for another user project', async () => {
    projectRepository.findOne!.mockResolvedValue(null);

    await expect(
      service.updateProject('project-2', '99', {
        name: 'Updated',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('denies delete for another user project', async () => {
    projectRepository.findOne!.mockResolvedValue(null);

    await expect(
      service.deleteProject('project-3', '99'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('denies render job creation for another user project', async () => {
    projectRepository.findOne!.mockResolvedValue(null);

    await expect(
      service.createRenderJob('project-4', '99'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('denies render job listing for another user project', async () => {
    projectRepository.findOne!.mockResolvedValue(null);

    await expect(
      service.listRenderJobs('project-5', '99', 1, 20),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
