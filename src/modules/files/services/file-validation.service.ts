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

        // PDF
        'application/pdf',

        // Word
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

        // Excel
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

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
    ]


    private readonly maxFileSize = 10 * 1024 * 1024 // 10MB

    async validate(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestError('File không tồn tại')
        }

        // Check size lần 2
        if (file.size > this.maxFileSize) {
            throw new BadRequestError('File vượt quá dung lượng cho phép')
        }

        // Check MIME thật sự
        const fileType = await fileTypeFromBuffer(file.buffer)

        // Fallback cho file text (file-type không detect được)
        let mime = fileType?.mime
        let ext = fileType?.ext

        if (!mime) {
            if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt') || file.originalname.endsWith('.TXT')) {
                mime = 'text/plain'
                ext = 'txt'
            } else {
                throw new BadRequestError('Không xác định được loại file')
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
