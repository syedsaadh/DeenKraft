import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { extname } from 'path';
import { join } from 'path';
import { Readable } from 'stream';
import { In, Repository } from 'typeorm';
import { Tag } from '../tags/tag.entity';
import { STORAGE_PROVIDER } from '../storage/storage.constants';
import type { StorageProvider } from '../storage/storage.interface';
import { Asset } from './asset.entity';
import { CreateAssetEntryDto } from './dto/create-asset-entry.dto';
import { GetResourceDto } from './dto/get-resource.dto';
import { ListAssetsDto } from './dto/list-assets.dto';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { UpdateAssetEntryDto } from './dto/update-asset-entry.dto';

interface StreamAssetResult {
  mode: 'stream';
  stream: Readable;
  mimeType: string;
  originalName: string;
}

interface PresignedAssetResult {
  mode: 'presignedurl';
  url: string;
  expiresInSeconds: number;
}

@Injectable()
export class AssetsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async uploadAndCreateAsset(
    file: Express.Multer.File,
    userId: number,
    dto: UploadAssetDto,
  ) {
    if (!file || !file.buffer || file.size === 0) {
      throw new BadRequestException('A valid file is required');
    }

    const storageKey = this.generateStorageKey(userId, file.originalname);
    const tempPath = await this.stageFileTemporarily(file, storageKey);

    try {
      await this.storageProvider.uploadObject({
        key: storageKey,
        body: file.buffer,
        contentType: file.mimetype,
      });
    } finally {
      if (tempPath) {
        await this.cleanupTempFile(tempPath);
      }
    }

    const tags = await this.resolveTags(dto.tagIds);

    const asset = this.assetRepository.create({
      userId,
      storageKey,
      mimeType: file.mimetype,
      originalName: file.originalname,
      name: dto.name,
      size: file.size,
      tags,
    });

    return this.assetRepository.save(asset);
  }

  async createAssetEntry(userId: number, dto: CreateAssetEntryDto) {
    const tags = await this.resolveTags(dto.tagIds);

    const asset = this.assetRepository.create({
      userId,
      name: dto.name,
      storageKey: dto.storageKey,
      mimeType: dto.mimeType,
      originalName: dto.originalName,
      size: dto.size,
      tags,
    });

    return this.assetRepository.save(asset);
  }

  async getAllAssets(userId: number, query: ListAssetsDto) {
    const [items, total] = await this.assetRepository.findAndCount({
      where: { userId },
      relations: ['tags'],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getAssetById(assetId: number, userId: number) {
    return this.findOwnedAssetOrFail(assetId, userId);
  }

  async updateAssetEntry(
    assetId: number,
    userId: number,
    dto: UpdateAssetEntryDto,
  ) {
    const asset = await this.findOwnedAssetOrFail(assetId, userId);

    if (dto.name) {
      asset.name = dto.name;
    }

    if (dto.tagIds) {
      asset.tags = await this.resolveTags(dto.tagIds);
    }

    return this.assetRepository.save(asset);
  }

  async removeAssetEntry(assetId: number, userId: number) {
    const asset = await this.findOwnedAssetOrFail(assetId, userId);

    await this.storageProvider.deleteObject(asset.storageKey);
    await this.assetRepository.softDelete({ id: assetId });

    return { deleted: true, id: assetId, deletedAt: new Date().toISOString() };
  }

  async getResourceByAssetId(
    assetId: number,
    userId: number,
    query: GetResourceDto,
  ): Promise<StreamAssetResult | PresignedAssetResult> {
    const asset = await this.findOwnedAssetOrFail(assetId, userId);

    if (query.mode === 'stream') {
      const stream = await this.storageProvider.getObjectStream(
        asset.storageKey,
      );

      return {
        mode: 'stream',
        stream,
        mimeType: asset.mimeType,
        originalName: asset.originalName,
      };
    }

    const url = await this.storageProvider.generateDownloadUrl(
      asset.storageKey,
      query.expiresInSeconds,
    );

    return {
      mode: 'presignedurl',
      url,
      expiresInSeconds: query.expiresInSeconds,
    };
  }

  private async findOwnedAssetOrFail(assetId: number, userId: number) {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId, userId },
      relations: ['tags'],
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  private async resolveTags(tagIds?: number[]) {
    if (!tagIds || tagIds.length === 0) {
      return [];
    }

    const uniqueTagIds = Array.from(new Set(tagIds));
    const tags = await this.tagRepository.find({
      where: { id: In(uniqueTagIds) },
    });

    if (tags.length !== uniqueTagIds.length) {
      throw new BadRequestException('One or more tagIds are invalid');
    }

    return tags;
  }

  private async stageFileTemporarily(
    file: Express.Multer.File,
    storageKey: string,
  ): Promise<string | null> {
    const shouldTempStage =
      this.configService.get<string>('UPLOAD_TEMP_STAGE', 'false') === 'true';

    if (!shouldTempStage) {
      return null;
    }

    const basePath = this.configService.get<string>(
      'UPLOAD_TEMP_DIR',
      join(tmpdir(), 'deencraft-upload-stage'),
    );
    const filename = `${Date.now()}-${storageKey.replace(/\//g, '_')}`;
    const fullPath = join(basePath, filename);

    try {
      await mkdir(basePath, { recursive: true });
      await writeFile(fullPath, file.buffer);
      return fullPath;
    } catch {
      throw new InternalServerErrorException(
        'Failed to stage file in temporary folder',
      );
    }
  }

  private async cleanupTempFile(filePath: string) {
    try {
      await unlink(filePath);
    } catch {
      return;
    }
  }

  private generateStorageKey(userId: number, originalName: string) {
    const extension = extname(originalName) || '';
    const filename = `${randomUUID()}${extension}`;
    const datePrefix = new Date().toISOString().slice(0, 10);

    return `assets/${userId}/${datePrefix}/${filename}`;
  }
}
