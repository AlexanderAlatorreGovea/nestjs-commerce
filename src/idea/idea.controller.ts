import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'shared/auth.guard';
import { User } from 'user/user.decorator';
import { UserResponse } from 'user/user.dto';
import { IdeaDTO } from './idea.dto';
import { IdeaService } from './idea.service';

@Controller('api/ideas')
export class IdeaController {
  constructor(private ideaService: IdeaService) {}

  @Get()
  showAllIdeas() {
    return this.ideaService.showAll();
  }

  @Post()
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createIdea(@User() user, @Body() body: IdeaDTO) {
    const { id, ...rest } = user;

    return this.ideaService.create(id, body);
  }

  @Get(':id')
  readIdea(@Param('id') id: string) {
    return this.ideaService.read(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseGuards(new AuthGuard())
  updateIdea(
    @Param('id') id: string,
    @User() user: UserResponse,
    @Body() data: Partial<IdeaDTO>,
  ) {
    return this.ideaService.update(id, user.id, data);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroyIdea(@Param('id') id: string, @User() user) {
    return this.ideaService.destroy(id, user.id);
  }

  @Post(':id/upvote')
  @UseGuards(new AuthGuard())
  upVoteIdeas(@Param('id') id: string, @User('id') user) {
    return this.ideaService.upvote(id, user.id);
  }

  @Post(':id/downvote')
  @UseGuards(new AuthGuard())
  DownVoteIdeas(@Param('id') id: string, @User('id') user) {
    return this.ideaService.downvote(id, user.id);
  }

  @Post(':id/boomark')
  @UseGuards(new AuthGuard())
  bookmarkIdea(@Param('id') id: string, @User('id') user) {
    console.log('user: ', user);
    return this.ideaService.bookmark(id, user.id);
  }

  @Post(':id/boomark')
  @UseGuards(new AuthGuard())
  unBookmarkIdea(@Param('id') id: string, @User('id') user) {
    return this.ideaService.unBookmark(id, user.id);
  }
}
