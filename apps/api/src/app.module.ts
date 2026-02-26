import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AssetsModule } from './assets/assets.module';
import { TagsModule } from './tags/tag.module';
import { StorageModule } from './storage/storage.module';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes config available everywhere
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),

    AuthModule,
    AssetsModule,
    StorageModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
