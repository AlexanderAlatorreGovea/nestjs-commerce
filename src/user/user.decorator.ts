import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User: (...dataOrPipes: unknown[]) => ParameterDecorator =
  createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  });
