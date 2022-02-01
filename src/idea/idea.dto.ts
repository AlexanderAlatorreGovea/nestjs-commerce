import { IsString } from 'class-validator';
import { UserResponse } from 'user/user.dto';

export class IdeaDTO {
  @IsString()
  idea: string;

  @IsString()
  description: string;
}

export class IdeaResponse {
  author: UserResponse;
  id?: string;
  created: Date;
  updated: Date;
  description: string;
  idea: string;
  upvotes?: number;
  downvotes?: number;
}