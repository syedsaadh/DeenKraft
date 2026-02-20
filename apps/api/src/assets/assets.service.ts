import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetRepo: Repository<Asset>,
  ) {}

  async create(data: Partial<Asset>) {
    const asset = this.assetRepo.create(data);
    return this.assetRepo.save(asset);
  }

  async findAll() {
    return this.assetRepo.find({ relations: ['tags'] });
  }
}