import { Injectable, Inject } from '@nestjs/common'
import { FileStorageService, UploadResult } from './file-storage.service'

@Injectable()
export class CloudinaryStorageService extends FileStorageService {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinary,
  ) {
    super()
  }

  async upload(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const result = await this.cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      mimeType: result.resource_type,
    }
  }

  async delete(publicId: string): Promise<void> {
    await this.cloudinary.uploader.destroy(publicId)
  }
}
