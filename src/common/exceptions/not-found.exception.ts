import { HttpStatus } from '@nestjs/common'
import { BaseException } from './base.exception'

export class NotFoundError extends BaseException {
    constructor(
        message = 'Resource not found',
        errorCode = 'RESOURCE_NOT_FOUND',
        metadata?: any,
    ) {
        super(message, HttpStatus.NOT_FOUND, errorCode, metadata)
    }
}
