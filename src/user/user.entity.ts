import * as bcrypt from 'bcryptjs';
import { IdeaEntity } from 'idea/idea.entity';
import * as jwt from 'jsonwebtoken';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserResponse, UserResponseWithAddedProperties } from './user.dto';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @OneToMany(() => IdeaEntity, (idea) => idea.author, { cascade: true })
  ideas: IdeaEntity[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @ManyToMany(() => IdeaEntity, {
    cascade: true,
  })
  @JoinTable()
  bookmarks: IdeaEntity[];

  toResponseObject(showToken: boolean = true): UserResponse {
    const { id, created, username, token } = this;
    const responseObject: UserResponseWithAddedProperties = {
      id,
      created,
      username,
    };

    if (showToken) {
      responseObject.token = token;
      return;
    }

    if (this.ideas) {
      responseObject.ideas = this.ideas;
    }

    if (this.bookmarks) {
      responseObject.bookmarks = this.bookmarks;
    }

    return responseObject;
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }

  private get token(): string {
    const { id, username } = this;

    return jwt.sign(
      {
        id,
        username,
      },
      process.env.SECRET,
      { expiresIn: '7d' },
    );
  }
}
