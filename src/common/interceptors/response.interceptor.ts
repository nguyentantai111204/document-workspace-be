import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { map } from 'rxjs/operators'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(_: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            map((data) => ({
                success: true,
                data,
                message: 'Success',
                meta: null,
            })),
        )
    }
}

