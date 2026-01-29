import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from 'src/modules/permission/entities/permission.entity'
import { PermissionCode } from 'src/modules/permission/enums/permission-code.enum'

@Injectable()
export class PermissionSeed {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) { }

  async run() {
    const permissions = Object.values(PermissionCode).map(code => ({
      code,
      description: this.getDescription(code),
    }))

    for (const permission of permissions) {
      const exists = await this.permissionRepo.findOne({
        where: { code: permission.code },
      })

      if (!exists) {
        await this.permissionRepo.save(
          this.permissionRepo.create(permission),
        )
      }
    }
  }

  private getDescription(code: PermissionCode): string {
    const descriptions: Record<PermissionCode, string> = {
      [PermissionCode.AUTH_READ]: 'Xem thông tin xác thực',
      [PermissionCode.AUTH_UPDATE]: 'Cập nhật thông tin xác thực',
      [PermissionCode.USER_READ]: 'Xem danh sách người dùng',
      [PermissionCode.USER_CREATE]: 'Tạo người dùng',
      [PermissionCode.USER_UPDATE]: 'Cập nhật người dùng',
      [PermissionCode.USER_DELETE]: 'Xóa người dùng',
      [PermissionCode.ROLE_CREATE]: 'Tạo vai trò',
      [PermissionCode.ROLE_UPDATE]: 'Cập nhật vai trò',

      [PermissionCode.PERMISSION_ASSIGN]: 'Phân quyền',
      [PermissionCode.WORKSPACE_READ]: 'Xem danh sách không gian làm việc',
      [PermissionCode.WORKSPACE_CREATE]: 'Tạo không gian làm việc',
    }
    return descriptions[code] || code
  }
}
