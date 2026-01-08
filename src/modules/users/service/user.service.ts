import { Injectable } from "@nestjs/common"
import { UsersRepository } from "../repository/user.repository"
import { NotFoundError } from "src/common/exceptions/not-found.exception"

@Injectable()
export class UsersService {
    constructor(private readonly usersRepo: UsersRepository) { }

    async findById(id: string) {
        const user = await this.usersRepo.findById(id)

        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng')
        }

        return user
    }
}

