import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ReelProjectStatus = 'draft' | 'rendering' | 'completed' | 'failed';

@Entity('reel_projects')
@Index('idx_reel_projects_user_id', ['userId'])
@Index('idx_reel_projects_status', ['status'])
@Index('idx_reel_projects_created_at', ['createdAt'])
export class ReelProject {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({
    type: Object,
    example: {
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 15,
      tracks: [
        {
          type: 'video',
          assetId: 'clip-id',
          start: 0,
          duration: 15,
        },
        {
          type: 'overlay',
          templateId: 'template-id',
          variables: {
            quote: 'Allah is Most Merciful',
            author: 'Quran 39:53',
          },
          start: 2,
          duration: 8,
        },
      ],
    },
  })
  @Column({ type: 'json' })
  timeline: Record<string, unknown>;

  @ApiProperty({
    enum: ['draft', 'rendering', 'completed', 'failed'],
    example: 'draft',
  })
  @Column({
    type: 'enum',
    enum: ['draft', 'rendering', 'completed', 'failed'],
    default: 'draft',
  })
  status: ReelProjectStatus;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
