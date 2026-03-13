import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CarouselTemplate } from './carousel-template.entity';
import { CarouselTemplatesService } from './carousel-templates.service';
import { CreateCarouselTemplateDto } from './dto/create-carousel-template.dto';
import { ListCarouselTemplatesDto } from './dto/list-carousel-templates.dto';

@ApiTags('Carousel Templates')
@ApiBearerAuth()
@Controller('carousel-templates')
@UseGuards(JwtAuthGuard)
export class CarouselTemplatesController {
  constructor(private readonly service: CarouselTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a carousel template' })
  @ApiResponse({ status: 201, type: CarouselTemplate })
  create(@Body() dto: CreateCarouselTemplateDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List carousel templates (paginated, filter by category/family)',
  })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: ListCarouselTemplatesDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a carousel template by ID' })
  @ApiResponse({ status: 200, type: CarouselTemplate })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }
}
