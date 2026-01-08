import { HttpStatus } from '@nestjs/common'
import { BaseException } from './base.exception'

export class NotFoundError extends BaseException {
    constructor(
        message = 'Resource not found',
        metadata?: any,
    ) {
        super(message, HttpStatus.NOT_FOUND, metadata)
    }
}
