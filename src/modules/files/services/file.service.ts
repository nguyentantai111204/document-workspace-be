import { Injectable } from "@nestjs/common"
import slugify from "slugify"
import { FileStorageService } from "./file-storage.service"
import { FileStatus } from "../enums/file-status.enum"
import { FileValidationService } from "./file-validation.service"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { FileQueryDto } from "../dto/file-query.dto"
import { FileRepository } from "../repositories/file.repository"
import { UpdateFileDto } from "../dto/update-file.dto"
import { RedisService } from "src/common/modules/redis/redis.service"
import { FileEntity } from "../entities/file.entity"

@Injectable()
export class FileService {
    constructor(
        private readonly fileRepo: FileRepository,
        private readonly storage: FileStorageService,
        private readonly validator: FileValidationService,
        private readonly redisService: RedisService,
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

    async getFileDetail(params: {
        fileId: string
        workspaceId: string
    }) {
        const file = await this.redisService.remember(`file:${params.fileId}:metadata`, 86400, async () => {
            return this.fileRepo.findOne({
                where: {
                    id: params.fileId,
                    workspaceId: params.workspaceId,
                    status: FileStatus.ACTIVE,
                },
            })
        }, FileEntity);

        if (!file) {
            throw new BadRequestError('File không tồn tại')
        }

        if (file.workspaceId !== params.workspaceId || file.status !== FileStatus.ACTIVE) {
            await this.redisService.del(`file:${params.fileId}:metadata`);
            throw new BadRequestError('File không tồn tại (cache mismatch)')
        }

        return file;
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

        const saved = await this.fileRepo.save(file)

        await this.redisService.del(`file:${params.fileId}:metadata`);

        return saved
    }


    async deleteFile(params: {
        fileId: string
        workspaceId: string
        userId: string
    }) {
        // Query từ database để đảm bảo data consistency
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
        const saved = await this.fileRepo.save(file)

        // Invalidate cache sau khi delete
        await this.redisService.del(`file:${params.fileId}:metadata`);

        return saved;
    }

}

