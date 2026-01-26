import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Brackets } from 'typeorm'
import { FileEntity } from '../entities/file.entity'
import { FileQueryDto } from '../dto/file-query.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-result.interface'
import { buildPaginationMeta } from 'src/common/utils/pagination.utils'
import { FileSortField } from '../enums/file-sort-field.enum'
import { FileStatus } from '../enums/file-status.enum'
import { SortOrder } from 'src/common/enums/sort.enum'

@Injectable()
export class FileRepository {
    constructor(
        @InjectRepository(FileEntity)
        private readonly repo: Repository<FileEntity>,
    ) { }

    createFile(data: Partial<FileEntity>) {
        return this.repo.create(data)
    }

    save(file: FileEntity) {
        return this.repo.save(file)
    }

    findOne(conditions: any) {
        return this.repo.findOne(conditions)
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } })
    }

    async listFiles(
        workspaceId: string,
        query: FileQueryDto,
    ): Promise<PaginatedResponse<FileEntity>> {
        const {
            page = 1,
            limit = 20,
            search,
            mimeType,
            ownerId,
            sortBy = FileSortField.CREATED_AT,
            sortOrder = SortOrder.DESC,
        } = query

        const skip = (page - 1) * limit

        const qb = this.repo.createQueryBuilder('file')

        qb.where('file.workspaceId = :workspaceId', { workspaceId })
            .andWhere('file.status = :status', { status: FileStatus.ACTIVE })

        if (mimeType) {
            qb.andWhere('file.mimeType = :mimeType', { mimeType })
        }

        if (ownerId) {
            qb.andWhere('file.ownerId = :ownerId', { ownerId })
        }

        if (query.type) {
            const types = query.type.split(',')
            qb.andWhere(new Brackets(qb => {
                types.forEach(type => {
                    if (type === 'folder') {
                        qb.orWhere('file.mimeType = :folder', { folder: 'folder' })
                    } else if (type === 'image') {
                        qb.orWhere('file.mimeType LIKE :image', { image: 'image/%' })
                    } else if (type === 'document') {
                        qb.orWhere('file.mimeType LIKE :pdf', { pdf: 'application/pdf' })
                            .orWhere('file.mimeType LIKE :doc', { doc: 'application/msword' })
                            .orWhere('file.mimeType LIKE :docx', { docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
                            .orWhere('file.mimeType LIKE :xls', { xls: 'application/vnd.ms-excel' })
                            .orWhere('file.mimeType LIKE :xlsx', { xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                            .orWhere('file.mimeType LIKE :txt', { txt: 'text/plain' })
                    }
                })
            }))
        }

        if (search) {
            qb.andWhere('file.name ILIKE :search', {
                search: `%${search}%`,
            })
        }

        qb.orderBy(`file.${sortBy}`, sortOrder)
        qb.skip(skip).take(limit)

        const [items, total] = await qb.getManyAndCount()

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        }
    }
}
