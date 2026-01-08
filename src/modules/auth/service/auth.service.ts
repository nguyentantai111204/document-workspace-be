import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from 'src/modules/users/service/user.service'
import { LoginDto } from '../dto/login.dto'
import { RegisterDto } from '../dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) return null

    const match = await bcrypt.compare(
      String(password),
      user.password,
    )
    if (!match) return null

    const { password: _, ...safeUser } = user
    return safeUser
  }


  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      status: user.status,
      // roles: user.roles, // sau này
      // tokenVersion: user.tokenVersion,
    }

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      }
    }
  }

  async register(data: RegisterDto) {

    return this.usersService.create(data)
  }
}
