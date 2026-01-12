import { Injectable } from '@nestjs/common'
import { fileTypeFromBuffer } from 'file-type'
import { BadRequestError } from 'src/common/exceptions/bad-request.exception'

@Injectable()
export class FileValidationService {
    private readonly allowedMimeTypes = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'application/pdf',
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

        // Check MIME thật (magic bytes)
        const fileType = await fileTypeFromBuffer(file.buffer)

        if (!fileType) {
            throw new BadRequestError('Không xác định được loại file')
        }

        if (!this.allowedMimeTypes.includes(fileType.mime)) {
            throw new BadRequestError(
                `File không được hỗ trợ (${fileType.mime})`,
            )
        }

        return {
            mimeType: fileType.mime,
            extension: fileType.ext,
        }
    }
}
