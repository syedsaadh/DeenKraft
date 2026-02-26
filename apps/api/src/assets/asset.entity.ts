import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { Tag } from 'src/tags/tag.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Index } from 'typeorm';

@Entity()
@Index(['type', 'createdAt']) // composite index
export class Asset {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  originalName: string;

  @ApiProperty()
  @Column()
  storageKey: string;

  @ApiProperty()
  @Column()
  mimeType: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  size: number;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column()
  type: string; // clip | audio

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  duration: number;

  @ManyToMany(() => Tag, (tag) => tag.assets)
  @JoinTable()
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;
}
