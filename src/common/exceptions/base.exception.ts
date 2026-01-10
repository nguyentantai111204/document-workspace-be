import { HttpException, HttpStatus } from '@nestjs/common'

export class BaseException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    errorCode: string,
    metadata?: any,
  ) {
    super(
      {
        message,
        statusCode,
        errorCode,
        metadata,
      },
      statusCode,
    )
  }
}
