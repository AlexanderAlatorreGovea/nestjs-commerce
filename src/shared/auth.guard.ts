import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      return false;
    }

    request.user = await this.validateToken(request.headers.authorization);

    return true;
  }

  async validateToken(auth: string) {
    if (auth.split(' ')[0] !== 'Bearer') {
      const ERROR = 'Invalid Token';
      throw new HttpException(ERROR, HttpStatus.FORBIDDEN);
    }

    const token = auth.split(' ')[1];
    const { SECRET } = process.env;

    try {
      const decoded = jwt.verify(token, SECRET);

      return decoded;
    } catch (error) {
      const message = 'Token error: ' + (error.message || error.name);

      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }
}
