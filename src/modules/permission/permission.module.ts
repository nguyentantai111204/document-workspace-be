import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './entities/role.entity'
import { Permission } from './entities/permission.entity'
import { UserRole } from './entities/user-role.entity'
import { RolePermission } from './entities/role-permission.entity'
import { PermissionService } from './services/permission.service'
import { RoleRepository } from './repository/role.repository'
import { UserRoleRepository } from './repository/user-role.repository'
import { RedisModule } from 'src/common/modules/redis/redis.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Role,
            Permission,
            UserRole,
            RolePermission,
        ]),
        RedisModule,
    ],
    providers: [PermissionService, RoleRepository, UserRoleRepository],
    exports: [PermissionService],
})
export class PermissionModule { }
