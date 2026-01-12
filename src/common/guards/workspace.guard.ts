import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { WorkspaceMember } from "src/modules/workspaces/entities/workspace-member.entity"
import { Repository } from "typeorm"
import { ForbiddenError } from "../exceptions/forbiden.exception"
import { Workspace } from "src/modules/workspaces/entities/workspace.entity"
import { NotFoundError } from "../exceptions/not-found.exception"

@Injectable()
export class WorkspaceGuard implements CanActivate {
    constructor(
        @InjectRepository(WorkspaceMember)
        private readonly memberRepo: Repository<WorkspaceMember>,
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

        const member = await this.memberRepo.findOne({
            where: { workspaceId, userId: user.id },
        })

        if (!member) throw new ForbiddenError('Bạn không có quyền truy cập')

        req.workspaceRole = member.role
        req.workspaceId = workspaceId

        return true
    }
}
