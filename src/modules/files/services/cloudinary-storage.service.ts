import { Injectable, Inject } from '@nestjs/common'
import { FileStorageService, UploadResult } from './file-storage.service'
import streamifier from 'streamifier'

@Injectable()
export class CloudinaryStorageService extends FileStorageService {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinary,
  ) {
    super()
  }

  async upload(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const resourceType = this.getResourceType(file.mimetype)

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error)

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
            mimeType: file.mimetype,
          })
        },
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  async delete(publicId: string, mimeType?: string): Promise<void> {
    const resourceType = mimeType ? this.getResourceType(mimeType) : 'image'
    await this.cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
  }

  private getResourceType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return 'video'
    return 'raw'
  }
}
