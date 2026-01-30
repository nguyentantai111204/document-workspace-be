import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { randomUUID } from 'crypto'
import dayjs from 'dayjs'

import { WorkspaceInvite } from '../entities/workspace-invite.entity'
import { WorkspaceRole } from '../enums/workspace-role.enum'
import { BadRequestError } from 'src/common/exceptions/bad-request.exception'
import { NotFoundError } from 'src/common/exceptions/not-found.exception'
import { WorkspaceInviteStatus } from '../enums/workspace-invite-status.enum'
import { WorkspaceInviteRepository } from '../repositories/workspace-invite.repository'
import { WorkspaceMemberRepository } from '../repositories/workspace-memeber.repository'
import { UsersRepository } from 'src/modules/users/repository/user.repository'
import { NotificationService } from 'src/modules/notifications/services/notification.service'
import { NotificationType } from 'src/modules/notifications/enums/notification-type.enum'
import { WorkspaceRepository } from '../repositories/workspace.repository'


@Injectable()
export class WorkspaceInviteService {
    constructor(
        private readonly inviteRepo: WorkspaceInviteRepository,
        private readonly memberRepo: WorkspaceMemberRepository,
        private readonly userRepo: UsersRepository,
        private readonly workspaceRepo: WorkspaceRepository,
        private readonly notificationService: NotificationService,
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

        if (user) {
            const workspace = await this.workspaceRepo.findById(workspaceId)
            const inviter = await this.userRepo.findById(inviterId)

            if (workspace && inviter) {
                await this.notificationService.create({
                    recipientId: user.id,
                    senderId: inviterId,
                    type: NotificationType.INVITE,
                    title: 'Lời mời tham gia Workspace',
                    body: `${inviter.fullName} đã mời bạn tham gia workspace "${workspace.name}"`,
                    data: {
                        workspaceId,
                        workspaceName: workspace.name,
                        inviteToken: token,
                        role,
                        inviterName: inviter.fullName,
                        inviterId,
                    }
                })
            }
        }

        return { success: true, inviteToken: token }
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

        const workspace = await this.workspaceRepo.findById(invite.workspaceId)
        if (workspace) {
            await this.notificationService.create({
                recipientId: invite.invitedBy,
                senderId: userId,
                type: NotificationType.WORKSPACE,
                title: 'Lời mời được chấp nhận',
                body: `${user.fullName} đã chấp nhận lời mời tham gia workspace "${workspace.name}"`,
                data: {
                    workspaceId: invite.workspaceId,
                    workspaceName: workspace.name,
                    memberId: userId,
                    memberName: user.fullName,
                }
            })
        }

        return { workspaceId: invite.workspaceId }
    }

    listInvites(workspaceId: string) {
        return this.inviteRepo.listInvites(workspaceId)
    }

    revokeInvite(inviteId: string) {
        return this.inviteRepo.expire(inviteId)
    }
}

