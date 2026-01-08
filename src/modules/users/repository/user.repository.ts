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

  findById(id: string) {
    return this.repo.findOne({ where: { id }, select: ['id', 'fullName', 'avatarUrl', 'email'] })
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } })
  }

  createUser(data: Partial<User>) {
    return this.repo.save(this.repo.create(data))
  }
}
