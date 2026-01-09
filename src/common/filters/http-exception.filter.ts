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
        let message: string | string[] = 'Internal server error'
        let errorCode = 'INTERNAL_ERROR'

        if (exception instanceof HttpException) {
            status = exception.getStatus()
            const res = exception.getResponse() as any

            message = res?.message ?? exception.message
            errorCode = res?.errorCode ?? exception.name
        }

        // LOG SERVER
        this.logger.error(
            `[${status}] ${request.method} ${request.url}`,
            exception instanceof Error ? exception.stack : '',
            LOG_CONTEXT.EXCEPTION,
        )

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            errorCode,
            path: request.url,
            timestamp: new Date().toISOString(),
        })
    }
}
