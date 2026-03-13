import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { CarouselTemplatesModule } from '../carousel-templates/carousel-templates.module';
import { StorageModule } from '../storage/storage.module';
import { CarouselProject } from './carousel-project.entity';
import { CarouselRendererService } from './carousel-renderer.service';
import { CarouselsController } from './carousels.controller';
import { CarouselsService } from './carousels.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarouselProject]),
    CarouselTemplatesModule,
    AiModule,
    StorageModule,
  ],
  controllers: [CarouselsController],
  providers: [CarouselsService, CarouselRendererService],
  exports: [CarouselsService],
})
export class CarouselsModule {}
