import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { BullModule } from '@nestjs/bull'
import { NotificationsProcessor } from './processors/notifications.processor'

import { Conversation } from './entities/conversation.entity'
import { ConversationParticipant } from './entities/conversation-participant.entity'
import { Message } from './entities/message.entity'
import { MessageRead } from './entities/message-read.entity'
import { UserDevice } from '../notifications/entities/user-device.entity'
import { User } from '../users/entities/user.entity'

import { ConversationRepository } from './repositories/conversation.repository'
import { ConversationParticipantRepository } from './repositories/conversation-participant.repository'
import { MessageRepository } from './repositories/message.repository'
import { MessageReadRepository } from './repositories/message-read.repository'
import { UserDeviceRepository } from '../notifications/repositories/user-device.repository'

import { ConversationService } from './services/conversation.service'
import { MessageService } from './services/message.service'
import { ChatOnlineService } from './services/chat-online.service'

import { ConversationController } from './controllers/conversation.controller'
import { MessageController } from './controllers/message.controller'

import { ChatGateway } from './gateways/chat.gateway'

import { WorkspaceModule } from '../workspaces/workspace.module'
import { RedisModule } from 'src/common/modules/redis/redis.module'
import { FirebaseModule } from 'src/common/modules/firebase/firebase.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Conversation,
            ConversationParticipant,
            Message,
            MessageRead,
            UserDevice,
            User,
        ]),
        JwtModule.register({}),
        forwardRef(() => WorkspaceModule),
        RedisModule,
        FirebaseModule,
        BullModule.registerQueue({
            name: 'notifications',
        }),
    ],
    providers: [
        // Repositories
        ConversationRepository,
        ConversationParticipantRepository,
        MessageRepository,
        MessageReadRepository,
        UserDeviceRepository,

        // Services
        ConversationService,
        MessageService,
        ChatOnlineService,

        // Gateway
        ChatGateway,
        NotificationsProcessor,
    ],
    controllers: [
        ConversationController,
        MessageController,
    ],
    exports: [
        ConversationService,
        MessageService,
        ChatOnlineService,
        ChatGateway,
    ],
})
export class ChatModule { }
