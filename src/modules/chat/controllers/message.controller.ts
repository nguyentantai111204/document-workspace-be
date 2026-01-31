import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { MessageService } from '../services/message.service'
import { SendMessageDto } from '../dto/send-message.dto'
import { GetMessagesDto } from '../dto/get-messages.dto'

@Controller()
@UseGuards(JwtAuthGuard)
export class MessageController {
    constructor(private readonly messageService: MessageService) { }

    @Get('conversations/:id/messages')
    async getMessages(
        @Param('id') conversationId: string,
        @CurrentUser('sub') userId: string,
        @Query() query: GetMessagesDto,
    ) {
        return this.messageService.getMessages(
            conversationId,
            userId,
            query.limit,
            query.cursor,
        )
    }

    @Post('conversations/:id/messages')
    async sendMessage(
        @Param('id') conversationId: string,
        @CurrentUser('sub') userId: string,
        @Body() dto: SendMessageDto,
    ) {
        return this.messageService.sendMessage(
            conversationId,
            userId,
            dto.content,
            dto.attachments,
        )
    }

    @Patch('messages/:id/read')
    async markAsRead(
        @Param('id') messageId: string,
        @CurrentUser('sub') userId: string,
    ) {
        return this.messageService.markAsRead(messageId, userId)
    }

    @Patch('conversations/:id/read-all')
    async markAllAsRead(
        @Param('id') conversationId: string,
        @CurrentUser('sub') userId: string,
    ) {
        return this.messageService.markAllAsRead(conversationId, userId)
    }

    @Get('conversations/:id/unread-count')
    async getUnreadCount(
        @Param('id') conversationId: string,
        @CurrentUser('sub') userId: string,
    ) {
        const count = await this.messageService.getUnreadCount(conversationId, userId)
        return { unreadCount: count }
    }

    @Get('workspaces/:workspaceId/messages/search')
    async searchMessages(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser('sub') userId: string,
        @Query('q') searchTerm: string,
        @Query('limit') limit?: number,
    ) {
        return this.messageService.searchMessages(
            userId,
            workspaceId,
            searchTerm,
            limit ? parseInt(limit.toString()) : 20,
        )
    }
}
