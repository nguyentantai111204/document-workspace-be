import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UsersModule } from '../users/user.module'
import { AuthService } from './service/auth.service'
import { AuthController } from './controller/auth.controller'

import { StringValue } from 'ms'

@Module({
    imports: [
        UsersModule,
        PassportModule,
        ConfigModule,

        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const secret = config.get<string>('jwt.secret')
                const expiresIn = config.get<string>('jwt.expiresIn') as StringValue

                if (!secret || !expiresIn) {
                    throw new Error('JWT config is missing')
                }

                return {
                    secret,
                    signOptions: {
                        expiresIn,
                    },
                }
            },
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule { }
