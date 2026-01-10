import { Module } from '@nestjs/common';
import { CoreModule } from './modules/core/core.module';
import { AppLogger } from './common/logger/app-logger.service';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [CoreModule],
  providers: [
    AppLogger,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }
