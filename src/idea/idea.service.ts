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
      this.ideaToResponseObject(idea),
    );

    return ideasWithOmittedUserToken;
  }

  async create(userId: string, data: IdeaDTO): Promise<IdeaResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = await this.ideaRepository.create({ ...data, author: user });

    await this.ideaRepository.save(idea);

    return this.ideaToResponseObject(idea);
  }

  async read(id: string): Promise<IdeaResponse> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!idea) {
      this.throwException();
    }

    const ideaWithOmittedUserToken = this.ideaToResponseObject(idea);

    return ideaWithOmittedUserToken;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<IdeaDTO>,
  ): Promise<IdeaResponse> {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!idea) {
      this.throwException();
    }

    this.ensureOwnership(idea, userId)

    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({ where: { id } });

    const ideaWithOmittedUserToken = this.ideaToResponseObject(idea);

    return ideaWithOmittedUserToken;
  }

  async destroy(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!idea) {
      this.throwException();
    }

    return idea;
  }

  throwException() {
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
  }

  private ideaToResponseObject(idea: IdeaEntity): IdeaResponse {
    const author = idea.author ? idea.author.toResponseObject(false) : null;

    const sanitizedResponse = {
      ...idea,
      author,
    } as IdeaResponse;

    return sanitizedResponse;
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    const { id } = idea.author;
    if (id !== userId) {
      throw new HttpException('Incorrect User', HttpStatus.UNAUTHORIZED);
    }
  }
}
