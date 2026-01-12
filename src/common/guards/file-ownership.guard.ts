import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FileEntity } from 'src/modules/files/entities/file.entity'
import { ForbiddenError } from '../exceptions/forbiden.exception'

@Injectable()
export class FileOwnershipGuard implements CanActivate {
    constructor(
        @InjectRepository(FileEntity)
        private readonly fileRepo: Repository<FileEntity>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const user = req.user
        const fileId = req.params.fileId
        const workspaceId = req.workspaceId

        if (!fileId) return true

        const file = await this.fileRepo.findOne({
            where: {
                id: fileId,
                workspaceId,
            },
        })

        if (!file) {
            throw new ForbiddenError('File không tồn tại hoặc không thuộc workspace')
        }

        if (file.ownerId !== user.id) {
            throw new ForbiddenError('Bạn không phải chủ sở hữu file')
        }

        // cache để service không cần query lại
        req.file = file

        return true
    }
}
