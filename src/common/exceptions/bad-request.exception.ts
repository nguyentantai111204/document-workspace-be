import { HttpStatus } from '@nestjs/common'
import { BaseException } from './base.exception'

export class BadRequestError extends BaseException {
  constructor(message = 'Bad request', metadata?: any) {
    super(message, HttpStatus.BAD_REQUEST, metadata)
  }
}
