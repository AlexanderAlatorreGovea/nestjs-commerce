import { CommentEntity } from 'comment/comment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
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

  @ManyToMany((type) => UserEntity, {
    cascade: true,
  })
  @JoinTable()
  upvotes: UserEntity[];

  @ManyToMany((type) => UserEntity, {
    cascade: true,
  })
  @JoinTable()
  downvotes: UserEntity[];

  @OneToMany((type) => CommentEntity, (comment) => comment.idea, {
    cascade: true,
  })
  comments: CommentEntity[];
}
