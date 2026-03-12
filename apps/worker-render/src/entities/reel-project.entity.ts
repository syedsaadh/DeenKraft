import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ReelProjectStatus = 'draft' | 'rendering' | 'completed' | 'failed';

@Entity('reel_projects')
export class ReelProject {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'json' })
  timeline!: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ['draft', 'rendering', 'completed', 'failed'],
    default: 'draft',
  })
  status!: ReelProjectStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
