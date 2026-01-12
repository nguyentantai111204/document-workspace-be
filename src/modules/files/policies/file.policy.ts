import { FileAction } from '../enums/file-action.enum'
import { WorkspaceRole } from 'src/modules/workspaces/enums/workspace-role.enum'

export const FilePolicy: Record<WorkspaceRole, FileAction[]> = {
    OWNER: [
        FileAction.READ,
        FileAction.DELETE,
        FileAction.DOWNLOAD,
    ],
    ADMIN: [
        FileAction.READ,
        FileAction.DELETE,
        FileAction.DOWNLOAD,
    ],
    MEMBER: [
        FileAction.READ,
        FileAction.DOWNLOAD,
    ],
    VIEWER: [
        FileAction.READ,
    ],
}
