import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  storageKey!: string;

  @Column()
  mimeType!: string;

  @Column()
  originalName!: string;

  @Column()
  name!: string;

  @Column('bigint')
  size!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
