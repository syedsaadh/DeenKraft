import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('upload_assets')
@Index('idx_upload_assets_project', ['projectId'])
@Index('idx_upload_assets_user', ['userId'])
export class UploadAsset {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 36 })
  projectId: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 500 })
  storageKey: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @ApiProperty()
  @Column({ type: 'int', unsigned: true })
  size: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
