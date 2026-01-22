import {
    Controller, Post, UseGuards, Body, Request, HttpCode, HttpStatus, UsePipes, ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LogoutDto } from '../dto/logout.dto';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { BypassResponseFormat } from 'src/common/interceptors/bypass-response-format.interceptor';

@ApiTags('Auth') // Nhóm API trong Swagger
@UsePipes(new ValidationPipe({ transform: true })) // Thêm validation pipe
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Đăng ký người dùng mới' })
    @ApiResponse({ status: 201, description: 'Người dùng được tạo thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiBody({ type: RegisterDto })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    @BypassResponseFormat()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đăng nhập' })
    @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
    @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
    @ApiBody({ type: LoginDto })
    login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('refresh')
    @BypassResponseFormat()
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Làm mới access token' })
    @ApiResponse({ status: 200, description: 'Lấy token mới thành công' })
    refresh(@Request() req) {
        return this.authService.refresh(
            req.userId,
            req.refreshToken,
            req.deviceId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @BypassResponseFormat()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Đăng xuất khỏi thiết bị hiện tại' })
    @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
    @ApiBody({ type: LogoutDto })
    logout(@Request() req, @Body() dto: LogoutDto) {
        return this.authService.logout(req.user.userId, dto.refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    @BypassResponseFormat()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Đăng xuất khỏi tất cả thiết bị' })
    @ApiResponse({ status: 200, description: 'Đăng xuất tất cả thành công' })
    logoutAll(@Request() req) {
        return this.authService.logoutAll(req.user.userId);
    }
}
