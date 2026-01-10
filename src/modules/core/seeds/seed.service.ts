import { Injectable, OnModuleInit } from '@nestjs/common'
import { RoleSeed } from './role.seed'
import { PermissionSeed } from './permission.seed'
import { RolePermissionSeed } from './role-permission.seed'

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        private readonly roleSeed: RoleSeed,
        private readonly permissionSeed: PermissionSeed,
        private readonly rolePermissionSeed: RolePermissionSeed,
    ) { }

    async onModuleInit() {
        if (process.env.NODE_ENV === 'production') return

        await this.roleSeed.run()
        await this.permissionSeed.run()
        await this.rolePermissionSeed.run()
    }
}
