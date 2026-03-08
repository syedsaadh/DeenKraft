import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReelProject } from './reel-project.entity';

export type RenderJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Entity('render_jobs')
@Index('idx_render_jobs_project_id', ['projectId'])
@Index('idx_render_jobs_status', ['status'])
@Index('idx_render_jobs_created_at', ['createdAt'])
export class RenderJob {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 36 })
  projectId: string;

  @ApiProperty({
    enum: ['pending', 'processing', 'completed', 'failed'],
    example: 'pending',
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: RenderJobStatus;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  outputUrl?: string | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  errorMessage?: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ReelProject, { onDelete: 'CASCADE', eager: false })
  project?: ReelProject;
}
