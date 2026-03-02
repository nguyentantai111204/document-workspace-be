export interface SetUserOnline {
    userId: string;
    socketId: string;
}

export interface SetUserPresence {
    userId: string;
}

export interface SetUserOffline {
    userId: string;
    socketId: string;
}

export interface IsUserOnline {
    userId: string;
}

export interface GetOnlineUsers {
    userIds: string[];
}

export interface GetUserSocketIds {
    userId: string;
}
