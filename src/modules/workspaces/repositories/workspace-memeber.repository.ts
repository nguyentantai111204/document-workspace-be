import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WorkspaceMember } from '../entities/workspace-member.entity'
import { WorkspaceRole } from '../enums/workspace-role.enum'
import { ListMembersQueryDto } from '../dto/workspace-member-filter.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-result.interface'
import { buildPaginationMeta } from 'src/common/utils/pagination.utils'

@Injectable()
export class WorkspaceMemberRepository {
    constructor(
        @InjectRepository(WorkspaceMember)
        private readonly repo: Repository<WorkspaceMember>,
    ) { }

    findByWorkspaceAndUser(
        workspaceId: string,
        userId: string,
    ) {
        return this.repo.findOne({
            where: { workspaceId, userId, status: 'active' },
        })
    }

    createMember(
        workspaceId: string,
        userId: string,
        role: WorkspaceRole,
    ) {
        return this.repo.save(
            this.repo.create({
                workspaceId,
                userId,
                role,
                status: 'active',
            }),
        )
    }

    async listMembers(
        workspaceId: string,
        query: ListMembersQueryDto,
    ): Promise<PaginatedResponse<any>> {
        const { page = 1, limit = 20, search, role } = query
        const skip = (page - 1) * limit

        const qb = this.repo
            .createQueryBuilder('member')
            .innerJoin('member.user', 'user')
            .where('member.workspaceId = :workspaceId', { workspaceId })
            .andWhere('member.status = :status', { status: 'active' })

        if (role) {
            qb.andWhere('member.role = :role', { role })
        }

        if (search) {
            qb.andWhere(
                '(user.fullName ILIKE :search OR user.email ILIKE :search)',
                { search: `%${search}%` },
            )
        }

        qb
            .orderBy('member.joinedAt', 'DESC')
            .skip(skip)
            .take(limit)
            .select([
                'member.id',
                'member.role',
                'member.joinedAt',
                'user.id',
                'user.fullName',
                'user.email',
                'user.avatarUrl',
            ])

        const [items, total] = await qb.getManyAndCount()

        return {
            items: items.map((m) => ({
                userId: m.user.id,
                fullName: m.user.fullName,
                email: m.user.email,
                avatarUrl: m.user.avatarUrl,
                role: m.role,
                joinedAt: m.joinedAt,
            })),
            meta: buildPaginationMeta(page, limit, total),
        }
    }

    updateRole(
        workspaceId: string,
        userId: string,
        role: WorkspaceRole,
    ) {
        return this.repo.update({ workspaceId, userId }, { role })
    }

    softRemove(
        workspaceId: string,
        userId: string,
    ) {
        return this.repo.update(
            { workspaceId, userId },
            { status: 'removed' },
        )
    }

    listAllByWorkspace(workspaceId: string) {
        return this.repo.find({ where: { workspaceId } })
    }

    async transferOwnership(
        workspaceId: string,
        currentOwnerId: string,
        newOwnerId: string,
    ) {
        await this.repo.manager.transaction(async (manager) => {
            await manager.update(
                'workspace_members',
                {
                    workspaceId,
                    userId: currentOwnerId,
                },
                { role: WorkspaceRole.ADMIN },
            )

            await manager.update(
                'workspace_members',
                {
                    workspaceId,
                    userId: newOwnerId,
                },
                { role: WorkspaceRole.OWNER },
            )
        })
    }

}
