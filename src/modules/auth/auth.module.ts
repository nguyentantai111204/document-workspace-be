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
import { NotFoundError } from 'src/common/exceptions/not-found.exception'
import { ScheduleModule } from '@nestjs/schedule'
import { KeyTokenModule } from '../key-token/key-token.module'
import { PermissionModule } from '../permission/permission.module'
import { AuthCookieHelper } from './utils/auth-cookie.helper'

@Module({
    imports: [
        UsersModule,
        PermissionModule,
        PassportModule,
        ConfigModule,
        KeyTokenModule,
        ScheduleModule.forRoot(),

        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const secret = config.get<string>('jwt.secret')
                const expiresIn = config.get<string>('jwt.expiresIn') as StringValue

                if (!secret || !expiresIn) {
                    throw new NotFoundError('Không tìm thấy cấu hình JWT')
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
    providers: [AuthService, LocalStrategy, JwtStrategy, AuthCookieHelper],
    controllers: [AuthController],
    exports: [AuthCookieHelper],
})
export class AuthModule { }
