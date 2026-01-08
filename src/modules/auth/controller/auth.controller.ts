import { Controller, Post, UseGuards, Body, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from '../service/auth.service'
import { RegisterDto } from '../dto/register.dto'


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user)
    }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }
}
