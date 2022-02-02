import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaEntity } from 'idea/idea.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'user/user.entity';
import { CommentDTO } from './comment.dto';
import { CommentEntity } from './comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async show(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'idea'],
    });
  }

  async create(ideaId: string, userId: string, data: CommentDTO) {}
}
