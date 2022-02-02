import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
  showCommentByIdea(@Param('id') id: string) {
    return this.commentService.show(id);
  } 

  @Get('user/:id')
  showCommentByUser(@Param('id') user) {}

  @Post('idea/:id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createComment(@Param('id') idea: string, @User('id') user, @Body() data) {}

  @Get(':id')
  showComment(@Param('id') id: string) {}

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroyComments(@Param('id') id: string, @User('id') user) {}
}
