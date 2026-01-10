import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from 'src/modules/permission/entities/role.entity'
import { Permission } from 'src/modules/permission/entities/permission.entity'
import { RolePermission } from 'src/modules/permission/entities/role-permission.entity'
import { RoleSeed } from './role.seed'
import { PermissionSeed } from './permission.seed'
import { RolePermissionSeed } from './role-permission.seed'
import { SeedService } from './seed.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, Permission, RolePermission]),
    ],
    providers: [
        RoleSeed,
        PermissionSeed,
        RolePermissionSeed,
        SeedService,
    ],
})
export class SeedModule { }
