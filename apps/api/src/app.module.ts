import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Asset } from './assets/asset.entity';
import { Tag } from './tags/tag.entity';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: 'root',
      database: 'app',
      autoLoadEntities: true,
      synchronize: true,
      entities: [Asset, Tag],
    }),
    AuthModule,
    AssetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
