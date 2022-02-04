import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';

const getLoggerMessage = ({ method, url, now, context }) => {
  const logMessage = `${method} ${url} ${Date.now() - now}ms`;
  const name = context.getClass().name;

  return Logger.log(logMessage, name);
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (!req) {
      const ctx: any = GqlExecutionContext.create(context);
      const resolverName = ctx.constructorRef.name;
      const info = ctx.getInfo();

      return handler
        .handle()
        .pipe(
          tap(() =>
            Logger.log(
              `${info.parentType} "${info.fieldName}" ${Date.now() - now}ms`,
              resolverName,
            ),
          ),
        );
    }

    const method = req.method;
    const url = req.url;
    const now = Date.now();

    const logMessage = getLoggerMessage({
      method,
      url,
      now,
      context,
    });

    return handler.handle().pipe(tap(() => logMessage));
  }
}
