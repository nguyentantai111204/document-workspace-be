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
        origin: '*',
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
        // Check auth handshake
        if (client.handshake.auth?.token) {
            return client.handshake.auth.token;
        }
        // Check query param
        if (client.handshake.query?.token) {
            return client.handshake.query.token as string;
        }
        // Check headers
        const authHeader = client.handshake.headers.authorization;
        if (authHeader) {
            const [type, token] = authHeader.split(' ');
            if (type === 'Bearer') return token;
        }
        return undefined;
    }

    // Method to emit events to specific user
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
}
