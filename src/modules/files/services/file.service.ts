import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { FileEntity } from "../entities/file.entity"
import { FileStorageService } from "./file-storage.service"
import { FileStatus } from "../enums/file-status.enum"
import { FileValidationService } from "./file-validation.service"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { buildPaginationMeta } from "src/common/utils/pagination.utils"
import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { PaginationDto } from "src/common/dto/pagination.interface"

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
        pagination: PaginationDto,
    ): Promise<PaginatedResult<FileEntity>> {
        const page = pagination.page ?? 1
        const limit = pagination.limit ?? 20
        const skip = (page - 1) * limit

        const [items, total] = await this.fileRepo.findAndCount({
            where: {
                workspaceId,
                status: FileStatus.ACTIVE,
            },
            order: {
                createdAt: 'DESC',
            },
            take: limit,
            skip,
        })

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

