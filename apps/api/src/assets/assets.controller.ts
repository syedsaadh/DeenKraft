import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Assets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload-url')
  async uploadUrl(@Req() req, @Body() dto: CreateUploadUrlDto) {
    return this.assetsService.generateUploadUrl(
      req.user.id,
      dto.mimeType,
      dto.originalName,
    );
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateAssetDto) {
    return this.assetsService.createAsset(req.user.id, dto);
  }

  @Get()
  async findAll(
    @Req() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    return this.assetsService.getAllAssets(req.user.id, pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    return this.assetsService.getAssetById(req.user.id, id);
  }

  @Get(':id/download')
  async download(@Req() req, @Param('id') id: string, @Res() res: Response) {
    const url = await this.assetsService.getDownloadUrl(req.user.id, id);

    return res.redirect(url);
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    return this.assetsService.deleteAsset(req.user.id, id);
  }
}
