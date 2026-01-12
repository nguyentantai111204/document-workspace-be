import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { FILE_ACTION_KEY } from '../decorators/file-action.decorator'
import { FilePolicy } from 'src/modules/files/policies/file.policy'

@Injectable()
export class FileActionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const action = this.reflector.get(
            FILE_ACTION_KEY,
            context.getHandler(),
        )

        if (!action) return true

        const req = context.switchToHttp().getRequest()
        const role = req.workspaceRole

        return FilePolicy[role]?.includes(action) ?? false
    }
}
