import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { SocketModule } from 'src/common/modules/socket/socket.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        SocketModule
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        NotificationRepository,
    ],
    exports: [NotificationService],
})
export class NotificationModule { }
