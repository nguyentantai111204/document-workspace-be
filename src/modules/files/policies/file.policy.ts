import { FileAction } from '../enums/file-action.enum'
import { WorkspaceRole } from 'src/modules/workspaces/enums/workspace-role.enum'

export const FilePolicy: Record<WorkspaceRole, FileAction[]> = {
    OWNER: [
        FileAction.READ,
        FileAction.DELETE,
        FileAction.DOWNLOAD,
        FileAction.UPDATE,
    ],
    ADMIN: [
        FileAction.READ,
        FileAction.DELETE,
        FileAction.DOWNLOAD,
        FileAction.UPDATE,
    ],
    MEMBER: [
        FileAction.READ,
        FileAction.DOWNLOAD,
        FileAction.UPDATE,
    ],
    VIEWER: [
        FileAction.READ,
    ],
}
