import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserDTO } from './user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('api/users')
  showAllUsers(@Query('page') page: number) {
    return this.userService.showAll(page);
  }
 
  @Post('/login')
  @UsePipes(new ValidationPipe())
  login(@Body() data) {
    return this.userService.login(data);
  }

  @Post('/register')
  @UsePipes(new ValidationPipe())
  register(@Body() data: UserDTO) {
    return this.userService.register(data);
  }
}
