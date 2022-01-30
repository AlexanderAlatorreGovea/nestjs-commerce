import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'user/user.entity';
import { IdeaDTO } from './idea.dto';

import { IdeaEntity } from './idea.entity';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll() {
    return await this.ideaRepository.find({
      relations: ['author'],
    });
  }

  async create(userId: string, data: IdeaDTO) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = await this.ideaRepository.create({ ...data, author: user });
    console.log("user: ",user)
    console.log("idea: ",idea)
    await this.ideaRepository.save(idea);

    return { ...idea, author: idea.author.toResponseObject(false) };
  }

  async read(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
    });

    if (!idea) {
      this.throwException();
    }

    return idea;
  }

  async update(id: string, data: Partial<IdeaDTO>) {
    let idea = await this.ideaRepository.findOne({ where: { id } });

    if (!idea) {
      this.throwException();
    }

    await this.ideaRepository.update({ id }, data);

    idea = await this.ideaRepository.findOne({ where: { id } });

    return idea;
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
}
