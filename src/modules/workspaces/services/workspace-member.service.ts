import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { WorkspaceMember } from "../entities/workspace-member.entity"
import { Repository } from "typeorm"
import { WorkspaceRole } from "../enums/workspace-role.enum"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { ListMembersQueryDto } from "../dto/workspace-member-filter.dto"
import { PaginatedResponse } from "src/common/interfaces/paginated-result.interface"
import { buildPaginationMeta } from "src/common/utils/pagination.utils"

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

    async listMembers(
        workspaceId: string,
        query: ListMembersQueryDto,
    ): Promise<PaginatedResponse<any>> {
        const { page = 1, limit = 20, search, role } = query;

        const qb = this.memberRepo
            .createQueryBuilder('member')
            .innerJoin('member.user', 'user')
            .where('member.workspaceId = :workspaceId', { workspaceId });

        if (role) {
            qb.andWhere('member.role = :role', { role });
        }

        if (search) {
            qb.andWhere(
                '(user.fullName ILIKE :search OR user.email ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        qb.skip((page - 1) * limit).take(limit);

        qb.select([
            'member.id',
            'member.role',
            'user.id',
            'user.fullName',
            'user.email',
            'user.avatarUrl',
        ]);

        const [items, total] = await qb.getManyAndCount();

        const result = items.map((m) => ({
            userId: m.user.id,
            fullName: m.user.fullName,
            email: m.user.email,
            avatarUrl: m.user.avatarUrl,
            role: m.role,
        }));


        return {
            items: result,
            meta: buildPaginationMeta(page, limit, total),
        };
    }

    async updateMemberRole(
        workspaceId: string,
        actorId: string,
        targetUserId: string,
        newRole: WorkspaceRole
    ) {
        const actor = await this.memberRepo.findOne({ where: { workspaceId, userId: actorId } })

        const targetUser = await this.memberRepo.findOne({ where: { workspaceId, userId: targetUserId } })

        if (!actor || !targetUser) {
            throw new BadRequestError('Thành viên không tồn tại')
        }

        if (actorId === targetUserId) {
            throw new BadRequestError('Không thể thự thay đổi role chính mình')
        }

        if (actor.role === WorkspaceRole.ADMIN && targetUser.role === WorkspaceRole.OWNER) {
            throw new BadRequestError('ADMIN không có quyền thao tác với OWNER')
        }

        if (targetUser.role === WorkspaceRole.OWNER) {
            throw new BadRequestError('Phải transfer ownership để đổi OWNER')
        }

        targetUser.role = newRole
        return this.memberRepo.save(targetUser)
    }

}
