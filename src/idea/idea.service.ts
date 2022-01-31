import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'user/user.entity';
import { IdeaDTO, IdeaResponse } from './idea.dto';

import { IdeaEntity } from './idea.entity';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll(): Promise<IdeaResponse[]> {
    const ideas = await this.ideaRepository.find({
      relations: ['author'],
    });
    const ideasWithOmittedUserToken = ideas.map((idea) =>
      this.toResponseObject(idea),
    );

    return ideasWithOmittedUserToken;
  }

  async create(userId: string, data: IdeaDTO): Promise<IdeaResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = await this.ideaRepository.create({ ...data, author: user });

    await this.ideaRepository.save(idea);

    return this.toResponseObject(idea);
  }

  async read(id: string): Promise<IdeaResponse> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!idea) {
      this.throwException();
    }

    const ideaWithOmittedUserToken = this.toResponseObject(idea);

    return ideaWithOmittedUserToken;
  }

  async update(id: string, data: Partial<IdeaDTO>): Promise<IdeaResponse> {
    let idea = await this.ideaRepository.findOne({ where: { id } });

    if (!idea) {
      this.throwException();
    }

    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({ where: { id } });

    const ideaWithOmittedUserToken = this.toResponseObject(idea);

    return ideaWithOmittedUserToken;
  }

  async destroy(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
    });

    if (!idea) {
      this.throwException();
    }

    return idea;
  }

  throwException() {
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
  }

  private toResponseObject(idea: IdeaEntity): IdeaResponse {
    const author = idea.author.toResponseObject(false);

    return { ...idea, author };
  }
}
