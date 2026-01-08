export const USER_RESPONSE_VIEWS = {
    PRIVATE: ['id', 'email', 'fullName', 'status'] as const,
    ADMIN: ['id', 'email', 'fullName', 'status', 'createdAt', 'updatedAt'] as const,
}
