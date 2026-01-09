import { Controller, Post, UseGuards, Body, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from '../service/auth.service'
import { RegisterDto } from '../dto/register.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    login(@Request() req) {
        return this.authService.login(req.user)
    }

    @Post('refresh')
    refresh(@Body() dto: { userId: string; refreshToken: string }) {
        return this.authService.refresh(dto.userId, dto.refreshToken)
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Request() req, @Body('refreshToken') refreshToken: string) {
        return this.authService.logout(req.user.sub, refreshToken)
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    logoutAll(@Request() req) {
        return this.authService.logoutAll(req.user.sub)
    }
}

