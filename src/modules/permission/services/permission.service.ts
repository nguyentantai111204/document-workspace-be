import { Injectable } from '@nestjs/common'
import { RoleRepository } from '../repository/role.repository'
import { UserRoleRepository } from '../repository/user-role.repository'

@Injectable()
export class PermissionService {
    constructor(
        private readonly roleRepo: RoleRepository,
        private readonly userRoleRepo: UserRoleRepository,
    ) { }

    async getPermissionsByUser(userId: string): Promise<string[]> {
        const userRoles =
            await this.userRoleRepo.findByUserIdWithPermissions(userId)

        const permissions = new Set<string>()

        for (const ur of userRoles) {
            for (const rp of ur.role.rolePermissions) {
                permissions.add(rp.permission.code)
            }
        }

        return [...permissions]
    }

    async assignDefaultRole(userId: string) {
        const role = await this.roleRepo.findByCode('USER')
        if (!role) throw new Error('Default role USER not found')

        await this.userRoleRepo.assignRole(userId, role.id)
    }
}

