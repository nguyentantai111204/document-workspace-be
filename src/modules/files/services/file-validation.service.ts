import { Injectable } from '@nestjs/common'
import { fileTypeFromBuffer } from 'file-type'
import { BadRequestError } from 'src/common/exceptions/bad-request.exception'

@Injectable()
export class FileValidationService {
    private readonly allowedMimeTypes = [
        // Images
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/svg+xml',

        // PDF
        'application/pdf',

        // Word
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

        // Excel
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',

        // PowerPoint
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',

        // Text
        'text/plain',

        // Audio
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
        'audio/mp4',

        // (Optional) Video
        'video/mp4',
        'video/webm',
    ]



    private readonly maxFileSize = 10 * 1024 * 1024 // 10MB

    async validate(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestError('File không tồn tại')
        }

        if (file.size === 0) {
            throw new BadRequestError('File không được để trống (0 bytes)')
        }

        // Check SIZE lần 2 (max size)
        if (file.size > this.maxFileSize) {
            throw new BadRequestError(`File vượt quá dung lượng cho phép (${this.maxFileSize / 1024 / 1024}MB)`)
        }

        // Check MIME thật sự
        const fileType = await fileTypeFromBuffer(file.buffer)

        // Fallback cho file text (file-type không detect được)
        let mime = fileType?.mime
        let ext = fileType?.ext

        if (!mime) {
            const isText = file.mimetype === 'text/plain'
                || file.mimetype === 'application/json'
                || file.originalname.match(/\.(txt|json|csv|md|html|css|js|ts)$/i)

            if (isText) {
                mime = 'text/plain'
                ext = 'txt'
            } else {
                throw new BadRequestError('Không xác định được loại file. Vui lòng kiểm tra lại file của bạn.')
            }
        }

        if (!this.allowedMimeTypes.includes(mime)) {
            throw new BadRequestError(
                `File không được hỗ trợ (${mime})`,
            )
        }

        return {
            mimeType: mime,
            extension: ext,
        }
    }
}
