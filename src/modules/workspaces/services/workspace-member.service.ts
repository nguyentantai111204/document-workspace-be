import { Injectable } from "@nestjs/common"
import { WorkspaceRole } from "../enums/workspace-role.enum"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { ListMembersQueryDto } from "../dto/workspace-member-filter.dto"
import { WorkspaceMemberRepository } from "../repositories/workspace-memeber.repository"

@Injectable()
export class WorkspaceMemberService {
    constructor(
        private readonly memberRepo: WorkspaceMemberRepository,
    ) { }

    async addMember(
        workspaceId: string,
        userId: string,
        role: WorkspaceRole,
    ) {
        const existed = await this.memberRepo.findByWorkspaceAndUser(
            workspaceId,
            userId,
        )

        if (existed) {
            throw new BadRequestError(
                'Người dùng đã có trong workspace',
            )
        }

        return this.memberRepo.createMember(
            workspaceId,
            userId,
            role,
        )
    }

    async getUserRole(
        workspaceId: string,
        userId: string,
    ) {
        const member = await this.memberRepo.findByWorkspaceAndUser(
            workspaceId,
            userId,
        )

        return member?.role ?? null
    }

    async removeMember(
        workspaceId: string,
        userId: string,
    ) {
        await this.memberRepo.softRemove(workspaceId, userId)
    }

    listMembers(
        workspaceId: string,
        query: ListMembersQueryDto,
    ) {
        return this.memberRepo.listMembers(workspaceId, query)
    }

    async updateMemberRole(
        workspaceId: string,
        actorId: string,
        targetUserId: string,
        newRole: WorkspaceRole,
    ) {
        const actor = await this.memberRepo.findByWorkspaceAndUser(
            workspaceId,
            actorId,
        )
        const target = await this.memberRepo.findByWorkspaceAndUser(
            workspaceId,
            targetUserId,
        )

        if (!actor || !target) {
            throw new BadRequestError('Thành viên không tồn tại')
        }

        if (actorId === targetUserId) {
            throw new BadRequestError(
                'Không thể thay đổi role của chính mình',
            )
        }

        if (
            actor.role === WorkspaceRole.ADMIN &&
            target.role === WorkspaceRole.OWNER
        ) {
            throw new BadRequestError(
                'ADMIN không có quyền thao tác OWNER',
            )
        }

        if (target.role === WorkspaceRole.OWNER) {
            throw new BadRequestError(
                'Phải transfer ownership để đổi OWNER',
            )
        }

        return this.memberRepo.updateRole(
            workspaceId,
            targetUserId,
            newRole,
        )
    }

    listAll(workspaceId: string) {
        return this.memberRepo.listAllByWorkspace(workspaceId)
    }

    async transferOwnership(
        workspaceId: string,
        currentOwnerId: string,
        newOwnerId: string,
    ) {
        if (currentOwnerId === newOwnerId) {
            throw new BadRequestError(
                'Không thể chuyển quyền cho chính mình',
            )
        }

        const currentOwner =
            await this.memberRepo.findByWorkspaceAndUser(
                workspaceId,
                currentOwnerId,
            )

        const newOwner =
            await this.memberRepo.findByWorkspaceAndUser(
                workspaceId,
                newOwnerId,
            )

        if (
            !currentOwner ||
            currentOwner.role !== WorkspaceRole.OWNER
        ) {
            throw new BadRequestError(
                'Chỉ OWNER mới có thể transfer quyền',
            )
        }

        if (!newOwner) {
            throw new BadRequestError(
                'Người nhận quyền không tồn tại',
            )
        }

        await this.memberRepo.transferOwnership(
            workspaceId,
            currentOwnerId,
            newOwnerId,
        )
    }

}

