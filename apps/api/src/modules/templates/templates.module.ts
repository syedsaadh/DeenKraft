import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../storage/storage.module';
import { TemplateRendererService } from './template-renderer.service';
import { Template } from './template.entity';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Template]), StorageModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplateRendererService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
