import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateTemplateDto } from './dto/create-template.dto';
import { PreviewTemplateDto } from './dto/preview-template.dto';
import { RenderTemplateDto } from './dto/render-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplatesService } from './templates.service';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create template' })
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.templatesService.createTemplate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List templates' })
  getTemplates(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.templatesService.getTemplates(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by id' })
  getTemplateById(@Param('id') id: string) {
    return this.templatesService.getTemplateById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update template' })
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.updateTemplate(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete template' })
  deleteTemplate(@Param('id') id: string) {
    return this.templatesService.deleteTemplate(id);
  }

  @Post(':id/preview')
  @ApiOperation({ summary: 'Render template preview with variables' })
  @ApiParam({
    name: 'id',
    description: 'Template ID (equivalent to templateId in request context)',
  })
  @ApiBody({
    description:
      'Template preview payload for variable validation and rendering',
    schema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          description: 'Optional request context copy of :id path param',
          example: '8d11fb91-a767-4223-b5bb-a9f8147cae28',
        },
        variables: {
          type: 'object',
          example: {
            quote: 'Allah is Most Merciful',
            author: 'Quran 39:53',
          },
        },
      },
      required: ['variables'],
    },
  })
  previewTemplate(@Param('id') id: string, @Body() dto: PreviewTemplateDto) {
    return this.templatesService.previewTemplate(id, dto.variables);
  }

  @Post(':id/render')
  @ApiOperation({ summary: 'Render template image and upload to storage' })
  @ApiParam({
    name: 'id',
    description: 'Template ID (equivalent to templateId in request context)',
  })
  @ApiBody({
    description:
      'Template render payload for variable validation and PNG generation',
    schema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          description: 'Optional request context copy of :id path param',
          example: '8d11fb91-a767-4223-b5bb-a9f8147cae28',
        },
        variables: {
          type: 'object',
          example: {
            quote: 'Allah is Most Merciful',
            author: 'Quran 39:53',
          },
        },
      },
      required: ['variables'],
    },
  })
  renderTemplate(@Param('id') id: string, @Body() dto: RenderTemplateDto) {
    return this.templatesService.renderTemplateToImage(id, dto.variables);
  }
}
