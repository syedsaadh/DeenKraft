import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { CarouselTemplatesService } from '../carousel-templates/carousel-templates.service';
import { STORAGE_PROVIDER } from '../storage/storage.constants';
import type { StorageProvider } from '../storage/storage.interface';
import {
  CarouselProject,
  CarouselStatus,
  type BrandProfile,
  type GeneratedSlide,
} from './carousel-project.entity';
import { CarouselRendererService } from './carousel-renderer.service';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { GenerateContentDto } from './dto/generate-content.dto';
import { UpdateCarouselDto } from './dto/update-carousel.dto';
import { RegenerateSlideDto } from './dto/regenerate-slide.dto';
import { assertStringValues, UpdateSlideDto } from './dto/update-slide.dto';
import { UpsertBrandProfileDto } from './dto/upsert-brand-profile.dto';

@Injectable()
export class CarouselsService {
  constructor(
    @InjectRepository(CarouselProject)
    private readonly repo: Repository<CarouselProject>,
    private readonly templateService: CarouselTemplatesService,
    private readonly aiService: AiService,
    private readonly renderer: CarouselRendererService,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async create(
    userId: string,
    dto: CreateCarouselDto,
  ): Promise<CarouselProject> {
    await this.templateService.findById(dto.templateId);

    const project = this.repo.create({
      userId,
      templateId: dto.templateId,
      title: dto.title,
      topic: dto.topic,
      status: CarouselStatus.DRAFT,
    });

    return this.repo.save(project);
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 20,
    orderBy: 'createdAt' | 'updatedAt' = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    const [items, total] = await this.repo.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { [orderBy]: order },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string): Promise<CarouselProject> {
    return this.findOwnedOrFail(id, userId);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCarouselDto,
  ): Promise<CarouselProject> {
    const project = await this.findOwnedOrFail(id, userId);

    if (dto.title !== undefined) project.title = dto.title;
    if (dto.topic !== undefined) project.topic = dto.topic;

    if (dto.slides !== undefined) {
      project.slides = dto.slides.map((s, i) => ({
        slideIndex: i,
        slideType: s.slideType as GeneratedSlide['slideType'],
        content: s.content,
      }));
      project.status = CarouselStatus.READY;
    }

    return this.repo.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOwnedOrFail(id, userId);
    await this.repo.softRemove(project);
  }

  async findTrashed(userId: string, page = 1, limit = 20) {
    const qb = this.repo
      .createQueryBuilder('cp')
      .withDeleted()
      .where('cp.userId = :userId', { userId })
      .andWhere('cp.deletedAt IS NOT NULL')
      .orderBy('cp.deletedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async restore(id: string, userId: string): Promise<CarouselProject> {
    const project = await this.repo.findOne({
      where: { id, userId },
      withDeleted: true,
    });

    if (!project) {
      throw new NotFoundException('Carousel project not found');
    }

    if (!project.deletedAt) {
      throw new BadRequestException('Project is not in trash');
    }

    await this.repo.recover(project);
    return project;
  }

  async permanentDelete(id: string, userId: string): Promise<void> {
    const project = await this.repo.findOne({
      where: { id, userId },
      withDeleted: true,
    });

    if (!project) {
      throw new NotFoundException('Carousel project not found');
    }

    if (!project.deletedAt) {
      throw new BadRequestException(
        'Project must be in trash before permanent deletion',
      );
    }

    await this.repo.remove(project);
  }

  async emptyTrash(userId: string): Promise<void> {
    const trashed = await this.repo.find({
      withDeleted: true,
      where: { userId },
    });

    const trashedItems = trashed.filter((p) => p.deletedAt !== null);

    if (trashedItems.length > 0) {
      await this.repo.remove(trashedItems);
    }
  }

  async upsertBrandProfile(
    id: string,
    userId: string,
    dto: UpsertBrandProfileDto,
  ): Promise<BrandProfile> {
    const project = await this.findOwnedOrFail(id, userId);

    project.brandProfile = {
      brandName: dto.brandName,
      primaryColor: dto.primaryColor,
      secondaryColor: dto.secondaryColor,
      fontFamily: dto.fontFamily,
      tone: dto.tone,
      ctaStyle: dto.ctaStyle,
      preferredSlideCount: dto.preferredSlideCount,
      textDensity: dto.textDensity as BrandProfile['textDensity'],
    };

    await this.repo.save(project);
    return project.brandProfile;
  }

  async getBrandProfile(id: string, userId: string): Promise<BrandProfile> {
    const project = await this.findOwnedOrFail(id, userId);

    if (!project.brandProfile) {
      throw new NotFoundException('Brand profile not set for this project');
    }

    return project.brandProfile;
  }

  async generateContent(
    id: string,
    userId: string,
    dto: GenerateContentDto,
  ): Promise<CarouselProject> {
    const project = await this.findOwnedOrFail(id, userId);

    // Guard: prevent concurrent generation
    if (project.status === CarouselStatus.GENERATING) {
      throw new BadRequestException(
        'Content generation is already in progress for this project.',
      );
    }

    const template = await this.templateService.findById(project.templateId);

    const slideCount =
      dto.slideCount ??
      project.brandProfile?.preferredSlideCount ??
      template.slideCount;

    project.topic = dto.topic;
    project.status = CarouselStatus.GENERATING;
    await this.repo.save(project);

    try {
      const slides = await this.aiService.generateCarouselContent({
        topic: dto.topic,
        slideCount,
        coverSchema: template.coverSlideSchema,
        contentSchema: template.contentSlideSchema,
        endSchema: template.endSlideSchema,
        brandProfile: project.brandProfile ?? undefined,
        textConstraints: template.textConstraints ?? undefined,
        audience: dto.audience,
        tone: dto.tone,
        ctaGoal: dto.ctaGoal,
        textDensity: dto.textDensity,
      });

      project.slides = slides;
      project.status = CarouselStatus.READY;
      // Clear stale exports — slides changed, old PNGs are invalid
      project.exportedUrls = null;
    } catch (error) {
      project.status = CarouselStatus.DRAFT;
      await this.repo.save(project);
      throw error;
    }

    return this.repo.save(project);
  }

  async updateSlide(
    id: string,
    slideIndex: number,
    userId: string,
    dto: UpdateSlideDto,
  ): Promise<CarouselProject> {
    const project = await this.findSlidesOrFail(id, userId);
    this.assertSlideIndex(slideIndex, project.slides!);

    // Validate all values are strings
    try {
      assertStringValues(dto.content);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    // Validate keys against template schema
    const template = await this.templateService.findById(project.templateId);
    const slide = project.slides![slideIndex];
    const schema =
      slide.slideType === 'cover'
        ? template.coverSlideSchema
        : slide.slideType === 'end'
          ? template.endSlideSchema
          : template.contentSlideSchema;
    const validKeys = new Set(schema.elements.map((e) => e.key));
    // Meta keys that aren't schema elements but are valid content overrides
    validKeys.add('backgroundImage');
    validKeys.add('backgroundColor');

    const invalidKeys = Object.keys(dto.content).filter(
      (k) => !validKeys.has(k),
    );
    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Invalid content keys for this slide type: ${invalidKeys.join(', ')}`,
      );
    }

    project.slides![slideIndex] = {
      ...slide,
      content: { ...slide.content, ...dto.content },
    };

    // Stale exports
    project.exportedUrls = null;

    return this.repo.save(project);
  }

  async regenerateSlide(
    id: string,
    slideIndex: number,
    userId: string,
    dto: RegenerateSlideDto,
  ): Promise<CarouselProject> {
    const project = await this.findSlidesOrFail(id, userId);
    this.assertSlideIndex(slideIndex, project.slides!);

    const template = await this.templateService.findById(project.templateId);
    const slide = project.slides![slideIndex];

    const schema =
      slide.slideType === 'cover'
        ? template.coverSlideSchema
        : slide.slideType === 'end'
          ? template.endSlideSchema
          : template.contentSlideSchema;

    // Build surrounding context: previous and next slides
    const surroundingSlides = project.slides!.filter(
      (s) => s.slideIndex === slideIndex - 1 || s.slideIndex === slideIndex + 1,
    );

    const newContent = await this.aiService.regenerateSlideContent({
      topic: project.topic,
      slideIndex,
      slideType: slide.slideType,
      schema,
      currentContent: slide.content,
      surroundingSlides,
      brandProfile: project.brandProfile ?? undefined,
      textConstraints: template.textConstraints ?? undefined,
      instructions: dto.instructions,
    });

    project.slides![slideIndex] = {
      ...slide,
      content: newContent,
    };

    // Stale exports
    project.exportedUrls = null;

    return this.repo.save(project);
  }

  private findSlidesOrFail(
    id: string,
    userId: string,
  ): Promise<CarouselProject> {
    return this.findOwnedOrFail(id, userId).then((project) => {
      if (!project.slides || !Array.isArray(project.slides)) {
        throw new BadRequestException(
          'Project has no slides. Generate content first.',
        );
      }
      return project;
    });
  }

  private assertSlideIndex(index: number, slides: GeneratedSlide[]): void {
    if (index < 0 || index >= slides.length) {
      throw new BadRequestException(
        `Invalid slide index. Must be between 0 and ${slides.length - 1}`,
      );
    }
  }

  async exportSlides(id: string, userId: string): Promise<{ urls: string[] }> {
    const project = await this.findOwnedOrFail(id, userId);

    if (!project.slides || project.slides.length === 0) {
      throw new BadRequestException(
        'No slides to export. Generate content first.',
      );
    }

    const template = await this.templateService.findById(project.templateId);

    project.status = CarouselStatus.EXPORTING;
    await this.repo.save(project);

    try {
      const buffers = await this.renderer.renderAllSlides(
        project.slides,
        template.coverSlideSchema,
        template.contentSlideSchema,
        template.endSlideSchema,
        template.family,
      );

      const urls: string[] = [];

      for (let i = 0; i < buffers.length; i++) {
        const key = `carousels/${userId}/${project.id}/slide-${i}.png`;

        await this.storageProvider.uploadObject({
          key,
          body: buffers[i],
          contentType: 'image/png',
        });

        const url = await this.storageProvider.generateDownloadUrl(key, 3600);
        urls.push(url);
      }

      project.exportedUrls = urls;
      project.status = CarouselStatus.EXPORTED;
      await this.repo.save(project);

      return { urls };
    } catch (error) {
      project.status = CarouselStatus.READY;
      await this.repo.save(project);
      throw error;
    }
  }

  async getExportUrls(id: string, userId: string): Promise<{ urls: string[] }> {
    const project = await this.findOwnedOrFail(id, userId);

    if (!project.exportedUrls || project.exportedUrls.length === 0) {
      throw new BadRequestException(
        'No export available. Export slides first.',
      );
    }

    const urls: string[] = [];

    for (let i = 0; i < project.slides!.length; i++) {
      const key = `carousels/${userId}/${project.id}/slide-${i}.png`;
      const exists = await this.storageProvider.objectExists(key);

      if (exists) {
        urls.push(await this.storageProvider.generateDownloadUrl(key, 3600));
      }
    }

    return { urls };
  }

  private async findOwnedOrFail(
    id: string,
    userId: string,
  ): Promise<CarouselProject> {
    const project = await this.repo.findOne({ where: { id, userId } });

    if (!project) {
      throw new NotFoundException('Carousel project not found');
    }

    return project;
  }
}
