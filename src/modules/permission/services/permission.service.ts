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
        return this.redisService.remember(`user:${userId}:permissions`, 3600, async () => {
            const userRoles = await this.userRoleRepo.findByUserIdWithPermissions(userId)

            const permissions = new Set<string>()

            for (const ur of userRoles) {
                for (const rp of ur.role.rolePermissions) {
                    permissions.add(rp.permission.code)
                }
            }

            return [...permissions];
        });
    }

    async assignDefaultRole(userId: string) {
        const role = await this.roleRepo.findByCode('USER')
        if (!role) throw new Error('Default role USER not found')

        await this.userRoleRepo.assignRole(userId, role.id)
        await this.redisService.del(`user:${userId}:permissions`);
    }
}

