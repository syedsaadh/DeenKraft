import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface SlideElementSchema {
  type: 'text' | 'image' | 'shape';
  key: string;
  label: string;
  style: Record<string, string | number>;
  defaultValue?: string;
}

export interface SlideSchema {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  padding?: number;
  elements: SlideElementSchema[];
}

export interface TextConstraint {
  maxWords?: number;
  maxChars?: number;
  minWords?: number;
}

export type TextConstraints = Record<string, TextConstraint>;

@Entity('carousel_templates')
@Index('idx_carousel_templates_category', ['category'])
@Index('idx_carousel_templates_is_public', ['isPublic'])
export class CarouselTemplate {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50 })
  category: string;

  @ApiProperty({ required: false, example: 'educational' })
  @Column({ type: 'varchar', length: 50, nullable: true, default: null })
  family: string | null;

  @ApiProperty()
  @Column({ type: 'int', default: 7 })
  slideCount: number;

  @ApiProperty({ type: Object })
  @Column({ type: 'json' })
  coverSlideSchema: SlideSchema;

  @ApiProperty({ type: Object })
  @Column({ type: 'json' })
  contentSlideSchema: SlideSchema;

  @ApiProperty({ type: Object })
  @Column({ type: 'json' })
  endSlideSchema: SlideSchema;

  @ApiProperty({ type: Object, required: false })
  @Column({ type: 'json', nullable: true })
  textConstraints: TextConstraints | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl?: string | null;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
