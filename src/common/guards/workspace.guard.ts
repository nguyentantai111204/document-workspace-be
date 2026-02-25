import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { WorkspaceMemberService } from "src/modules/workspaces/services/workspace-member.service"
import { Workspace } from "src/modules/workspaces/entities/workspace.entity"
import { WorkspaceRole } from "src/modules/workspaces/enums/workspace-role.enum"
import { NotFoundError } from "../exceptions/not-found.exception"
import { Repository } from "typeorm"
import { ForbiddenError } from "../exceptions/forbiden.exception"

@Injectable()
export class WorkspaceGuard implements CanActivate {
    constructor(
        private readonly memberService: WorkspaceMemberService,
        @InjectRepository(Workspace)
        private readonly workspaceRepo: Repository<Workspace>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const user = req.user
        const workspaceId = req.params.workspaceId

        if (!workspaceId) return true

        const workspace = await this.workspaceRepo.findOne({
            where: {
                id: workspaceId
            },
        })

        if (!workspace) {
            throw new NotFoundError('Workspace không tồn tại')
        }

        let role = await this.memberService.getUserRole(workspaceId, user.id)

        if (workspace.ownerId === user.id) {
            role = WorkspaceRole.OWNER
        }

        if (!role) throw new ForbiddenError('Bạn không có quyền truy cập')

        req.workspaceRole = role
        req.workspaceId = workspaceId

        return true
    }
}
