import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarouselTemplate } from './carousel-template.entity';
import { CarouselTemplatesController } from './carousel-templates.controller';
import { CarouselTemplatesService } from './carousel-templates.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarouselTemplate])],
  controllers: [CarouselTemplatesController],
  providers: [CarouselTemplatesService],
  exports: [CarouselTemplatesService],
})
export class CarouselTemplatesModule {}
