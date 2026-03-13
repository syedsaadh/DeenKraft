import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-request.type';
import { CarouselsService } from './carousels.service';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { GenerateContentDto } from './dto/generate-content.dto';
import { ListCarouselsDto } from './dto/list-carousels.dto';
import { UpdateCarouselDto } from './dto/update-carousel.dto';
import { RegenerateSlideDto } from './dto/regenerate-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { UpsertBrandProfileDto } from './dto/upsert-brand-profile.dto';

@ApiTags('Carousels')
@ApiBearerAuth()
@Controller('carousels')
@UseGuards(JwtAuthGuard)
export class CarouselsController {
  constructor(private readonly service: CarouselsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new carousel project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCarouselDto,
  ) {
    return this.service.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List carousel projects for the current user' })
  @ApiResponse({ status: 200, description: 'Paginated list of projects' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCarouselsDto,
  ) {
    return this.service.findAll(user.userId, query.page, query.limit, query.orderBy, query.order);
  }

  @Get('trash')
  @ApiOperation({ summary: 'List trashed carousel projects' })
  @ApiResponse({ status: 200, description: 'Paginated list of trashed projects' })
  findTrashed(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCarouselsDto,
  ) {
    return this.service.findTrashed(user.userId, query.page, query.limit);
  }

  @Delete('trash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Empty trash — permanently delete all trashed projects' })
  @ApiResponse({ status: 204, description: 'Trash emptied' })
  emptyTrash(@CurrentUser() user: AuthenticatedUser) {
    return this.service.emptyTrash(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a carousel project by ID' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.findById(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a carousel project (title, topic, or slides)',
  })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCarouselDto,
  ) {
    return this.service.update(id, user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a carousel project (move to trash)' })
  @ApiResponse({ status: 204, description: 'Project moved to trash' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.remove(id, user.userId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a trashed carousel project' })
  @ApiResponse({ status: 200, description: 'Project restored' })
  @ApiResponse({ status: 400, description: 'Project is not in trash' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.restore(id, user.userId);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a trashed carousel project' })
  @ApiResponse({ status: 204, description: 'Project permanently deleted' })
  @ApiResponse({
    status: 400,
    description: 'Project must be in trash before permanent deletion',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  permanentDelete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.permanentDelete(id, user.userId);
  }

  @Put(':id/brand')
  @ApiOperation({
    summary: 'Create or replace the brand profile for a project',
  })
  @ApiResponse({ status: 200, description: 'Brand profile saved' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  upsertBrand(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertBrandProfileDto,
  ) {
    return this.service.upsertBrandProfile(id, user.userId, dto);
  }

  @Get(':id/brand')
  @ApiOperation({ summary: 'Get the brand profile for a project' })
  @ApiResponse({ status: 200, description: 'Brand profile returned' })
  @ApiResponse({
    status: 404,
    description: 'Project or brand profile not found',
  })
  getBrand(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.getBrandProfile(id, user.userId);
  }

  @Post(':id/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate AI content for carousel slides' })
  @ApiResponse({
    status: 200,
    description: 'Content generated and saved to project',
  })
  @ApiResponse({ status: 400, description: 'Generation already in progress' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  @ApiResponse({
    status: 500,
    description: 'AI generation failed after retries',
  })
  generate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateContentDto,
  ) {
    return this.service.generateContent(id, user.userId, dto);
  }

  @Patch(':id/slides/:index')
  @ApiOperation({ summary: "Update a single slide's content" })
  @ApiResponse({ status: 200, description: 'Slide updated' })
  @ApiResponse({
    status: 400,
    description: 'Invalid slide index, no slides, or invalid content keys',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  updateSlide(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('index', ParseIntPipe) index: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSlideDto,
  ) {
    return this.service.updateSlide(id, index, user.userId, dto);
  }

  @Post(':id/slides/:index/regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Regenerate a single slide with AI, preserving carousel context',
  })
  @ApiResponse({
    status: 200,
    description: 'Slide regenerated and saved',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid slide index or no slides',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  @ApiResponse({
    status: 500,
    description: 'AI regeneration failed',
  })
  regenerateSlide(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('index', ParseIntPipe) index: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegenerateSlideDto,
  ) {
    return this.service.regenerateSlide(id, index, user.userId, dto);
  }

  @Post(':id/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Render all slides to PNG and upload to S3' })
  @ApiResponse({ status: 200, description: 'Export URLs returned' })
  @ApiResponse({ status: 400, description: 'No slides to export' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  exportSlides(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.exportSlides(id, user.userId);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Get existing export download URLs' })
  @ApiResponse({ status: 200, description: 'Export URLs returned' })
  @ApiResponse({ status: 400, description: 'No export available' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by user',
  })
  getExportUrls(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.getExportUrls(id, user.userId);
  }
}
