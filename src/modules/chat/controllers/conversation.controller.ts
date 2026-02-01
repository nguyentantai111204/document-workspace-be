import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { ConversationService } from '../services/conversation.service'
import { CreateConversationDto } from '../dto/create-conversation.dto'
import { UpdateConversationDto } from '../dto/update-conversation.dto'
import { AddParticipantDto } from '../dto/add-participant.dto'
import { ConversationQueryDto } from '../dto/conversation-query.dto'

@Controller()
@UseGuards(JwtAuthGuard)
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) { }

    @Get('workspaces/:workspaceId/conversations')
    async listConversations(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser('id') userId: string,
        @Query() query: ConversationQueryDto,
    ) {
        return this.conversationService.getUserConversations(userId, workspaceId, query)
    }

    @Post('workspaces/:workspaceId/conversations')
    async createConversation(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: CreateConversationDto,
    ) {
        const { type, name, participantIds } = dto

        if (type === 'DIRECT') {
            // Direct chat with one other user
            if (participantIds.length !== 1) {
                throw new Error('Direct conversation must have exactly 1 other participant')
            }

            return this.conversationService.createDirectConversation(
                workspaceId,
                userId,
                participantIds[0],
            )
        } else {
            // Group chat
            return this.conversationService.createGroupConversation(
                workspaceId,
                userId,
                name || 'Group Chat',
                participantIds,
            )
        }
    }

    @Get('conversations/:id')
    async getConversation(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.conversationService.getConversationById(id, userId)
    }

    @Patch('conversations/:id')
    async updateConversation(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateConversationDto,
    ) {
        return this.conversationService.updateConversation(id, userId, dto)
    }

    @Delete('conversations/:id/leave')
    async leaveConversation(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        await this.conversationService.leaveConversation(id, userId)
        return { success: true }
    }

    @Get('conversations/:id/participants')
    async getParticipants(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.conversationService.getParticipants(id, userId)
    }

    @Post('conversations/:id/participants')
    async addParticipant(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: AddParticipantDto,
    ) {
        return this.conversationService.addParticipant(id, dto.userId, userId)
    }
}
