import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from 'src/common/decorators/permission.decorator'
import { PermissionService } from 'src/modules/permission/services/permission.service'

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly permissionService: PermissionService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions =
            this.reflector.getAllAndOverride<string[]>(
                PERMISSIONS_KEY,
                [context.getHandler(), context.getClass()],
            )

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true
        }

        const request = context.switchToHttp().getRequest()
        const user = request.user

        if (!user?.id) {
            throw new ForbiddenException('Người dùng chưa xác thực')
        }

        const userPermissions =
            await this.permissionService.getPermissionsByUser(user.id)

        const hasPermission = requiredPermissions.every(p =>
            userPermissions.includes(p),
        )

        if (!hasPermission) {
            throw new ForbiddenException('Không đủ quyền truy cập')
        }

        return true
    }
}
