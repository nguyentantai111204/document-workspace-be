import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { randomUUID } from 'crypto'
import dayjs from 'dayjs'

import { WorkspaceInvite } from '../entities/workspace-invite.entity'
import { WorkspaceRole } from '../enums/workspace-role.enum'
import { BadRequestError } from 'src/common/exceptions/bad-request.exception'
import { NotFoundError } from 'src/common/exceptions/not-found.exception'
import { MailService } from 'src/common/services/mail/mail.service'
import { User } from 'src/modules/users/entities/user.entity'
import { WorkspaceInviteStatus } from '../enums/workspace-invite-status.enum'
import { WorkspaceInviteRepository } from '../repositories/workspace-invite.repository'
import { WorkspaceMemberRepository } from '../repositories/workspace-memeber.repository'
import { UsersRepository } from 'src/modules/users/repository/user.repository'

@Injectable()
export class WorkspaceInviteService {
    constructor(
        private readonly inviteRepo: WorkspaceInviteRepository,
        private readonly memberRepo: WorkspaceMemberRepository,
        private readonly userRepo: UsersRepository,
        private readonly mailService: MailService,
    ) { }

    async invite(
        workspaceId: string,
        inviterId: string,
        email: string,
        role: WorkspaceRole,
    ) {
        const user = await this.userRepo.findByEmail(email)

        if (user) {
            const existed = await this.memberRepo.findByWorkspaceAndUser(
                workspaceId,
                user.id,
            )
            if (existed) {
                throw new BadRequestError(
                    'User đã là thành viên workspace',
                )
            }
        }

        let invite = await this.inviteRepo.findPendingInvite(
            workspaceId,
            email,
        )

        const token = randomUUID()
        const expiredAt = dayjs().add(7, 'day').toDate()

        if (invite) {
            invite.token = token
            invite.expiredAt = expiredAt
            invite.role = role
        } else {
            invite = new WorkspaceInvite()
            invite.workspaceId = workspaceId
            invite.email = email
            invite.role = role
            invite.token = token
            invite.invitedBy = inviterId
            invite.expiredAt = expiredAt
        }

        await this.inviteRepo.save(invite)

        await this.mailService.sendTemplateMail({
            to: email,
            subject: 'Bạn được mời vào Workspace',
            template: 'workspace-invite',
            context: {
                workspaceName: 'Workspace',
                role,
                inviteLink: `${process.env.FRONTEND_URL}/invite?token=${token}`,
                expiredIn: 7,
            },
        })

        return { success: true }
    }

    async acceptInvite(token: string, userId: string) {
        const invite = await this.inviteRepo.findByToken(token)

        if (!invite) {
            throw new NotFoundError('Invite không hợp lệ')
        }

        if (invite.expiredAt < new Date()) {
            invite.status = WorkspaceInviteStatus.EXPIRED
            await this.inviteRepo.save(invite)
            throw new BadRequestError('Invite đã hết hạn')
        }

        const user = await this.userRepo.findById(userId)

        if (!user || user.email !== invite.email) {
            throw new BadRequestError('Invite không thuộc email này')
        }

        await this.memberRepo.createMember(
            invite.workspaceId,
            userId,
            invite.role,
        )

        invite.status = WorkspaceInviteStatus.ACCEPTED
        await this.inviteRepo.save(invite)

        return { workspaceId: invite.workspaceId }
    }

    listInvites(workspaceId: string) {
        return this.inviteRepo.listInvites(workspaceId)
    }

    revokeInvite(inviteId: string) {
        return this.inviteRepo.expire(inviteId)
    }
}

