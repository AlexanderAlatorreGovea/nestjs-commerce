import { IsNotEmpty } from 'class-validator';
import { IdeaEntity } from 'idea/idea.entity';

export class UserDTO {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

export class UserResponse {
  id: string;
  username: string;
  created: Date;
  token?: string;
}

export class UserResponseWithAddedProperties extends UserResponse {
  ideas?: IdeaEntity[];
  token?: string;
  bookmarks?: IdeaEntity[];
}
