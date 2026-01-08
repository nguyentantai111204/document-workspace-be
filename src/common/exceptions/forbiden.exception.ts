import { HttpStatus } from '@nestjs/common'
import { BaseException } from './base.exception'

export class ForbiddenError extends BaseException {
  constructor(
    message = 'Forbidden',
    metadata?: any,
  ) {
    super(message, HttpStatus.FORBIDDEN, metadata)
  }
}
