import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Votes } from 'shared/votes.enum';
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
      relations: ['author', 'upvotes', 'downvotes'],
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

    this.ensureOwnership(idea, userId);

    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });

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

    return this.ideaToResponseObject(idea);
  }

  throwException() {
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
  }

  private ideaToResponseObject(idea: IdeaEntity): IdeaResponse {
    const author = idea.author ? idea.author.toResponseObject(false) : null;

    const responseObject: any = {
      ...idea,
      author,
    };

    if (idea.upvotes) {
      responseObject.upvotes = idea.upvotes.length;
    }

    if (idea.downvotes) {
      responseObject.downvotes = idea.downvotes.length;
    }

    return responseObject;
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    const { id } = idea.author;
    if (id !== userId) {
      throw new HttpException('Incorrect User', HttpStatus.UNAUTHORIZED);
    }
  }

  async bookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    const bookmarkedIdea = user.bookmarks.filter(
      (bookmark) => bookmark.id === idea.id,
    ).length;

    if (!bookmarkedIdea) {
      user.bookmarks.push(idea);

      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Idea already bookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.toResponseObject();
  }

  async unBookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });
    const existingBookmark = user.bookmarks.filter(
      (bookmark) => bookmark.id === idea.id,
    ).length;

    if (existingBookmark) {
      user.bookmarks = user.bookmarks.filter(
        (bookmark) => bookmark.id !== idea.id,
      );

      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Idea already bookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.toResponseObject();
  }

  async upvote(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    idea = await this.vote(idea, user, Votes.UP);

    return this.ideaToResponseObject(idea);
  }

  async downvote(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    idea = await this.vote(idea, user, Votes.DOWN);

    return this.ideaToResponseObject(idea);
  }

  private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
    const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;
    if (
      idea[opposite].filter((voter) => voter.id === user.id).length > 0 ||
      idea[vote].filter((voter) => voter.id === user.id).length > 0
    ) {
      idea[opposite] = idea[opposite].filter((voter) => voter.id !== user.id);
      idea[vote] = idea[vote].filter((voter) => voter.id !== user.id);
      await this.ideaRepository.save(idea);
    } else if (idea[vote].filter((voter) => voter.id === user.id).length < 1) {
      idea[vote].push(user);
      await this.ideaRepository.save(idea);
    } else {
      throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
    }

    return idea;
  }
}
