import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { KeyTokenService } from 'src/modules/key-token/service/key-token.service'

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly keyTokenService: KeyTokenService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()

    const refreshToken = req.body?.refreshToken
    if (!refreshToken) {
      throw new UnauthorizedException('Thiếu refresh token')
    }

    const userId = req.body?.userId
    if (!userId) {
      throw new UnauthorizedException('Thiếu userId')
    }

    const keyToken = await this.keyTokenService.findAndVerify(
      refreshToken,
      userId,
    )

    if (!keyToken) {
      await this.keyTokenService.revokeAll(userId)
      throw new UnauthorizedException('Refresh token không hợp lệ')
    }

    // attach vào request
    req['userId'] = keyToken.user.id
    req['refreshToken'] = refreshToken
    req['deviceId'] = keyToken.deviceId

    return true
  }
}
