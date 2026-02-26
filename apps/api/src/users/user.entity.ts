import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['email'], { unique: true })
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshTokenHash: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
