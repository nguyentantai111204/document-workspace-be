import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from 'src/modules/users/service/user.service'
import { randomUUID } from 'crypto'
import { calcRefreshTokenExpireTime } from 'src/common/utils/day-time.utils'
import { KeyTokenService } from 'src/modules/key-token/service/key-token.service'
import { RegisterDto } from '../dto/register.dto'
import { PermissionService } from 'src/modules/permission/services/permission.service'
import { RedisService } from 'src/common/modules/redis/redis.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly keyTokenService: KeyTokenService,
    private readonly permissionService: PermissionService,
    private readonly redisService: RedisService,
  ) { }

  async validateUser(email: string, rawPassword: string) {
    const user = await this.usersService.findByEmailForAuth(email)
    if (!user) return null

    const match = await bcrypt.compare(rawPassword, user.password)
    if (!match) return null

    const { password, ...safeUser } = user
    return safeUser
  }

  private async issueTokens(user: any, deviceId?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      status: user.status,
    }

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = randomUUID()

    await this.keyTokenService.create({
      user,
      refreshToken,
      deviceId,
      expiresAt: calcRefreshTokenExpireTime(),
    })

    return { accessToken, refreshToken }
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto)

    await this.permissionService.assignDefaultRole(user.id)

    const tokens = await this.issueTokens(user, 'register')

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      ...tokens,
    }
  }


  async login(user: any, deviceId?: string) {
    const tokens = await this.issueTokens(user, deviceId)

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    }
  }

  async refresh(userId: string, refreshToken: string, deviceId?: string) {
    const isBlacklisted = await this.redisService.get(`blacklist:token:${refreshToken}`);
    if (isBlacklisted) throw new UnauthorizedException('Refresh token không hợp lệ (cache)');

    const keyToken = await this.keyTokenService.findAndVerify(
      refreshToken,
      userId,
    )

    if (!keyToken) {
      await this.keyTokenService.revokeAll(userId)
      throw new UnauthorizedException('Refresh token không hợp lệ')
    }

    await this.keyTokenService.revoke(keyToken)

    return this.issueTokens(keyToken.user, deviceId)
  }

  async logout(userId: string, refreshToken: string) {
    const keyToken = await this.keyTokenService.findAndVerify(
      refreshToken,
      userId,
    )

    if (keyToken) {
      await this.keyTokenService.revoke(keyToken)
      const ttl = Math.ceil((keyToken.expiresAt.getTime() - Date.now()) / 1000);
      if (ttl > 0) {
        await this.redisService.set(`blacklist:token:${refreshToken}`, '1', ttl);
      }
    }
    return { success: true }
  }

  async logoutAll(userId: string) {
    await this.keyTokenService.revokeAll(userId)
    return { success: true }
  }
}


