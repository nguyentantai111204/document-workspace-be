import {
    Body, Controller, Get, Patch, Query, UseGuards,
    UploadedFiles, UseInterceptors
} from "@nestjs/common";
import {
    ApiBearerAuth, ApiOperation, ApiTags, ApiResponse,
    ApiBody, ApiConsumes
} from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { UpdateProfileDto } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "../services/user.service";
import { BypassResponseFormat } from "src/common/interceptors/bypass-response-format.interceptor";
import { SearchUsersDto } from "../dto/search-users.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import multer from "multer";

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @BypassResponseFormat()
    @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
    @ApiResponse({ status: 200, description: 'Trả về thông tin user', type: User })
    async getMe(@CurrentUser() user: User) {
        return this.usersService.findById(user.id);
    }

    @Patch('me')
    @UseInterceptors(
        FileFieldsInterceptor(
            [{ name: 'avatar', maxCount: 1 }],
            {
                storage: multer.memoryStorage(),
                limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
            },
        ),
    )
    @ApiOperation({
        summary: 'Cập nhật profile (thông tin + avatar + đổi mật khẩu). Gửi multipart/form-data.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                fullName: { type: 'string', description: 'Họ và tên' },
                phoneNumber: { type: 'string', description: 'Số điện thoại' },
                address: { type: 'string', description: 'Địa chỉ' },
                avatarUrl: { type: 'string', description: 'URL avatar (nếu tự upload riêng)' },
                avatar: { type: 'string', format: 'binary', description: 'File avatar (ưu tiên hơn avatarUrl)' },
                currentPassword: { type: 'string', description: 'Mật khẩu hiện tại (bắt buộc nếu muốn đổi pass)' },
                newPassword: { type: 'string', description: 'Mật khẩu mới' },
                confirmPassword: { type: 'string', description: 'Xác nhận mật khẩu mới' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công, trả về profile mới nhất' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async updateMe(
        @CurrentUser() user: User,
        @Body() dto: UpdateProfileDto,
        @UploadedFiles() files: { avatar?: Express.Multer.File[] },
    ) {
        return this.usersService.updateProfile({
            userId: user.id,
            dto,
            avatarFile: files?.avatar?.[0],
        });
    }

    @Get('search')
    @ApiOperation({ summary: 'Tìm kiếm người dùng theo email hoặc tên' })
    @ApiResponse({ status: 200, description: 'Danh sách người dùng tìm được', type: [User] })
    async searchUsers(@Query() dto: SearchUsersDto) {
        return this.usersService.searchUsers(dto);
    }

    @Patch('change-password')
    @ApiOperation({ summary: 'Đổi mật khẩu (legacy — dùng PATCH /users/me thay thế)' })
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
