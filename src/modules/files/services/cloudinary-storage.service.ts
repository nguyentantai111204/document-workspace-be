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
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error)

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
            mimeType: result.resource_type,
          })
        },
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  async delete(publicId: string): Promise<void> {
    await this.cloudinary.uploader.destroy(publicId)
  }
}
