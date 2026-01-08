import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { UsersService } from "../service/user.service"
import { User } from "../entities/user.entity"
import { CurrentUser } from "src/common/decorators/current-user.decorator"

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user' })
    getMe(@CurrentUser() user: User) {
        return user
    }
}

