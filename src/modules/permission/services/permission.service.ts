import { Injectable } from '@nestjs/common'
import { RoleRepository } from '../repository/role.repository'
import { UserRoleRepository } from '../repository/user-role.repository'
import { RedisService } from 'src/common/modules/redis/redis.service'

@Injectable()
export class PermissionService {
    constructor(
        private readonly roleRepo: RoleRepository,
        private readonly userRoleRepo: UserRoleRepository,
        private readonly redisService: RedisService,
    ) { }

    async getPermissionsByUser(userId: string): Promise<string[]> {
        const cacheKey = `user:${userId}:permissions`;
        const cached = await this.redisService.getJson<string[]>(cacheKey);
        if (cached) return cached;

        const userRoles =
            await this.userRoleRepo.findByUserIdWithPermissions(userId)

        const permissions = new Set<string>()

        for (const ur of userRoles) {
            for (const rp of ur.role.rolePermissions) {
                permissions.add(rp.permission.code)
            }
        }

        const result = [...permissions];
        await this.redisService.setJson(cacheKey, result, 3600);

        return result
    }

    async assignDefaultRole(userId: string) {
        const role = await this.roleRepo.findByCode('USER')
        if (!role) throw new Error('Default role USER not found')

        await this.userRoleRepo.assignRole(userId, role.id)
        await this.redisService.del(`user:${userId}:permissions`);
    }
}

