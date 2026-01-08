import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { LOG_CONTEXT } from '../constants/log-context.constant'
import { AppLogger } from '../logger/app-logger.service'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: AppLogger) { }
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        let status = HttpStatus.INTERNAL_SERVER_ERROR
        let body: any = {
            message: 'Internal server error',
            statusCode: status,
        }

        if (exception instanceof HttpException) {
            status = exception.getStatus()
            const res = exception.getResponse()
            body = typeof res === 'string' ? { message: res } : res
        }

        this.logger.error(
            `${request.method} ${request.url}`,
            exception instanceof Error ? exception.stack : '',
            LOG_CONTEXT.EXCEPTION,
        )

        response.status(status).json({
            ...body,
            path: request.url,
            timestamp: new Date().toISOString(),
        })
    }
}
