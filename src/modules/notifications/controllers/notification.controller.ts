import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { NotificationService } from '../services/notification.service';
import { RegisterDeviceDto } from '../dtos/register-device.dto';
import { UserDeviceRepository } from '../repositories/user-device.repository';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly userDeviceRepo: UserDeviceRepository,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách thông báo' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Danh sách thông báo kèm số lượng chưa đọc' })
    list(
        @CurrentUser() user,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        return this.notificationService.listByUser(user.id, Number(page), Number(limit));
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Đánh dấu tất cả là đã đọc' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    readAll(@CurrentUser() user) {
        return this.notificationService.markAllAsRead(user.id);
    }

    @Post('device')
    @ApiOperation({ summary: 'Register FCM Token cho thiết bị' })
    @ApiBody({ type: RegisterDeviceDto })
    @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
    registerDevice(
        @Body() dto: RegisterDeviceDto,
        @CurrentUser() user,
    ) {
        return this.userDeviceRepo.registerDevice(user.id, dto.token, dto.deviceType);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Đánh dấu một thông báo là đã đọc' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    readOne(
        @Param('id') id: string,
        @CurrentUser() user,
    ) {
        return this.notificationService.markAsRead(id, user.id);
    }
}
