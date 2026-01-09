import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from 'src/modules/users/service/user.service'
import { randomUUID } from 'crypto'
import { KeyTokenService } from './key-token.service'
import { calcRefreshTokenExpireTime } from 'src/common/utils/day-time.utils'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly keyTokenService: KeyTokenService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) return null

    const match = await bcrypt.compare(password, user.password)
    if (!match) return null

    const { password: _, ...safeUser } = user
    return safeUser
  }

  async login(user: any, deviceId?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      status: user.status,
    }

    const accessToken = this.jwtService.sign(payload)

    const refreshToken = randomUUID()

    const expiresAt = calcRefreshTokenExpireTime();

    await this.keyTokenService.create({
      user,
      refreshToken,
      deviceId,
      expiresAt,
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    }
  }

  async refresh(userId: string, refreshToken: string) {
    const keyToken = await this.keyTokenService.findAndVerify(
      refreshToken,
      userId,
    )

    if (!keyToken) {
      // reuse detected
      await this.keyTokenService.revokeAll(userId)
      throw new UnauthorizedException('Phát hiện lỗi refresh token!!!')
    }
    await this.keyTokenService.revoke(keyToken)

    const user = keyToken.user

    return this.login(user)
  }

  async logout(userId: string, refreshToken: string) {
    const keyToken = await this.keyTokenService.findAndVerify(
      refreshToken,
      userId,
    )

    if (keyToken) {
      await this.keyTokenService.revoke(keyToken)
    }

    return { success: true }
  }


  async logoutAll(userId: string) {
    await this.keyTokenService.revokeAll(userId)
    return { success: true }
  }
}

