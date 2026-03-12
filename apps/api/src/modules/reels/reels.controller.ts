import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { type AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { ReelsService } from './reels.service';
import { CreateReelProjectDto } from './dto/create-reel-project.dto';
import { UpdateReelProjectDto } from './dto/update-reel-project.dto';
import { ReelProject } from './entities/reel-project.entity';
import { RenderJob } from './entities/render-job.entity';

@ApiTags('Reels')
@Controller('reels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new reel project',
    description: 'Create a new reel project with a timeline composition',
  })
  @ApiBody({
    description: 'Create reel project payload',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Summer 2024 Reel' },
        timeline: {
          type: 'object',
          example: {
            width: 1080,
            height: 1920,
            fps: 30,
            duration: 15,
            tracks: [
              {
                type: 'video',
                assetId: 'asset-123',
                start: 0,
                duration: 15,
              },
              {
                type: 'overlay',
                templateId: 'template-456',
                variables: {
                  title: 'Summer Vibes',
                  subtitle: 'Best Moments 2024',
                },
                start: 2,
                duration: 13,
              },
            ],
          },
        },
      },
      required: ['name', 'timeline'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reel project created successfully',
    type: ReelProject,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or timeline structure',
  })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateReelProjectDto,
  ): Promise<ReelProject> {
    const userId = String(req.user.userId);
    return this.reelsService.createProject(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List reel projects',
    description:
      'Retrieve paginated list of reel projects for the authenticated user',
  })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of reel projects retrieved successfully',
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/ReelProject' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async list(
    @Request() req: AuthenticatedRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const userId = String(req.user.userId);
    return this.reelsService.listProjects(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get reel project details',
    description: 'Retrieve detailed information about a specific reel project',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Reel project ID' })
  @ApiResponse({
    status: 200,
    description: 'Reel project retrieved successfully',
    type: ReelProject,
  })
  @ApiResponse({
    status: 404,
    description: 'Reel project not found',
  })
  async get(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ReelProject> {
    const userId = String(req.user.userId);
    return this.reelsService.getProject(id, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update reel project',
    description: 'Update name or timeline of an existing reel project',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Reel project ID' })
  @ApiBody({
    description: 'Update reel project payload',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Reel Name' },
        timeline: {
          type: 'object',
          example: {
            width: 1080,
            height: 1920,
            fps: 30,
            duration: 30,
            tracks: [],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reel project updated successfully',
    type: ReelProject,
  })
  @ApiResponse({
    status: 404,
    description: 'Reel project not found',
  })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateReelProjectDto,
  ): Promise<ReelProject> {
    const userId = String(req.user.userId);
    return this.reelsService.updateProject(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete reel project',
    description: 'Delete a reel project and all associated render jobs',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Reel project ID' })
  @ApiResponse({
    status: 200,
    description: 'Reel project deleted successfully',
    schema: {
      properties: {
        deleted: { type: 'boolean' },
        id: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reel project not found',
  })
  async delete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = String(req.user.userId);
    return this.reelsService.deleteProject(id, userId);
  }

  @Post(':id/render')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start rendering a reel project',
    description:
      'Create a render job to process the reel timeline. Processing happens asynchronously.',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Reel project ID' })
  @ApiResponse({
    status: 201,
    description: 'Render job created successfully',
    type: RenderJob,
    schema: {
      properties: {
        id: { type: 'string' },
        projectId: { type: 'string' },
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'completed', 'failed'],
        },
        outputUrl: { type: 'string', nullable: true },
        errorMessage: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reel project not found',
  })
  async render(
    @Request() req: AuthenticatedRequest,
    @Param('id') projectId: string,
  ): Promise<RenderJob> {
    const userId = String(req.user.userId);
    return this.reelsService.createRenderJob(projectId, userId);
  }

  @Get('render-jobs/:id')
  @ApiOperation({
    summary: 'Get render job details',
    description:
      'Retrieve a specific render job including status, outputUrl, and errorMessage.',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Render job ID' })
  @ApiResponse({
    status: 200,
    description: 'Render job retrieved successfully',
    type: RenderJob,
  })
  @ApiResponse({
    status: 404,
    description: 'Render job not found',
  })
  async getRenderJob(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<RenderJob> {
    const userId = String(req.user.userId);
    return this.reelsService.getRenderJob(id, userId);
  }

  @Get(':id/render-jobs')
  @ApiOperation({
    summary: 'List render jobs for a reel project',
    description:
      'Retrieve paginated render jobs for a specific reel project to track rendering progress.',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Reel project ID' })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Render jobs retrieved successfully',
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/RenderJob' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async listRenderJobs(
    @Request() req: AuthenticatedRequest,
    @Param('id') projectId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const userId = String(req.user.userId);
    return this.reelsService.listRenderJobs(projectId, userId, page, limit);
  }
}
