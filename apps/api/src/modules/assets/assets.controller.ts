import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-request.type';
import { CreateAssetEntryDto } from './dto/create-asset-entry.dto';
import { GetResourceDto } from './dto/get-resource.dto';
import { ListAssetsDto } from './dto/list-assets.dto';
import { UpdateAssetEntryDto } from './dto/update-asset-entry.dto';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { AssetsService } from './assets.service';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'video/mp4',
  'video/webm',
]);

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload asset to S3 and save metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Ramadan Intro Clip',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
        tagIds: {
          oneOf: [
            { type: 'array', items: { type: 'number' } },
            { type: 'string', example: '1,2,3' },
          ],
        },
      },
      required: ['name', 'file'],
      description:
        'Accepted file types: image/jpeg, image/png, image/webp, audio/mpeg, audio/wav, audio/mp4, video/mp4, video/webm',
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 200 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          callback(
            new BadRequestException(`Unsupported file type: ${file.mimetype}`),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadAssetDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.assetsService.uploadAndCreateAsset(file, user.userId, body);
  }

  @Post()
  @ApiOperation({ summary: 'Create asset entry directly in database' })
  createAssetEntry(
    @Body() body: CreateAssetEntryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assetsService.createAssetEntry(user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets for current user (paginated)' })
  getAllAssets(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAssetsDto,
  ) {
    return this.assetsService.getAllAssets(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by id' })
  getAssetById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assetsService.getAssetById(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update asset entry' })
  updateAssetEntry(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAssetEntryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assetsService.updateAssetEntry(id, user.userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete asset and remove storage object' })
  removeAssetEntry(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assetsService.removeAssetEntry(id, user.userId);
  }

  @Get(':id/resource')
  @ApiOperation({
    summary:
      'Get resource by asset id (presigned URL or direct object stream) for owner',
  })
  async getResourceByAssetId(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetResourceDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.assetsService.getResourceByAssetId(
      id,
      user.userId,
      query,
    );

    if (result.mode === 'stream') {
      response.setHeader('Content-Type', result.mimeType);
      response.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(result.originalName)}"`,
      );
      return new StreamableFile(result.stream);
    }

    return {
      mode: result.mode,
      url: result.url,
      expiresInSeconds: result.expiresInSeconds,
    };
  }
}
