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
import { SortOrder } from "src/common/enums/sort.enum"

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
            search,
            sortBy = WorkspaceSortField.CREATED_AT,
            sortOrder = SortOrder.DESC,
        } = query;

        const skip = (page - 1) * limit;

        const qb = this.workspaceRepo
            .createQueryBuilder('w')
            .innerJoin(
                'workspace_members',
                'wm',
                'wm.workspace_id = w.id AND wm.user_id = :userId',
                { userId },
            )
            .where('w.deletedAt IS NULL');

        if (search) {
            qb.andWhere('w.name ILIKE :search', {
                search: `%${search}%`,
            });
        }

        qb.orderBy(`w.${sortBy}`, sortOrder)
            .skip(skip)
            .take(limit);

        const [items, total] = await qb.getManyAndCount();

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        };
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

    async transferOwnership(
        workspaceId: string,
        currentOwnerId: string,
        newOwnerId: string,
    ) {
        if (currentOwnerId === newOwnerId) {
            throw new BadRequestError('Không thể chuyển quyền cho chính mình')
        }

        const members = await this.memberService['memberRepo'].find({
            where: { workspaceId },
        })

        if (members.length < 2) {
            throw new BadRequestError('Workspace phải có ít nhất 2 thành viên')
        }

        const currentOwner = members.find(
            (m) => m.userId === currentOwnerId && m.role === WorkspaceRole.OWNER,
        )

        const newOwner = members.find((m) => m.userId === newOwnerId)

        if (!currentOwner || !newOwner) {
            throw new BadRequestError('Member không hợp lệ')
        }

        currentOwner.role = WorkspaceRole.ADMIN
        newOwner.role = WorkspaceRole.OWNER

        await this.memberService['memberRepo'].save([currentOwner, newOwner])
    }


}

