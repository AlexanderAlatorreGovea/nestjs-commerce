import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'shared/auth.guard';
import { User } from 'user/user.decorator';
import { CommentService } from './comment.service';

@Controller('api/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('idea/:id')
  showCommentByIdea(@Param('id') id: string, @Query('page') page: number) {
    return this.commentService.showByIdea(id, page);
  }

  @Get('user/:id')
  showCommentByUser(@Param('id') user) {
    return this.commentService.showByUser(user.id);
  }

  @Post('idea/:id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createComment(@Param('id') idea: string, @User('id') user, @Body() data) {
    return this.commentService.create(idea, user.id, data);
  }

  @Get(':id')
  showComment(@Param('id') id: string) {
    return this.commentService.show(id);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroyComments(@Param('id') id: string, @User('id') user) {
    return this.commentService.destroy(id, user.id);
  }
}
