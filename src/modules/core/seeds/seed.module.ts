import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from 'src/modules/permission/entities/role.entity'
import { Permission } from 'src/modules/permission/entities/permission.entity'
import { RolePermission } from 'src/modules/permission/entities/role-permission.entity'
import { RoleSeed } from './role.seed'
import { PermissionSeed } from './permission.seed'
import { RolePermissionSeed } from './role-permission.seed'
import { SeedService } from './seed.service'
import { User } from 'src/modules/users/entities/user.entity'
import { UserSeed } from './user.seed'
import { UserRole } from 'src/modules/permission/entities/user-role.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, Permission, RolePermission, User, UserRole]),
    ],
    providers: [
        RoleSeed,
        PermissionSeed,
        RolePermissionSeed,
        SeedService,
        UserSeed
    ],
})
export class SeedModule { }
