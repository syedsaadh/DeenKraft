import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CarouselTemplate } from './carousel-template.entity';
import { CreateCarouselTemplateDto } from './dto/create-carousel-template.dto';
import { ListCarouselTemplatesDto } from './dto/list-carousel-templates.dto';
import { SEED_TEMPLATES } from './seed-templates';

@Injectable()
export class CarouselTemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(CarouselTemplate)
    private readonly repo: Repository<CarouselTemplate>,
  ) {}

  async onModuleInit() {
    for (const seed of SEED_TEMPLATES) {
      const exists = await this.repo.findOne({
        where: { name: seed.name as string },
      });

      if (!exists) {
        await this.repo.save(this.repo.create(seed));
        continue;
      }

      // Backfill new fields on existing templates
      let updated = false;

      if (seed.family && !exists.family) {
        exists.family = seed.family;
        updated = true;
      }

      if (seed.textConstraints && !exists.textConstraints) {
        exists.textConstraints = seed.textConstraints;
        updated = true;
      }

      if (updated) {
        await this.repo.save(exists);
      }
    }
  }

  async create(dto: CreateCarouselTemplateDto): Promise<CarouselTemplate> {
    const template = this.repo.create(dto);
    return this.repo.save(template);
  }

  async findAll(query: ListCarouselTemplatesDto) {
    const where: FindOptionsWhere<CarouselTemplate> = { isPublic: true };

    if (query.category) {
      where.category = query.category;
    }

    if (query.family) {
      where.family = query.family;
    }

    const [items, total] = await this.repo.findAndCount({
      where,
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

  async findById(id: string): Promise<CarouselTemplate> {
    const template = await this.repo.findOne({ where: { id } });

    if (!template) {
      throw new NotFoundException('Carousel template not found');
    }

    return template;
  }
}
