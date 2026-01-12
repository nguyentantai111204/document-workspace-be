// workspace.policy.ts
import { WorkspaceAction } from '../enums/workspace-action.enum'
import { WorkspaceRole } from '../enums/workspace-role.enum'

export const WorkspacePolicy: Record<WorkspaceRole, WorkspaceAction[]> = {
    OWNER: [
        WorkspaceAction.INVITE_MEMBER,
        WorkspaceAction.REMOVE_MEMBER,
        WorkspaceAction.UPDATE_WORKSPACE,
        WorkspaceAction.DELETE_WORKSPACE,
        WorkspaceAction.UPLOAD_FILE,
        WorkspaceAction.CHAT,
    ],
    ADMIN: [
        WorkspaceAction.INVITE_MEMBER,
        WorkspaceAction.UPLOAD_FILE,
        WorkspaceAction.CHAT,
    ],
    MEMBER: [
        WorkspaceAction.UPLOAD_FILE,
        WorkspaceAction.CHAT,
    ],
    VIEWER: [
        // hiện chưa có
    ]
}
