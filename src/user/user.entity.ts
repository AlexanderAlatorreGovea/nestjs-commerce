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
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserResponse, UserResponseWithAddedProperties } from './user.dto';
import { IdeaEntity } from 'idea/idea.entity';

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

  @OneToMany((type) => IdeaEntity, (idea) => idea.author, { cascade: true })
  ideas: IdeaEntity[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @ManyToMany((type) => IdeaEntity, {
    cascade: true,
  })
  @JoinTable()
  bookmarsk: IdeaEntity;

  toResponseObject(showToken: boolean = true): UserResponse {
    const { id, created, username, token } = this;
    const responseObject: UserResponseWithAddedProperties = {
      id,
      created,
      username,
    };

    if (showToken) {
      responseObject.token = token;
    }

    if (this.ideas) {
      responseObject.ideas = this.ideas;
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
