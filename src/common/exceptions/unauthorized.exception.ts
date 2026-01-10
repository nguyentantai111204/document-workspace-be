import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./base.exception";

export class UnauthorizedError extends BaseException {
    constructor(
        message = 'Unauthorized',
        errorCode = 'UNAUTHORIZED',
        metadata?: any,
    ) {
        super(message, HttpStatus.UNAUTHORIZED, errorCode, metadata)
    }
}
