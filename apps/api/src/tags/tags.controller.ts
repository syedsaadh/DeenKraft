import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { SearchTagsDto } from './dto/search-tags.dto';
import { Tag } from './tag.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, type: Tag })
  async create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto.name);
  }

  @Get()
  @ApiOperation({ summary: 'Search tags' })
  @ApiQuery({ name: 'query', required: false })
  @ApiResponse({ status: 200, type: [Tag] })
  async search(@Query() dto: SearchTagsDto) {
    return this.tagsService.search(dto.query);
  }
}
