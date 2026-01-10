import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { User } from "../entities/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "../service/user.service";

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getMe(@CurrentUser() user: User) {
        return user;
    }

    @Patch('change-password')
    @ApiOperation({ summary: 'Đổi mật khẩu' })
    async changePassword(
        @CurrentUser() user: User,
        @Body() dto: ChangePasswordDto
    ) {
        return this.usersService.changePassword(user.id, dto);
    }
}