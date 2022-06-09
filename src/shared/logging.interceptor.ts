import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

const getLoggerMessage = ({ method, url, now, context }) => {
  const logMessage = `${method} ${url} ${Date.now() - now}ms`;
  const name = context.getClass().name;

  return Logger.log(logMessage, name);
};

@Injectable()
export class LoggingInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<T> {
    const req = context.switchToHttp().getRequest();

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
