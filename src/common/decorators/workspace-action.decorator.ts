import { SetMetadata } from '@nestjs/common'
import { WorkspaceAction } from 'src/modules/workspaces/enums/workspace-action.enum'

export const WORKSPACE_ACTION_KEY = 'workspace_action'
export const WorkspaceActionPermission = (action: WorkspaceAction) =>
    SetMetadata(WORKSPACE_ACTION_KEY, action)
