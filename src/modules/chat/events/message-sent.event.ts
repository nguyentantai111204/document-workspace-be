export class MessageSentEvent {
    constructor(
        public readonly conversationId: string,
        public readonly messageId: string,
    ) { }
}
