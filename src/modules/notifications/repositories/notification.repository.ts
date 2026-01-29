import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Notification } from "../entities/notification.entity"
import { PaginatedResponse } from "src/common/interfaces/paginated-result.interface"
import { buildPaginationMeta } from "src/common/utils/pagination.utils"

@Injectable()
export class NotificationRepository {
    constructor(
        @InjectRepository(Notification)
        private readonly repo: Repository<Notification>,
    ) { }

    async listByUser(
        userId: string,
        page: number = 1,
        limit: number = 20,
    ): Promise<PaginatedResponse<Notification>> {
        const skip = (page - 1) * limit

        const [items, total] = await this.repo.findAndCount({
            where: { recipientId: userId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        })

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        }
    }

    async countUnread(userId: string): Promise<number> {
        return this.repo.count({
            where: { recipientId: userId, isRead: false },
        })
    }

    create(data: Partial<Notification>) {
        return this.repo.save(this.repo.create(data))
    }

    async markAsRead(id: string, userId: string) {
        return this.repo.update({ id, recipientId: userId }, { isRead: true })
    }

    async markAllAsRead(userId: string) {
        return this.repo.update({ recipientId: userId, isRead: false }, { isRead: true })
    }
}
