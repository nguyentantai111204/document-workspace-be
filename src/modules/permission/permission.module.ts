import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './entities/role.entity'
import { Permission } from './entities/permission.entity'
import { UserRole } from './entities/user-role.entity'
import { RolePermission } from './entities/role-permission.entity'
import { PermissionService } from './services/permission.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Role,
            Permission,
            UserRole,
            RolePermission,
        ]),
    ],
    providers: [PermissionService],
    exports: [PermissionService],
})
export class PermissionModule { }
