import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('templates')
@Index('idx_templates_name', ['name'])
@Index('idx_templates_created_at', ['createdAt'])
@Index('idx_templates_deleted_at', ['deletedAt'])
export class Template {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty()
  @Column({ type: 'text' })
  html: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  css?: string | null;

  @ApiProperty({ type: Object })
  @Column({ type: 'json' })
  variableSchema: Record<string, unknown>;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  promptRecipe?: string | null;

  @ApiProperty({ minimum: 1 })
  @Column({ type: 'int', default: 1 })
  version: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
