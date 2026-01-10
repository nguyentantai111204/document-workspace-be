import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from 'src/modules/permission/entities/role.entity'
import { Permission } from 'src/modules/permission/entities/permission.entity'
import { RolePermission } from 'src/modules/permission/entities/role-permission.entity'

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
            USER: ['fund.join'],

            ADMIN: [
                'user.read',
                'user.create',
                'user.update',
                'user.delete',
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
