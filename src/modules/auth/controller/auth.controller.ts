import {
    Controller, Post, UseGuards, Body, Request, HttpCode, HttpStatus, UsePipes, ValidationPipe, Res
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { AuthCookieHelper } from '../utils/auth-cookie.helper';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { BypassResponseFormat } from 'src/common/interceptors/bypass-response-format.interceptor';

@ApiTags('Auth')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly authCookieHelper: AuthCookieHelper,
    ) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Đăng ký người dùng mới' })
    @ApiResponse({ status: 201, description: 'Người dùng được tạo thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiBody({ type: RegisterDto })
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.register(dto);
        this.authCookieHelper.setCookies(res, result.accessToken, result.refreshToken, result.user.id);
        const { accessToken, refreshToken, ...rest } = result;
        return rest;
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    @BypassResponseFormat()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đăng nhập' })
    @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
    @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
    @ApiBody({ type: LoginDto })
    async login(
        @Request() req,
        @Body() body: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.login(req.user, body.deviceId);
        this.authCookieHelper.setCookies(res, result.accessToken, result.refreshToken, result.user.id);
        const { accessToken, refreshToken, ...rest } = result;
        return rest;
    }

    @Post('refresh')
    @BypassResponseFormat()
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Làm mới access token' })
    @ApiResponse({ status: 200, description: 'Lấy token mới thành công' })
    async refresh(
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.refresh(
            req.userId,
            req.refreshToken,
            req.deviceId,
        );
        this.authCookieHelper.setCookies(res, result.accessToken, result.refreshToken, req.userId);
        const { accessToken, refreshToken, ...rest } = result;
        return rest;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @BypassResponseFormat()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Đăng xuất khỏi thiết bị hiện tại' })
    @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
    async logout(
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.logout(req.user.id, req.cookies?.refreshToken);
        this.authCookieHelper.clearCookies(res);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    @BypassResponseFormat()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Đăng xuất khỏi tất cả thiết bị' })
    @ApiResponse({ status: 200, description: 'Đăng xuất tất cả thành công' })
    async logoutAll(
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.logoutAll(req.user.id);
        this.authCookieHelper.clearCookies(res);
        return result;
    }
}
