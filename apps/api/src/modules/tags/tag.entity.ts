import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Asset } from '../assets/asset.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Asset, (asset) => asset.tags)
  assets: Asset[];
}
