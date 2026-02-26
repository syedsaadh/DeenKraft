import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToMany,
} from 'typeorm';
import { Asset } from '../assets/asset.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['name'], { unique: true })
export class Tag {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'islamic-art',
    description: 'Normalized lowercase unique tag name',
  })
  @Column()
  name: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @ManyToMany(() => Asset, (asset) => asset.tags)
  assets: Asset[];
}
