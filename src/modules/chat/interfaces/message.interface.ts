import { GetMessagesDto } from "../dto/get-messages.dto";
import { SearchMessagesDto } from "../dto/search-messages.dto";
import { MessageAttachment } from "../entities/message.entity";

export interface SendMessage {
    conversationId: string;
    senderId: string;
    content: string;
    attachments?: MessageAttachment[];
}

export interface GetMessages {
    conversationId: string;
    userId: string;
    query: GetMessagesDto;
}

export interface GetMessagesSince {
    conversationId: string;
    lastMessageId: string;
    userId: string;
}

export interface MarkAsRead {
    messageId: string;
    userId: string;
}

export interface MarkAllAsRead {
    conversationId: string;
    userId: string;
}

export interface GetUnreadCount {
    conversationId: string;
    userId: string;
}

export interface SearchMessages {
    userId: string;
    workspaceId: string;
    query: SearchMessagesDto;
}
