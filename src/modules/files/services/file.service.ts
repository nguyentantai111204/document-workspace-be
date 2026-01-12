import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { FileEntity } from "../entities/file.entity"
import { FileStorageService } from "./file-storage.service"
import { FileStatus } from "../enums/file-status.enum"
import { FileValidationService } from "./file-validation.service"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { FileQueryDto } from "../dto/file-query.dto"
import { buildPaginationMeta } from "src/common/utils/pagination.utils"
import { FileSortField } from "../enums/file-sort-field.enum"

@Injectable()
export class FileService {
    constructor(
        @InjectRepository(FileEntity)
        private readonly fileRepo: Repository<FileEntity>,
        private readonly storage: FileStorageService,
        private readonly validator: FileValidationService,
    ) { }

    async uploadFile(params: {
        workspaceId: string
        userId: string
        file: Express.Multer.File
    }) {
        const validated = await this.validator.validate(params.file)

        const uploaded = await this.storage.upload(
            params.file,
            `workspaces/${params.workspaceId}`,
        )

        const entity = this.fileRepo.create({
            workspaceId: params.workspaceId,
            ownerId: params.userId,
            name: params.file.originalname,
            mimeType: validated.mimeType,
            size: uploaded.size,
            url: uploaded.url,
            publicId: uploaded.publicId,
            status: FileStatus.ACTIVE,
        })

        return this.fileRepo.save(entity)
    }

    async listByWorkspace(
        workspaceId: string,
        query: FileQueryDto,
    ) {
        const {
            page = 1,
            limit = 20,
            keyword,
            mimeType,
            ownerId,
            sortBy = FileSortField.CREATED_AT,
            sortOrder = 'DESC',
        } = query

        const skip = (page - 1) * limit

        const qb = this.fileRepo.createQueryBuilder('file')

        qb.where('file.workspaceId = :workspaceId', { workspaceId })
            .andWhere('file.status = :status', { status: FileStatus.ACTIVE })

        if (mimeType) {
            qb.andWhere('file.mimeType = :mimeType', { mimeType })
        }

        if (ownerId) {
            qb.andWhere('file.ownerId = :ownerId', { ownerId })
        }

        if (keyword) {
            qb.andWhere('file.name ILIKE :keyword', {
                keyword: `%${keyword}%`,
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


    async deleteFile(params: {
        fileId: string
        workspaceId: string
        userId: string
    }) {
        const file = await this.fileRepo.findOne({
            where: {
                id: params.fileId,
                workspaceId: params.workspaceId,
                status: FileStatus.ACTIVE,
            },
        })

        if (!file) {
            throw new BadRequestError('File không tồn tại')
        }


        await this.storage.delete(file.publicId)

        file.status = FileStatus.DELETED
        return this.fileRepo.save(file)
    }
}

