import { Injectable } from "@nestjs/common"
import { FileEntity } from "../entities/file.entity"
import { FileStorageService } from "./file-storage.service"
import { FileStatus } from "../enums/file-status.enum"
import { FileValidationService } from "./file-validation.service"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { FileQueryDto } from "../dto/file-query.dto"
import { FileRepository } from "../repositories/file.repository"

@Injectable()
export class FileService {
    constructor(
        private readonly fileRepo: FileRepository,
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

        const entity = this.fileRepo.createFile({
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
        return this.fileRepo.listFiles(workspaceId, query)
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

