import { StringValue } from 'ms';
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // giải mã token ở đây
            secretOrKey: process.env.JWT_SECRET as StringValue,
        })
    }

    async validate(payload: any) {
        return {
            id: payload.sub,
            email: payload.email,
            status: payload.status,
        }
    }
}

