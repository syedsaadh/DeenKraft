import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  private normalize(name: string): string {
    return name.trim().toLowerCase();
  }

  async create(name: string): Promise<Tag> {
    const normalized = this.normalize(name);

    try {
      const tag = this.tagRepo.create({ name: normalized });
      return await this.tagRepo.save(tag);
    } catch {
      throw new ConflictException('Tag already exists');
    }
  }

  async findOrCreate(name: string): Promise<Tag> {
    const normalized = this.normalize(name);

    const existing = await this.tagRepo.findOne({
      where: { name: normalized },
    });

    if (existing) return existing;

    try {
      const tag = this.tagRepo.create({ name: normalized });
      return await this.tagRepo.save(tag);
    } catch {
      // race condition safe fallback
      return this.tagRepo.findOneOrFail({
        where: { name: normalized },
      });
    }
  }

  async search(query?: string): Promise<Tag[]> {
    if (!query) {
      return this.tagRepo.find({
        order: { name: 'ASC' },
        take: 50,
      });
    }

    return this.tagRepo.find({
      where: {
        name: ILike(`%${query.toLowerCase()}%`),
      },
      order: { name: 'ASC' },
      take: 50,
    });
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    return this.tagRepo.findByIds(ids);
  }
}
