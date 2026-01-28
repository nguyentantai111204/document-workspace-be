import { Injectable } from "@nestjs/common"
import slugify from "slugify"
import { FileStorageService } from "./file-storage.service"
import { FileStatus } from "../enums/file-status.enum"
import { FileValidationService } from "./file-validation.service"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { FileQueryDto } from "../dto/file-query.dto"
import { FileRepository } from "../repositories/file.repository"
import { UpdateFileDto } from "../dto/update-file.dto"
import { ForbiddenError } from "src/common/exceptions/forbiden.exception"

@Injectable()
export class FileService {
    constructor(
        private readonly fileRepo: FileRepository,
        private readonly storage: FileStorageService,
        private readonly validator: FileValidationService,
    ) { }

    async uploadMany(params: {
        workspaceId: string
        userId: string
        files: Array<Express.Multer.File>
    }) {
        if (!params.files || params.files.length === 0) {
            throw new BadRequestError('Không có file nào được gửi lên')
        }

        const validatedFiles = await Promise.all(
            params.files.map(async (file) => {
                const validated = await this.validator.validate(file)
                return {
                    original: file,
                    ...validated,
                }
            })
        )

        const results = await Promise.all(
            validatedFiles.map(async (fileData) => {
                const originalName = fileData.original.originalname
                const lastDotIndex = originalName.lastIndexOf('.')

                let name = originalName
                let ext = ''

                if (lastDotIndex !== -1) {
                    name = originalName.substring(0, lastDotIndex)
                    ext = originalName.substring(lastDotIndex)
                }

                const slug = slugify(name, { lower: true, locale: 'vi' })
                fileData.original.originalname = `${slug}${ext}`

                const uploaded = await this.storage.upload(
                    fileData.original,
                    `workspaces/${params.workspaceId}`,
                )

                const entity = this.fileRepo.createFile({
                    workspaceId: params.workspaceId,
                    ownerId: params.userId,
                    name: fileData.original.originalname,
                    mimeType: fileData.mimeType,
                    size: uploaded.size,
                    url: uploaded.url,
                    publicId: uploaded.publicId,
                    status: FileStatus.ACTIVE,
                })

                return this.fileRepo.save(entity)
            })
        )

        return results
    }

    async uploadFile(params: {
        workspaceId: string
        userId: string
        file: Express.Multer.File
    }) {
        const results = await this.uploadMany({
            workspaceId: params.workspaceId,
            userId: params.userId,
            files: [params.file],
        })
        return results[0]
    }

    async listByWorkspace(
        workspaceId: string,
        query: FileQueryDto,
    ) {
        return this.fileRepo.listFiles(workspaceId, query)
    }


    async updateFile(params: {
        fileId: string
        workspaceId: string
        userId: string
        data: UpdateFileDto
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


        if (params.data.name) {
            const lastDotIndex = file.name.lastIndexOf('.')
            const ext = lastDotIndex !== -1 ? file.name.substring(lastDotIndex) : ''
            file.name = params.data.name + ext
        }

        return this.fileRepo.save(file)
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


        await this.storage.delete(file.publicId, file.mimeType)

        file.status = FileStatus.DELETED
        return this.fileRepo.save(file)
    }

}

