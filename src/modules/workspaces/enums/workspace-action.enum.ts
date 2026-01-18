export enum WorkspaceAction {
    INVITE_MEMBER = 'workspace.invite_member',
    REMOVE_MEMBER = 'workspace.remove_member',
    UPDATE_MEMBER_ROLE = 'workspace.update_member_role',
    TRANSFER_OWNERSHIP = 'workspace.transfer_ownership',

    UPDATE_WORKSPACE = 'workspace.update',
    DELETE_WORKSPACE = 'workspace.delete',

    UPLOAD_FILE = 'file.upload',
    READ_FILE = 'file.read',
    DELETE_FILE = 'file.delete',
    CHAT = 'chat.send',
}
