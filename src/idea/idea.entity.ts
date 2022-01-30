import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'user/user.entity';

@Entity('idea')
export class IdeaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column('text')
  description: string;

  @Column('text')
  idea: string;

  @ManyToOne((type) => UserEntity, (author) => author.ideas)
  author: UserEntity;
}
