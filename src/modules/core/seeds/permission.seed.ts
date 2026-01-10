import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from 'src/modules/permission/entities/permission.entity'

@Injectable()
export class PermissionSeed {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) { }

  async run() {
    const permissions: Partial<Permission>[] = [
      { code: 'user.read', description: 'Xem danh sách người dùng' },
      { code: 'user.create', description: 'Tạo người dùng' },
      { code: 'user.update', description: 'Cập nhật người dùng' },
      { code: 'user.delete', description: 'Xóa người dùng' },

    ]

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
}
