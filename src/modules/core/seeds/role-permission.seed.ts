import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from 'src/modules/permission/entities/role.entity'
import { Permission } from 'src/modules/permission/entities/permission.entity'
import { RolePermission } from 'src/modules/permission/entities/role-permission.entity'
import { PermissionCode } from 'src/modules/permission/enums/permission-code.enum'

@Injectable()
export class RolePermissionSeed {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,

        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>,

        @InjectRepository(RolePermission)
        private readonly rpRepo: Repository<RolePermission>,
    ) { }

    async run() {
        const map: Record<string, string[]> = {
            USER: [
                PermissionCode.WORKSPACE_READ,
                PermissionCode.FILE_READ,
                PermissionCode.AUTH_READ,
                PermissionCode.AUTH_UPDATE, // Allow updating own profile
                PermissionCode.USER_READ,   // Allow reading user list (for search)
            ],

            OWNER: [
                PermissionCode.WORKSPACE_CREATE,
                PermissionCode.WORKSPACE_UPDATE,
                PermissionCode.WORKSPACE_DELETE,
                PermissionCode.WORKSPACE_READ,
                PermissionCode.FILE_UPLOAD,
                PermissionCode.FILE_DELETE,
                PermissionCode.FILE_READ,
                PermissionCode.AUTH_READ,
                PermissionCode.AUTH_UPDATE,
                PermissionCode.USER_READ,
            ],

            ADMIN: [
                PermissionCode.USER_CREATE,
                PermissionCode.USER_UPDATE,
                PermissionCode.USER_DELETE,
                PermissionCode.WORKSPACE_CREATE,
                PermissionCode.WORKSPACE_UPDATE,
                PermissionCode.WORKSPACE_DELETE,
                PermissionCode.WORKSPACE_READ,
                PermissionCode.FILE_UPLOAD,
                PermissionCode.FILE_DELETE,
                PermissionCode.FILE_READ,
                PermissionCode.ROLE_CREATE,
                PermissionCode.ROLE_UPDATE,
                PermissionCode.PERMISSION_ASSIGN,
            ],

            SUPER_ADMIN: ['*'],
        }

        for (const [roleCode, permissionCodes] of Object.entries(map)) {
            const role = await this.roleRepo.findOne({
                where: { code: roleCode },
            })
            if (!role) continue

            if (permissionCodes.includes('*')) {
                const permissions = await this.permissionRepo.find()
                for (const permission of permissions) {
                    await this.attach(role.id, permission.id)
                }
            } else {
                for (const code of permissionCodes) {
                    const permission = await this.permissionRepo.findOne({
                        where: { code },
                    })
                    if (permission) {
                        await this.attach(role.id, permission.id)
                    }
                }
            }
        }
    }

    private async attach(roleId: string, permissionId: string) {
        const exists = await this.rpRepo.findOne({
            where: { roleId, permissionId },
        })

        if (!exists) {
            await this.rpRepo.save(
                this.rpRepo.create({
                    roleId,
                    permissionId,
                }),
            )
        }
    }
}
