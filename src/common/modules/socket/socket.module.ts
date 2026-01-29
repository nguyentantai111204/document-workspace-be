import { Module, Global } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { SocketGateway } from './socket.gateway';

@Global()
@Module({
    imports: [AuthModule, JwtModule],
    providers: [SocketGateway],
    exports: [SocketGateway],
})
export class SocketModule { }
