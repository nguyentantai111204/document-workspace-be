import { Injectable } from "@nestjs/common"
import { UsersRepository } from "../repository/user.repository"
import { CreateUserDto } from "../dto/create-user.dto"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"

import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from "../dto/change-password.dto"
import { KeyTokenService } from "src/modules/key-token/service/key-token.service"
import { SearchUsersDto } from "../dto/search-users.dto"
@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepo: UsersRepository,
        private readonly keyTokenService: KeyTokenService,
    ) { }

    async findByEmailForAuth(email: string) {
        return this.usersRepo.findByEmailWithPassword(email)
    }

    async findById(id: string) {
        const user = await this.usersRepo.findById(id)
        if (!user) throw new BadRequestError('Không tìm thấy người dùng')
        return user
    }

    async create(dto: CreateUserDto) {
        const exists = await this.usersRepo.findByEmail(dto.email)
        if (exists) {
            throw new BadRequestError('Email đã được sử dụng')
        }

        const passwordHash = await bcrypt.hash(dto.password, 10)

        return this.usersRepo.createUser({
            ...dto,
            password: passwordHash,
        })
    }

    async searchUsers(dto: SearchUsersDto) {
        const { email, page = 1, limit = 10 } = dto
        return this.usersRepo.searchUsers(email || '', page, limit)
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.usersRepo.findByIdWithPassword(userId)
        if (!user) throw new BadRequestError('Không tìm thấy người dùng')

        const isMatch = await bcrypt.compare(dto.currentPassword, user.password)
        if (!isMatch) {
            throw new BadRequestError('Mật khẩu cũ không đúng')
        }

        if (dto.currentPassword === dto.newPassword) {
            throw new BadRequestError('Mật khẩu mới không được trùng mật khẩu cũ')
        }

        if (dto.newPassword !== dto.confirmPassword) {
            throw new BadRequestError('Mật khẩu xác nhận không khớp')
        }

        const newHash = await bcrypt.hash(dto.newPassword, 10)

        await this.keyTokenService.revokeAll(userId)

        return this.usersRepo.updatePassword(userId, newHash)
    }
}



