import { HttpException, HttpStatus } from '@nestjs/common'

export class BaseException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    metadata?: any,
  ) {
    super(
      {
        message,
        statusCode,
        metadata,
      },
      statusCode,
    )
  }
}
