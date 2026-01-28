import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Workspace } from '../entities/workspace.entity'
import { WorkspaceQueryDto } from '../dto/workspace-filter.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-result.interface'
import { buildPaginationMeta } from 'src/common/utils/pagination.utils'
import { WorkspaceSortField } from '../enums/workspace-sort-field.enum'
import { SortOrder } from 'src/common/enums/sort.enum'
import slugify from 'slugify'

@Injectable()
export class WorkspaceRepository {
    constructor(
        @InjectRepository(Workspace)
        private readonly repo: Repository<Workspace>,
    ) { }

    findById(id: string) {
        return this.repo.findOne({ where: { id } })
    }

    createWorkspace(
        name: string,
        slug: string,
        ownerId: string,
    ) {
        return this.repo.save(
            this.repo.create({ name, slug, ownerId }),
        )
    }

    async updateWorkspace(
        workspaceId: string,
        name: string,
    ) {
        const slug = slugify(name, { lower: true })

        return this.repo.update(workspaceId, {
            name,
            slug,
        })
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
        } = query

        const skip = (page - 1) * limit

        const qb = this.repo
            .createQueryBuilder('w')
            .innerJoin(
                'workspace_members',
                'wm',
                'wm.workspace_id = w.id AND wm.user_id = :userId',
                { userId },
            )
            .where('w.deletedAt IS NULL')

        if (search) {
            qb.andWhere('w.name ILIKE :search', {
                search: `%${search}%`,
            })
        }

        qb
            .orderBy(`w.${sortBy}`, sortOrder)
            .skip(skip)
            .take(limit)

        const [items, total] = await qb.getManyAndCount()

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        }
    }
}
