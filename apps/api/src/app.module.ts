import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import awsConfig from './config/aws.config';
import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';
import { TagsModule } from './modules/tags/tags.module';
import { StorageModule } from './modules/storage/storage.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ReelsModule } from './modules/reels/reels.module';
import { CarouselTemplatesModule } from './modules/carousel-templates/carousel-templates.module';
import { CarouselsModule } from './modules/carousels/carousels.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [awsConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getDatabaseConfig(config),
    }),
    AuthModule,
    AssetsModule,
    TagsModule,
    StorageModule,
    TemplatesModule,
    ReelsModule,
    CarouselTemplatesModule,
    CarouselsModule,
    UploadsModule,
  ],
})
export class AppModule {}
