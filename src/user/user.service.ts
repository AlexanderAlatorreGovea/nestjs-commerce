import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDTO, UserResponse } from './user.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll(page: number = 1): Promise<UserResponse[]> {
    const relations = ['ideas', 'bookmarks'];
    const users = await this.userRepository.find({
      relations,
      skip: 25 * (page - 1),
      take: 25,
    });

    const userList = users.map((user) => user.toResponseObject(false));

    return userList;
  }

  async login(data: UserDTO): Promise<UserResponse> {
    const { username, password } = data;

    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user || !(await user.comparePassword(password))) {
      const INVALID_DATA = 'Invalid username or Password';

      throw new HttpException(INVALID_DATA, HttpStatus.BAD_REQUEST);
    }

    return user.toResponseObject();
  }

  async register(data: UserDTO): Promise<UserResponse> {
    const { username } = data;
    let user = await this.userRepository.findOne({
      where: { username },
    });

    if (user) {
      const ERROR_MESSAGE = 'User already exists';
      throw new HttpException(ERROR_MESSAGE, HttpStatus.BAD_REQUEST);
    }

    user = await this.userRepository.create(data);

    await this.userRepository.save(user);

    return user.toResponseObject();
  }
}
