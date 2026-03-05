import {
    Controller,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import multer from 'multer'
import { FileService } from '../services/file.service'
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiBody,
    ApiConsumes,
    ApiResponse,
} from '@nestjs/swagger'

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(AuthGuard('jwt'))
export class GenericFileController {
    constructor(private readonly fileService: FileService) { }

    @Post('upload')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'file', maxCount: 1 },
                { name: 'files', maxCount: 10 },
            ],
            {
                storage: multer.memoryStorage(),
                limits: {
                    fileSize: 10 * 1024 * 1024, // 10MB
                },
            },
        ),
    )
    @ApiOperation({
        summary: 'Upload file generic (không cần workspace). Trả về url, publicId, mimeType, size, name để caller tự gán vào record tùy ý.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Single file upload',
                },
                files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Multi file upload',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Upload thành công — trả về mảng kết quả',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    url: { type: 'string' },
                    publicId: { type: 'string' },
                    mimeType: { type: 'string' },
                    size: { type: 'number' },
                    name: { type: 'string' },
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'File không hợp lệ' })
    async upload(
        @UploadedFiles()
        uploadedFiles: { file?: Express.Multer.File[]; files?: Express.Multer.File[] },
    ) {
        const allFiles = [
            ...(uploadedFiles?.file ?? []),
            ...(uploadedFiles?.files ?? []),
        ]

        if (allFiles.length === 0) {
            return []
        }

        return Promise.all(
            allFiles.map((f) => this.fileService.uploadRaw(f))
        )
    }
}
