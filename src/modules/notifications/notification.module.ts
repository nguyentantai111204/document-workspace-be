import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { SocketModule } from 'src/common/modules/socket/socket.module';
import { FirebaseModule } from 'src/common/modules/firebase/firebase.module';
import { UserDevice } from './entities/user-device.entity';
import { UserDeviceRepository } from './repositories/user-device.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, UserDevice]),
        SocketModule,
        FirebaseModule,
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        NotificationRepository,
        UserDeviceRepository,
    ],
    exports: [NotificationService],
})
export class NotificationModule { }
