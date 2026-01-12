import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiBody } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { User } from "../entities/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "../service/user.service";

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
    @ApiResponse({ status: 200, description: 'Trả về thông tin user', type: User })
    getMe(@CurrentUser() user: User) {
        return user;
    }

    @Patch('change-password')
    @ApiOperation({ summary: 'Đổi mật khẩu người dùng' })
    @ApiBody({ type: ChangePasswordDto })
    @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Người dùng chưa đăng nhập' })
    async changePassword(
        @CurrentUser() user: User,
        @Body() dto: ChangePasswordDto
    ) {
        return this.usersService.changePassword(user.id, dto);
    }
}
