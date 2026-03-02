import { ConversationQueryDto } from "../dto/conversation-query.dto";

export interface CreateDirectConversation {
    workspaceId: string;
    userId1: string;
    userId2: string;
    name?: string;
}

export interface CreateGroupConversation {
    workspaceId: string;
    creatorId: string;
    name: string;
    participantIds: string[];
}

export interface GetUserConversations {
    userId: string;
    workspaceId: string;
    query: ConversationQueryDto;
}

export interface GetConversation {
    conversationId: string;
    userId: string;
}

export interface UpdateConversation {
    conversationId: string;
    userId: string;
    data: { name?: string; avatarUrl?: string };
}

export interface AddParticipant {
    conversationId: string;
    newUserId: string;
    requesterId: string;
}

export interface LeaveConversation {
    conversationId: string;
    userId: string;
}

export interface GetParticipants {
    conversationId: string;
    userId: string;
}

export interface GetOnlineParticipants {
    conversationId: string;
    userId: string;
}