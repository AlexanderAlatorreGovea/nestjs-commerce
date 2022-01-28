import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
    constructor(private userService: UserService) { }

    @Get('api/users')
    showAllUsers() {
        return this.userService.showAll()
    }

    @Post('/login')
    login() {
        return this.userService.login()
    }

    @Post('/register')
    register() {
        return this.userService.register()
    }
}
