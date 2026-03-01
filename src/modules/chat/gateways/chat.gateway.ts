import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger, UseGuards, forwardRef, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { MessageService } from '../services/message.service'
import { ConversationService } from '../services/conversation.service'
import { ChatOnlineService } from '../services/chat-online.service'
import { SendMessageDto } from '../dto/send-message.dto'

interface AuthenticatedSocket extends Socket {
    data: {
        user: {
            sub: string
            email: string
        }
    }
}

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:5173', 'https://hr0z8kcl-5173.asse.devtunnels.ms'],
        credentials: true,
    },
    namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    private readonly logger = new Logger(ChatGateway.name)

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => MessageService))
        private readonly messageService: MessageService,
        private readonly conversationService: ConversationService,
        private readonly chatOnlineService: ChatOnlineService,
    ) { }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            const token = this.extractToken(client)

            if (!token) {
                this.logger.warn(`Client ${client.id} missing token`)
                client.disconnect()
                return
            }

            const secret = this.configService.get<string>('jwt.secret')
            const payload = this.jwtService.verify(token, { secret })

            client.data.user = payload
            const userId = payload.sub

            await this.chatOnlineService.setUserOnline(userId, client.id)
            await this.chatOnlineService.setUserPresence(userId)

            client.join(`user:${userId}`)

            this.logger.log(`Chat client ${client.id} connected. User: ${userId}`)

            this.server.emit('user-online', { userId })

        } catch (error) {
            this.logger.error(`Connection unauthorized: ${error.message}`)
            client.disconnect()
        }
    }

    @SubscribeMessage('heartbeat')
    async handleHeartbeat(@ConnectedSocket() client: AuthenticatedSocket) {
        const userId = client.data.user.sub
        await this.chatOnlineService.setUserPresence(userId)
        return { success: true }
    }

    async handleDisconnect(client: AuthenticatedSocket) {
        const userId = client.data.user?.sub

        if (userId) {
            await this.chatOnlineService.setUserOffline(userId, client.id)

            const isStillOnline = await this.chatOnlineService.isUserOnline(userId)

            if (!isStillOnline) {
                this.server.emit('user-offline', {
                    userId,
                    lastSeenAt: new Date(),
                })
            }

            this.logger.log(`Chat client ${client.id} disconnected. User: ${userId}`)
        }
    }

    @SubscribeMessage('send-message')
    async handleSendMessage(
        @MessageBody() dto: SendMessageDto & { conversationId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            const userId = client.data.user.sub
            const { conversationId, content, attachments } = dto

            const message = await this.messageService.sendMessage(
                conversationId,
                userId,
                content,
                attachments,
            )

            this.server.to(`conversation:${conversationId}`).emit('new-message', message)

            return { success: true, message }
        } catch (error) {
            this.logger.error(`Error sending message: ${error.message}`)
            return { success: false, error: error.message }
        }
    }

    @SubscribeMessage('typing-start')
    async handleTypingStart(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        const userId = client.data.user.sub
        const { conversationId } = data

        client.to(`conversation:${conversationId}`).emit('user-typing', {
            conversationId,
            userId,
        })
    }

    @SubscribeMessage('typing-stop')
    async handleTypingStop(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        const userId = client.data.user.sub
        const { conversationId } = data

        client.to(`conversation:${conversationId}`).emit('user-stop-typing', {
            conversationId,
            userId,
        })
    }

    @SubscribeMessage('mark-read')
    async handleMarkRead(
        @MessageBody() data: { messageId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            const userId = client.data.user.sub
            const { messageId } = data

            await this.messageService.markAsRead(messageId, userId)

            const message = await this.messageService['messageRepo'].findById(messageId)

            if (message) {
                this.server.to(`conversation:${message.conversationId}`).emit('message-read', {
                    messageId,
                    userId,
                    readAt: new Date(),
                })
            }

            return { success: true }
        } catch (error) {
            this.logger.error(`Error marking message as read: ${error.message}`)
            return { success: false, error: error.message }
        }
    }

    @SubscribeMessage('join-conversation')
    async handleJoinConversation(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        const { conversationId } = data
        client.join(`conversation:${conversationId}`)
        return { success: true }
    }

    @SubscribeMessage('leave-conversation')
    async handleLeaveConversation(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        const { conversationId } = data
        client.leave(`conversation:${conversationId}`)
        return { success: true }
    }

    emitToConversation(conversationId: string, event: string, data: any) {
        this.server.to(`conversation:${conversationId}`).emit(event, data)
    }

    emitToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data)
    }

    private extractToken(client: Socket): string | undefined {
        // Check auth handshake (ưu tiên để frontend có thể gửi token tường minh)
        if (client.handshake.auth?.token) {
            return client.handshake.auth.token
        }
        // Check query param
        if (client.handshake.query?.token) {
            return client.handshake.query.token as string
        }
        // Check Authorization header
        const authHeader = client.handshake.headers.authorization
        if (authHeader) {
            const [type, token] = authHeader.split(' ')
            if (type === 'Bearer') return token
        }
        // Đọc accessToken từ HttpOnly cookie (gửi tự động khi withCredentials: true)
        const cookieHeader = client.handshake.headers.cookie
        if (cookieHeader) {
            const cookies: Record<string, string> = Object.fromEntries(
                cookieHeader.split(';').map(c => {
                    const [key, ...val] = c.trim().split('=')
                    return [key, decodeURIComponent(val.join('='))]
                })
            )
            if (cookies['accessToken']) return cookies['accessToken']
        }
        return undefined
    }
}
