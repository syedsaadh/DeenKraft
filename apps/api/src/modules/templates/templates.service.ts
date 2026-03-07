import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
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

  private render(
    html: string,
    variables: Record<string, unknown>,
  ): string {
    let rendered = html;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.split(placeholder).join(String(value ?? ''));
    }

    return rendered;
  }
}
