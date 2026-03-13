import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface UserPreferences {
  preferredTemplateId?: string;
  preferredTone?: string;
  preferredSlideCount?: number;
  ctaStyle?: string;
  textDensity?: 'minimal' | 'moderate' | 'detailed';
  instagramHandle?: string;
}

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ type: Object, required: false })
  @Column({ type: 'json', nullable: true })
  preferences: UserPreferences | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
