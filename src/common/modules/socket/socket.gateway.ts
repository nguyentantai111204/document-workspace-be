import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:5173', 'https://hr0z8kcl-5173.asse.devtunnels.ms'],
        credentials: true,
    },
    namespace: 'notifications',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(SocketGateway.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                this.logger.warn(`Client ${client.id} missing token`);
                client.disconnect();
                return;
            }

            const secret = this.configService.get<string>('jwt.secret');
            const payload = this.jwtService.verify(token, { secret });

            // nếu user có dùng nhiều thiết bị cũng sẽ vào cùng một room
            client.join(`user:${payload.sub}`);
            this.logger.log(`Client ${client.id} connected. User: ${payload.sub}`);

            client.data.user = payload;

        } catch (error) {
            this.logger.error(`Connection unauthorized: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client ${client.id} disconnected`);
    }

    private extractToken(client: Socket): string | undefined {
        // Check auth handshake (ưu tiên để frontend có thể gửi token tường minh)
        if (client.handshake.auth?.token) {
            return client.handshake.auth.token;
        }
        // Check query param
        if (client.handshake.query?.token) {
            return client.handshake.query.token as string;
        }
        // Check Authorization header
        const authHeader = client.handshake.headers.authorization;
        if (authHeader) {
            const [type, token] = authHeader.split(' ');
            if (type === 'Bearer') return token;
        }
        // Đọc accessToken từ HttpOnly cookie 
        const cookieHeader = client.handshake.headers.cookie;
        if (cookieHeader) {
            const cookies: Record<string, string> = Object.fromEntries(
                cookieHeader.split(';').map(c => {
                    const [key, ...val] = c.trim().split('=');
                    return [key, decodeURIComponent(val.join('='))];
                })
            );
            if (cookies['accessToken']) return cookies['accessToken'];
        }
        return undefined;
    }


    // Method to emit events to specific user
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
}
