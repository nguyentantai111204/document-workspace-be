import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_RESPONSE_FORMAT_KEY } from './bypass-response-format.interceptor';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        const bypassFormat = this.reflector.get<boolean>(
            BYPASS_RESPONSE_FORMAT_KEY,
            context.getHandler(),
        );

        if (bypassFormat) {
            return next.handle();
        }
        return next.handle().pipe(
            map((data) => {
                if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
                    return {
                        success: true,
                        data: data.items || [],
                        meta: data.meta,
                        message: 'Success',
                    }
                }

                return {
                    success: true,
                    data: data || null,
                    meta: null,
                    message: 'Success',
                }
            }),
        )
    }
}
