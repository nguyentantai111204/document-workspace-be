import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { WorkspaceMember } from "../entities/workspace-member.entity"
import { Repository } from "typeorm"
import { WorkspaceRole } from "../enums/workspace-role.enum"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"

@Injectable()
export class WorkspaceMemberService {
    constructor(
        @InjectRepository(WorkspaceMember)
        private readonly memberRepo: Repository<WorkspaceMember>,
    ) { }

    async addMember(
        workspaceId: string,
        userId: string,
        role: WorkspaceRole,
    ) {
        const existed = await this.memberRepo.findOne({
            where: { workspaceId, userId },
        })

        if (existed) {
            throw new BadRequestError('Người dùng đã có trong không gian làm việc này')
        }

        const member = this.memberRepo.create({
            workspaceId,
            userId,
            role,
        })

        return this.memberRepo.save(member)
    }

    async getUserRole(workspaceId: string, userId: string) {
        const member = await this.memberRepo.findOne({
            where: { workspaceId, userId },
        })

        return member?.role ?? null
    }

    async removeMember(workspaceId: string, userId: string) {
        const member = await this.memberRepo.findOne({
            where: { workspaceId, userId },
        })

        if (!member) return

        await this.memberRepo.remove(member)
    }
}
