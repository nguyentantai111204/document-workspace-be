import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { WorkspaceMember } from "src/modules/workspaces/entities/workspace-member.entity"
import { Repository } from "typeorm"
import { ForbiddenError } from "../exceptions/forbiden.exception"

@Injectable()
export class WorkspaceGuard implements CanActivate {
    constructor(
        @InjectRepository(WorkspaceMember)
        private readonly memberRepo: Repository<WorkspaceMember>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const user = req.user
        const workspaceId = req.params.workspaceId

        if (!workspaceId) return true

        const member = await this.memberRepo.findOne({
            where: { workspaceId, userId: user.id },
        })

        if (!member) throw new ForbiddenError('Bạn không có quyền truy cập')

        req.workspaceRole = member.role
        req.workspaceId = workspaceId

        return true
    }
}
