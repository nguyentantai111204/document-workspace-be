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
            .innerJoin('users', 'user', 'user.id = member.user_id')
            .where('member.workspaceId = :workspaceId', { workspaceId })
            .andWhere('member.status = :status', { status: 'active' })

        if (role) {
            qb.andWhere('member.role = :role', { role })
        }

        if (search) {
            qb.andWhere(
                '(user.full_name ILIKE :search OR user.email ILIKE :search)',
                { search: `%${search}%` },
            )
        }

        qb
            .orderBy('member.joined_at', 'DESC')
            .skip(skip)
            .take(limit)
            .select([
                'member.id as "memberId"',
                'member.role as "memberRole"',
                'member.joined_at as "joinedAt"',
                'user.id as "userId"',
                'user.full_name as "fullName"',
                'user.email as "email"',
                'user.avatar_url as "avatarUrl"',
            ])

        const [items, total] = await Promise.all([
            qb.getRawMany(),
            qb.getCount(),
        ])

        return {
            items: items.map((m) => ({
                userId: m.userId,
                fullName: m.fullName,
                email: m.email,
                avatarUrl: m.avatarUrl,
                role: m.memberRole,
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
