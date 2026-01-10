import { Controller, Post, UseGuards, Body, Request, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from '../service/auth.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { LogoutDto } from '../dto/logout.dto'
import { RefreshTokenGuard } from '../guards/refresh-token.guard'
import { RegisterDto } from '../dto/register.dto'


@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true })) // Thêm validation pipe
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Request() req) {
        return this.authService.login(req.user)
    }

    @Post('refresh')
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK)
    refresh(@Request() req) {
        return this.authService.refresh(
            req.userId,
            req.refreshToken,
            req.deviceId,
        )
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(
        @Request() req,
        @Body() dto: LogoutDto
    ) {
        return this.authService.logout(req.user.userId, dto.refreshToken)
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    logoutAll(@Request() req) {
        return this.authService.logoutAll(req.user.userId)
    }
}