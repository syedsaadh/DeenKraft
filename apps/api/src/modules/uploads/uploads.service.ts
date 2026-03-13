import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { Repository } from 'typeorm';
import { CarouselProject } from '../carousels/carousel-project.entity';
import { STORAGE_PROVIDER } from '../storage/storage.constants';
import type { StorageProvider } from '../storage/storage.interface';
import { UploadAsset } from './upload-asset.entity';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const PRESIGN_TTL = 3600; // 1 hour

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(UploadAsset)
    private readonly repo: Repository<UploadAsset>,
    @InjectRepository(CarouselProject)
    private readonly projectRepo: Repository<CarouselProject>,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProvider,
  ) {}

  async upload(projectId: string, userId: string, file: Express.Multer.File) {
    await this.verifyProjectOwnership(projectId, userId);

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    const ext = extname(file.originalname).toLowerCase() || '.bin';
    const key = `uploads/${userId}/${projectId}/${randomUUID()}${ext}`;

    await this.storage.uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const asset = this.repo.create({
      projectId,
      userId,
      storageKey: key,
      mimeType: file.mimetype,
      originalName: file.originalname,
      size: file.size,
    });

    const saved = await this.repo.save(asset);
    const url = await this.storage.generateDownloadUrl(key, PRESIGN_TTL);

    return { ...saved, url };
  }

  async findAll(
    projectId: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    await this.verifyProjectOwnership(projectId, userId);

    const [items, total] = await this.repo.findAndCount({
      where: { projectId, userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const itemsWithUrls = await Promise.all(
      items.map(async (item) => ({
        ...item,
        url: await this.storage.generateDownloadUrl(
          item.storageKey,
          PRESIGN_TTL,
        ),
      })),
    );

    return {
      items: itemsWithUrls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(projectId: string, uploadId: string, userId: string) {
    await this.verifyProjectOwnership(projectId, userId);

    const asset = await this.repo.findOne({
      where: { id: uploadId, projectId, userId },
    });

    if (!asset) {
      throw new NotFoundException('Upload not found');
    }

    const url = await this.storage.generateDownloadUrl(
      asset.storageKey,
      PRESIGN_TTL,
    );

    return { ...asset, url };
  }

  async remove(
    projectId: string,
    uploadId: string,
    userId: string,
  ): Promise<void> {
    await this.verifyProjectOwnership(projectId, userId);

    const asset = await this.repo.findOne({
      where: { id: uploadId, projectId, userId },
    });

    if (!asset) {
      throw new NotFoundException('Upload not found');
    }

    await this.storage.deleteObject(asset.storageKey);
    await this.repo.remove(asset);
  }

  private async verifyProjectOwnership(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }
}
