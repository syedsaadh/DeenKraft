import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReelProject,
  type ReelProjectStatus,
} from './entities/reel-project.entity';
import { RenderJob, type RenderJobStatus } from './entities/render-job.entity';
import { CreateReelProjectDto } from './dto/create-reel-project.dto';
import { UpdateReelProjectDto } from './dto/update-reel-project.dto';

@Injectable()
export class ReelsService {
  constructor(
    @InjectRepository(ReelProject)
    private readonly projectRepository: Repository<ReelProject>,
    @InjectRepository(RenderJob)
    private readonly renderJobRepository: Repository<RenderJob>,
  ) {}

  async createProject(
    userId: string,
    dto: CreateReelProjectDto,
  ): Promise<ReelProject> {
    const project = this.projectRepository.create({
      userId,
      name: dto.name,
      timeline: dto.timeline,
      status: 'draft' as ReelProjectStatus,
    });
    return this.projectRepository.save(project);
  }

  async getProject(id: string): Promise<ReelProject> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Reel project not found');
    }
    return project;
  }

  async listProjects(userId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    const [items, total] = await this.projectRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async updateProject(
    id: string,
    dto: UpdateReelProjectDto,
  ): Promise<ReelProject> {
    const project = await this.getProject(id);
    const merged = this.projectRepository.merge(project, {
      name: dto.name,
      timeline: dto.timeline,
    });
    return this.projectRepository.save(merged);
  }

  async deleteProject(id: string): Promise<{ deleted: boolean; id: string }> {
    await this.getProject(id);
    await this.projectRepository.delete({ id });
    return { deleted: true, id };
  }

  async createRenderJob(projectId: string): Promise<RenderJob> {
    const project = await this.getProject(projectId);

    const renderJob = this.renderJobRepository.create({
      projectId: project.id,
      status: 'pending' as RenderJobStatus,
    });

    const savedJob = await this.renderJobRepository.save(renderJob);

    await this.projectRepository.update(
      { id: projectId },
      { status: 'rendering' as ReelProjectStatus },
    );

    return savedJob;
  }

  async getRenderJob(id: string): Promise<RenderJob> {
    const job = await this.renderJobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Render job not found');
    }
    return job;
  }

  async listRenderJobs(projectId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    const [items, total] = await this.renderJobRepository.findAndCount({
      where: { projectId },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}
