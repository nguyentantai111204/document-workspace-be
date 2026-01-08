import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class AppLogger {
  private readonly logger = new Logger()

  log(message: string, context?: string) {
    this.logger.log(message, context)
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context)
  }

  error(message: string, stack?: string, context?: string) {
    this.logger.error(message, stack, context)
  }
}
