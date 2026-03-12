import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: Number(config.get<string>('DB_PORT', '3306')),
  username: config.get<string>('DB_USER', 'root'),
  password: config.get<string>('DB_PASSWORD', 'root'),
  database: config.get<string>('DB_NAME', 'app'),
  autoLoadEntities: true,
  synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
});
