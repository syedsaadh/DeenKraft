import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { ReelProject } from './entities/reel-project.entity';
import { RenderJob } from './entities/render-job.entity';
import { Template } from './entities/template.entity';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function createAppDataSource(): DataSource {
  const host = requiredEnv('DB_HOST');
  const port = Number(process.env.DB_PORT ?? '3306');
  const username = requiredEnv('DB_USERNAME');
  const password = requiredEnv('DB_PASSWORD');
  const database = requiredEnv('DB_NAME');

  return new DataSource({
    type: 'mysql',
    host,
    port,
    username,
    password,
    database,
    entities: [Asset, Template, ReelProject, RenderJob],
    synchronize: false,
    logging: false,
  });
}
