import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { randomUUID } from 'crypto'
import dayjs from 'dayjs'

import { WorkspaceInvite } from '../entities/workspace-invite.entity'
import { WorkspaceMember } from '../entities/workspace-member.entity'
import { WorkspaceRole } from '../enums/workspace-role.enum'
import { BadRequestError } from 'src/common/exceptions/bad-request.exception'
import { NotFoundError } from 'src/common/exceptions/not-found.exception'
import { MailService } from 'src/common/services/mail/mail.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class WorkspaceInviteService {
    constructor(
        @InjectRepository(WorkspaceInvite)
        private readonly inviteRepo: Repository<WorkspaceInvite>,

        @InjectRepository(WorkspaceMember)
        private readonly memberRepo: Repository<WorkspaceMember>,

        private readonly mailService: MailService,
        private readonly config: ConfigService,
    ) { }

    async invite(
        workspaceId: string,
        inviterId: string,
        email: string,
        role: WorkspaceRole,
    ) {
        const existedInvite = await this.inviteRepo.findOne({
            where: { workspaceId, email, status: 'pending' },
        })

        if (existedInvite) {
            throw new BadRequestError('Invite đã tồn tại')
        }

        const token = randomUUID()

        const invite = this.inviteRepo.create({
            workspaceId,
            email,
            role,
            token,
            invitedBy: inviterId,
            expiredAt: dayjs().add(7, 'day').toDate(),
        })

        await this.inviteRepo.save(invite)

        const inviteUrl = `${this.config.get(
            'FRONTEND_URL',
        )}/invite/accept?token=${token}`

        await this.mailService.sendTemplateMail({
            to: email,
            subject: 'Bạn được mời vào Workspace',
            template: 'workspace-invite',
            context: {
                workspaceName: 'My Workspace',
                role,
                inviteLink: inviteUrl,
                expiredIn: 7,
            },
        })


        return { success: true }
    }

    async acceptInvite(token: string, userId: string) {
        const invite = await this.inviteRepo.findOne({
            where: { token, status: 'pending' },
        })

        if (!invite) {
            throw new NotFoundError('Invite không hợp lệ')
        }

        if (invite.expiredAt < new Date()) {
            invite.status = 'expired'
            await this.inviteRepo.save(invite)
            throw new BadRequestError('Invite đã hết hạn')
        }

        const existed = await this.memberRepo.findOne({
            where: { workspaceId: invite.workspaceId, userId },
        })

        if (!existed) {
            const member = this.memberRepo.create({
                workspaceId: invite.workspaceId,
                userId,
                role: invite.role,
            })
            await this.memberRepo.save(member)
        }

        invite.status = 'accepted'
        await this.inviteRepo.save(invite)

        return { success: true }
    }

    async listInvites(workspaceId: string) {
        return this.inviteRepo.find({
            where: { workspaceId, status: 'pending' },
            order: { createdAt: 'DESC' },
        })
    }

    async revokeInvite(inviteId: string) {
        const invite = await this.inviteRepo.findOne({
            where: { id: inviteId },
        })

        if (!invite) return

        invite.status = 'expired'
        await this.inviteRepo.save(invite)
    }
}
