import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WorkspaceInvite } from '../entities/workspace-invite.entity'
import { WorkspaceInviteStatus } from '../enums/workspace-invite-status.enum'
import { buildPaginationMeta } from 'src/common/utils/pagination.utils'

@Injectable()
export class WorkspaceInviteRepository {
    constructor(
        @InjectRepository(WorkspaceInvite)
        private readonly repo: Repository<WorkspaceInvite>,
    ) { }

    findPendingInvite(
        workspaceId: string,
        email: string,
    ) {
        return this.repo.findOne({
            where: {
                workspaceId,
                email,
                status: WorkspaceInviteStatus.PENDING,
            },
        })
    }

    findByToken(token: string) {
        return this.repo.findOne({
            where: {
                token,
                status: WorkspaceInviteStatus.PENDING,
            },
        })
    }

    save(invite: WorkspaceInvite) {
        return this.repo.save(invite)
    }

    async listInvites(
        workspaceId: string,
        page = 1,
        limit = 20,
    ) {
        const skip = (page - 1) * limit

        const qb = this.repo
            .createQueryBuilder('invite')
            .where('invite.workspaceId = :workspaceId', { workspaceId })
            .andWhere('invite.status = :status', {
                status: WorkspaceInviteStatus.PENDING,
            })
            .orderBy('invite.createdAt', 'DESC')
            .skip(skip)
            .take(limit)

        const [items, total] = await qb.getManyAndCount()

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        }
    }

    revoke(inviteId: string) {
        return this.repo.update(
            { id: inviteId },
            { status: WorkspaceInviteStatus.EXPIRED },
        )
    }

    expire(inviteId: string) {
        return this.repo.update(
            { id: inviteId },
            { status: WorkspaceInviteStatus.EXPIRED },
        )
    }
}
