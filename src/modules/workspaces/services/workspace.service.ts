import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Workspace } from "../entities/workspace.entity"
import { Repository } from "typeorm"
import slugify from "slugify"
import { WorkspaceRole } from "../enums/workspace-role.enum"
import { WorkspaceMemberService } from "./workspace-member.service"
import { PaginatedResponse } from "src/common/interfaces/paginated-result.interface"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { WorkspaceQueryDto } from "../dto/workspace-filter.dto"
import { buildPaginationMeta } from "src/common/utils/pagination.utils"
import { WorkspaceSortField } from "../enums/workspace-sort-field.enum"

@Injectable()
export class WorkspaceService {
    constructor(
        @InjectRepository(Workspace)
        private readonly workspaceRepo: Repository<Workspace>,
        private readonly memberService: WorkspaceMemberService,
    ) { }

    async createWorkspace(userId: string, name: string) {
        const slug = slugify(name, { lower: true })

        const workspace = this.workspaceRepo.create({
            name,
            slug,
            ownerId: userId,
        })

        await this.workspaceRepo.save(workspace)

        await this.memberService.addMember(
            workspace.id,
            userId,
            WorkspaceRole.OWNER,
        )

        return workspace
    }

    async listUserWorkspaces(
        userId: string,
        query: WorkspaceQueryDto,
    ): Promise<PaginatedResponse<Workspace>> {
        const {
            page = 1,
            limit = 20,
            keyword,
            sortBy = WorkspaceSortField.CREATED_AT,
            sortOrder = 'DESC',
        } = query

        const skip = (page - 1) * limit

        const qb = this.workspaceRepo
            .createQueryBuilder('w')
            .innerJoin(
                'workspace_members',
                'wm',
                'wm.workspaceId = w.id AND wm.userId = :userId',
                { userId },
            )
            .where('w.deletedAt IS NULL')

        if (keyword) {
            qb.andWhere('w.name ILIKE :keyword', {
                keyword: `%${keyword}%`,
            })
        }

        qb.orderBy(`w.${sortBy}`, sortOrder)
        qb.skip(skip).take(limit)

        const [items, total] = await qb.getManyAndCount()

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        }
    }


    async getWorkspaceDetail(workspaceId: string, userId: string) {
        const workspace = await this.workspaceRepo.findOne({
            where: { id: workspaceId },
        })

        if (!workspace) {
            throw new BadRequestError('Workspace không tồn tại')
        }

        const role = await this.memberService.getUserRole(workspaceId, userId)

        return {
            workspace,
            role,
        }
    }


}

