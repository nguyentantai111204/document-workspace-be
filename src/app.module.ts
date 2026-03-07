import { Module } from '@nestjs/common';
import { CoreModule } from './modules/core/core.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [CoreModule, EventEmitterModule.forRoot()],
})
export class AppModule { }
