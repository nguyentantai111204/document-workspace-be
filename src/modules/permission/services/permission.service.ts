import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserRole } from '../entities/user-role.entity'
import { RolePermission } from '../entities/role-permission.entity'

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(UserRole)
        private readonly userRoleRepo: Repository<UserRole>,

        @InjectRepository(RolePermission)
        private readonly rolePermissionRepo: Repository<RolePermission>,
    ) { }

    async getPermissionsByUser(userId: string): Promise<string[]> {
        const userRoles = await this.userRoleRepo.find({
            where: { user: { id: userId } },
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
        })

        const permissions = new Set<string>()

        userRoles.forEach(ur => {
            ur.role.rolePermissions.forEach(rp => {
                permissions.add(rp.permission.code)
            })
        })

        return [...permissions]
    }
}
