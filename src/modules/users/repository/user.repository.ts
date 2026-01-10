import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "../entities/user.entity"
import { Repository } from "typeorm"

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) { }

  // business / response
  findById(id: string) {
    return this.repo.findOne({
      where: { id },
      select: ['id', 'email', 'fullName', 'avatarUrl', 'status'],
    })
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

  createUser(data: Partial<User>) {
    return this.repo.save(this.repo.create(data))
  }
}


