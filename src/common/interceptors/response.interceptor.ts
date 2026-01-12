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
            map((data) => {
                // pagination
                if (data?.items && data?.meta) {
                    return {
                        success: true,
                        data: data.items,
                        meta: data.meta,
                        message: 'Success',
                    }
                }

                return {
                    success: true,
                    data,
                    meta: null,
                    message: 'Success',
                }
            }),
        )
    }
}
