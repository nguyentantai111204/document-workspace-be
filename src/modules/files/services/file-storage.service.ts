export interface UploadResult {
    url: string
    publicId: string
    size: number
    mimeType: string
}

export abstract class FileStorageService {
    abstract upload(file: Express.Multer.File, folder: string): Promise<UploadResult>
    abstract delete(publicId: string): Promise<void>
}
