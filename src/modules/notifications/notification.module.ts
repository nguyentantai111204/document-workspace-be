import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        NotificationRepository,
    ],
    exports: [NotificationService],
})
export class NotificationModule { }
