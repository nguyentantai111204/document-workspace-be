import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from 'src/modules/permission/entities/role.entity'

@Injectable()
export class RoleSeed {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) { }

  async run() {
    const roles: Partial<Role>[] = [
      { code: 'USER', description: 'Người dùng' },
      { code: 'ADMIN', description: 'Quản trị viên' },
      { code: 'OWNER', description: 'Quản lý' },
    ]

    for (const role of roles) {
      const exists = await this.roleRepo.findOne({
        where: { code: role.code },
      })

      if (!exists) {
        await this.roleRepo.save(this.roleRepo.create(role))
      }
    }
  }
}
