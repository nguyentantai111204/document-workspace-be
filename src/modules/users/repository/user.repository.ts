import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "../entities/user.entity"
import { Repository } from "typeorm"
import { PaginatedResponse } from "src/common/interfaces/paginated-result.interface"
import { buildPaginationMeta } from "src/common/utils/pagination.utils"
import { UserStatus } from "../enums/user-status.enum"

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) { }

  // business / response
  findById(id: string) {
    return this.repo.createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'ur')
      .leftJoinAndSelect('ur.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'perm')
      .where('user.id = :id', { id })
      .select([
        'user.id', 'user.email', 'user.fullName', 'user.avatarUrl', 'user.status',
        'ur.roleId',
        'role.code', 'role.description',
        'rp.id',
        'perm.code', 'perm.description'
      ])
      .getOne()
  }

  // business trong service
  findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
      select: ['id', 'email', 'fullName', 'avatarUrl', 'status'],
    })
  }

  // auth / change password
  findByIdWithPassword(id: string) {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne()
  }

  // cho auth / login
  findByEmailWithPassword(email: string) {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne()
  }

  updatePassword(id: string, passwordHash: string) {
    return this.repo.update(id, { password: passwordHash })
  }

  async searchUsers(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    const skip = (page - 1) * limit

    const qb = this.repo
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.fullName', 'user.avatarUrl'])
      .where('user.status = :status', { status: UserStatus.ACTIVE })

    if (query) {
      qb.andWhere(
        '(LOWER(user.email) LIKE LOWER(:query) OR LOWER(user.fullName) LIKE LOWER(:query))',
        { query: `%${query}%` }
      )
    }

    qb.skip(skip).take(limit)

    const [items, total] = await qb.getManyAndCount()

    return {
      items,
      meta: buildPaginationMeta(page, limit, total),
    }
  }

  createUser(data: Partial<User>) {
    return this.repo.save(this.repo.create(data))
  }
}


