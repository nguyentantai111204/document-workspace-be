import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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

    response.status(status).json({
      ...body,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
