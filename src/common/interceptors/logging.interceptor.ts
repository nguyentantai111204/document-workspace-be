import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { AppLogger } from '../logger/app-logger.service'
import { LOG_CONTEXT } from '../constants/log-context.constant'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const { method, url } = req
    const start = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const time = Date.now() - start
          this.logger.log(
            `${method} ${url} - ${time}ms`,
            LOG_CONTEXT.HTTP,
          )
        },
        error: (err) => {
          const time = Date.now() - start
          this.logger.error(
            `${method} ${url} - ${time}ms`,
            err.stack,
            LOG_CONTEXT.HTTP,
          )
        },
      }),
    )
  }
}
