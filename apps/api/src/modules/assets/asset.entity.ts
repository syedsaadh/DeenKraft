import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '../tags/tag.entity';

@Entity()
export class Asset {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  userId: number;

  @ApiProperty()
  @Column()
  storageKey: string;

  @ApiProperty()
  @Column()
  mimeType: string;

  @ApiProperty()
  @Column()
  originalName: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('bigint')
  size: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;

  @ManyToMany(() => Tag, (tag) => tag.assets, { cascade: false })
  @JoinTable()
  tags: Tag[];
}
