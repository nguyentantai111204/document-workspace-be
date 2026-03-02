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
        return this.conversationService.getUserConversations({ userId, workspaceId, query })
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

            return this.conversationService.createDirectConversation({
                workspaceId,
                userId1: userId,
                userId2: participantIds[0],
                name,
            })
        } else {
            // Group chat
            return this.conversationService.createGroupConversation({
                workspaceId,
                creatorId: userId,
                name: name || 'Group Chat',
                participantIds,
            })
        }
    }

    @Get('conversations/:id')
    async getConversation(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.conversationService.getConversationById({ conversationId: id, userId })
    }

    @Patch('conversations/:id')
    async updateConversation(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateConversationDto,
    ) {
        return this.conversationService.updateConversation({ conversationId: id, userId, data: dto })
    }

    @Delete('conversations/:id/leave')
    async leaveConversation(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        await this.conversationService.leaveConversation({ conversationId: id, userId })
        return { success: true }
    }

    @Get('conversations/:id/participants')
    async getParticipants(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.conversationService.getParticipants({ conversationId: id, userId })
    }

    @Post('conversations/:id/participants')
    async addParticipant(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: AddParticipantDto,
    ) {
        return this.conversationService.addParticipant({
            conversationId: id,
            newUserId: dto.userId,
            requesterId: userId,
        })
    }
    @Get('conversations/:id/online')
    async getOnlineParticipants(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.conversationService.getOnlineParticipants({ conversationId: id, userId })
    }
}
