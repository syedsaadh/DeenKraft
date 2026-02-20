import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Tag } from '../tags/tag.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn } from 'typeorm';
import { Index } from 'typeorm';

@Entity()

export class Asset {
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  type: string; // clip | audio

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  duration: number;

  @ApiProperty()
  @Column()
  storage_key: string;

  @ApiProperty({ type: Object, required: false })
  @Column({ type: 'json', nullable: true })
  metadata: any;

  @ManyToMany(() => Tag, (tag) => tag.assets)
  @JoinTable()
  tags: Tag[];
}
