import { Controller, Post, Body, Get } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Asset } from './asset.entity';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CreateAssetDto } from './dto/create-asset.dto';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload asset (clip/audio)' })
  create(@Body() body: CreateAssetDto) {
    return this.assetsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch uploaded assets' })
  findAll() {
    return this.assetsService.findAll();
  }
}