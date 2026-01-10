import { HttpStatus } from '@nestjs/common'
import { BaseException } from './base.exception'

export class BadRequestError extends BaseException {
  constructor(
    message = 'Bad request',
    errorCode = 'BAD_REQUEST',
    metadata?: any,
  ) {
    super(message, HttpStatus.BAD_REQUEST, errorCode, metadata)
  }
}

