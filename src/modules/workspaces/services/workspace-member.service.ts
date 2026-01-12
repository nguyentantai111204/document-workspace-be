import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { WorkspaceMember } from "../entities/workspace-member.entity"
import { DataSource, Repository } from "typeorm"
import { WorkspaceRole } from "../enums/workspace-role.enum"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { User } from "src/modules/users/entities/user.entity"
import { ListMembersQueryDto } from "../dto/workspace-member-filter.dto"
import { PaginatedResponse } from "src/common/interfaces/paginated-result.interface"
import { buildPaginationMeta } from "src/common/utils/pagination.utils"

@Injectable()
export class WorkspaceMemberService {
    constructor(
        @InjectRepository(WorkspaceMember)
        private readonly memberRepo: Repository<WorkspaceMember>,
        private readonly dataSource: DataSource,
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
        const { page = 1, limit = 20, keyword, role } = query;
        const skip = (page - 1) * limit;

        const qb = this.dataSource
            .getRepository(WorkspaceMember)
            .createQueryBuilder('wm')
            .innerJoin(User, 'u', 'u.id = wm.userId')
            .where('wm.workspaceId = :workspaceId', { workspaceId });

        if (keyword) {
            qb.andWhere('(u.full_name ILIKE :keyword OR u.email ILIKE :keyword)', {
                keyword: `%${keyword}%`,
            });
        }

        if (role) {
            qb.andWhere('wm.role = :role', { role });
        }

        qb.select([
            'u.id AS id',
            'u.full_name AS "fullName"',
            'u.email AS email',
            'u.avatar_url AS "avatarUrl"',
            'wm.role AS role',
        ]);

        qb.skip(skip).take(limit);

        const [items, total] = await Promise.all([
            qb.getRawMany(),
            qb.getCount(),
        ]);

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        };
    }

}
