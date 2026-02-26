import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Asset } from './asset.entity';
import { STORAGE_PROVIDER } from 'src/storage/storage.constants';
import type { StorageProvider } from 'src/storage/storage.interface';
import { TagsService } from 'src/tags/tags.service';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    private readonly dataSource: DataSource,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProvider,
    private readonly tagsService: TagsService,
  ) {}

  async generateUploadUrl(
    userId: string,
    mimeType: string,
    originalName: string,
  ) {
    if (!mimeType) {
      throw new BadRequestException('mimeType is required');
    }

    const extension = originalName?.split('.').pop() ?? 'bin';
    const key = `assets/${userId}/${randomUUID()}.${extension}`;

    const uploadUrl = await this.storage.generateUploadUrl(key, mimeType);

    return { uploadUrl, storageKey: key };
  }

  async createAsset(userId: string, dto: any) {
    const exists = await this.storage.objectExists(dto.storageKey);
    if (!exists) {
      throw new NotFoundException('Uploaded file not found in storage');
    }

    const tagNames: string[] = Array.isArray(dto.tags) ? dto.tags : [];

    const tags = await Promise.all(
      tagNames.map((name: string) => this.tagsService.findOrCreate(name)),
    );

    const asset = this.assetRepo.create({
      storageKey: dto.storageKey,
      mimeType: dto.mimeType,
      originalName: dto.originalName,
      size: dto.size,
      userId,
      tags,
    });

    return this.assetRepo.save(asset);
  }

  async getDownloadUrl(userId: string, assetId: string) {
    const asset = await this.assetRepo.findOne({
      where: { id: assetId },
    });

    if (!asset) throw new NotFoundException();
    if (asset.userId !== userId) throw new ForbiddenException();

    return this.storage.generateDownloadUrl(asset.storageKey);
  }

  async getAssetById(userId: string, assetId: string) {
    const asset = await this.assetRepo.findOne({
      where: { id: assetId },
      relations: ['tags'],
    });

    if (!asset) throw new NotFoundException();
    if (asset.userId !== userId) throw new ForbiddenException();

    return asset;
  }

  async getAllAssets(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.assetRepo.findAndCount({
      where: { userId },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getResourceByAssetId(userId: string, assetId: string) {
    const asset = await this.assetRepo.findOne({
      where: { id: assetId },
    });

    if (!asset) throw new NotFoundException();
    if (asset.userId !== userId) throw new ForbiddenException();

    return {
      url: await this.storage.generateDownloadUrl(asset.storageKey),
    };
  }

  async deleteAsset(userId: string, assetId: string) {
    const asset = await this.assetRepo.findOne({
      where: { id: assetId },
    });

    if (!asset) throw new NotFoundException();
    if (asset.userId !== userId) throw new ForbiddenException();

    await this.dataSource.transaction(async (manager) => {
      await this.storage.deleteObject(asset.storageKey);
      await manager.remove(asset);
    });
  }
}
