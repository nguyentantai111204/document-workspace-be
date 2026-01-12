import { SetMetadata } from '@nestjs/common'
import { FileAction } from 'src/modules/files/enums/file-action.enum'

export const FILE_ACTION_KEY = 'file_action'
export const FileActionPermission = (action: FileAction) =>
    SetMetadata(FILE_ACTION_KEY, action)