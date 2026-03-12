import {
  BadRequestException,
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
import { validateAgainstSchema } from '../../common/validation/schema-validator';
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
    this.validateTemplateVariables(template, variables);
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
    this.validateTemplateVariables(template, variables);
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

  private validateTemplateVariables(
    template: Template,
    variables: Record<string, unknown>,
  ): void {
    if (!this.isPlainObject(variables)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Template variables validation failed',
        errors: [
          {
            field: 'variables',
            message: 'must be a JSON object',
          },
        ],
      });
    }

    const schema = this.normalizeVariableSchema(template.variableSchema);
    if (!schema) {
      return;
    }

    const result = validateAgainstSchema(schema, variables);
    if (result.valid) {
      return;
    }

    throw new BadRequestException({
      statusCode: 400,
      message: 'Template variables validation failed',
      errors: result.errors,
    });
  }

  private normalizeVariableSchema(
    schema: unknown,
  ): Record<string, unknown> | null {
    if (!this.isPlainObject(schema)) {
      return null;
    }

    if (
      'type' in schema ||
      'properties' in schema ||
      'required' in schema ||
      '$schema' in schema
    ) {
      return schema;
    }

    const properties = Object.entries(schema).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = { type: value };
          return acc;
        }

        if (this.isPlainObject(value)) {
          acc[key] = value;
          return acc;
        }

        acc[key] = {};
        return acc;
      },
      {},
    );

    return {
      type: 'object',
      properties,
      additionalProperties: true,
    };
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
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
