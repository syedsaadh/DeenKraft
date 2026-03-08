import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { STORAGE_PROVIDER } from '../storage/storage.constants';
import type { StorageProvider } from '../storage/storage.interface';
import { TemplateRendererService } from './template-renderer.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    @Optional() private readonly configService?: ConfigService,
    @Optional()
    private readonly templateRendererService?: TemplateRendererService,
    @Inject(STORAGE_PROVIDER)
    @Optional()
    private readonly storageProvider?: StorageProvider,
  ) {}

  async createTemplate(dto: CreateTemplateDto) {
    const template = this.templateRepository.create(dto);
    return this.templateRepository.save(template);
  }

  async getTemplates(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    const [items, total] = await this.templateRepository.findAndCount({
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

  async getTemplateById(id: string) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    const template = await this.getTemplateById(id);
    const merged = this.templateRepository.merge(template, dto);
    return this.templateRepository.save(merged);
  }

  async deleteTemplate(id: string) {
    await this.getTemplateById(id);
    await this.templateRepository.softDelete({ id });
    return { deleted: true, id, deletedAt: new Date().toISOString() };
  }

  async previewTemplate(id: string, variables: Record<string, unknown>) {
    const template = await this.getTemplateById(id);
    const renderedHtml = this.render(template.html, variables);
    return {
      id: template.id,
      name: template.name,
      renderedHtml,
    };
  }

  async renderTemplateToImage(id: string, variables: Record<string, unknown>) {
    if (!this.templateRendererService || !this.storageProvider) {
      throw new InternalServerErrorException(
        'Template rendering dependencies are not configured',
      );
    }

    const template = await this.getTemplateById(id);
    const renderedHtml = this.render(template.html, variables);
    const pngBuffer =
      await this.templateRendererService.renderHtmlToPng(renderedHtml);

    const storageKey = `templates/previews/${template.id}/${randomUUID()}.png`;

    await this.storageProvider.uploadObject({
      key: storageKey,
      body: pngBuffer,
      contentType: 'image/png',
    });

    return {
      previewUrl: this.buildPreviewUrl(storageKey),
    };
  }

  private render(html: string, variables: Record<string, unknown>): string {
    let rendered = html;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered
        .split(placeholder)
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

  private buildPreviewUrl(storageKey: string): string {
    const bucketName =
      this.configService?.get<string>('aws.bucketName') ??
      this.configService?.get<string>('AWS_BUCKET_NAME', '') ??
      process.env.AWS_BUCKET_NAME ??
      '';

    if (!bucketName) {
      return storageKey;
    }

    const region =
      this.configService?.get<string>('aws.region') ??
      this.configService?.get<string>('AWS_REGION', '') ??
      process.env.AWS_REGION ??
      'us-east-1';
    const encodedKey = storageKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    if (region === 'us-east-1') {
      return `https://${bucketName}.s3.amazonaws.com/${encodedKey}`;
    }

    return `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
  }
}
