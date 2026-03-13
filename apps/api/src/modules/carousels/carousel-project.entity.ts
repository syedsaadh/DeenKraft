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

export interface GeneratedSlide {
  slideIndex: number;
  slideType: 'cover' | 'content' | 'end';
  content: Record<string, string>;
}

export interface BrandProfile {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  tone: string;
  ctaStyle: string;
  preferredSlideCount: number;
  textDensity: 'minimal' | 'moderate' | 'detailed';
}

export enum CarouselStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  READY = 'ready',
  EXPORTING = 'exporting',
  EXPORTED = 'exported',
}

@Entity('carousel_projects')
@Index('idx_carousel_projects_user_id', ['userId'])
@Index('idx_carousel_projects_status', ['status'])
export class CarouselProject {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 36 })
  templateId: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty()
  @Column({ type: 'text' })
  topic: string;

  @ApiProperty({ type: Array })
  @Column({ type: 'json', nullable: true })
  slides: GeneratedSlide[] | null;

  @ApiProperty({ enum: CarouselStatus })
  @Column({ type: 'enum', enum: CarouselStatus, default: CarouselStatus.DRAFT })
  status: CarouselStatus;

  @ApiProperty({ type: Object, required: false })
  @Column({ type: 'json', nullable: true })
  brandProfile: BrandProfile | null;

  @ApiProperty({ type: Array, required: false })
  @Column({ type: 'json', nullable: true })
  exportedUrls: string[] | null;

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
