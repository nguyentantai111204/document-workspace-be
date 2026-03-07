import { Injectable } from "@nestjs/common"
import { UsersRepository } from "../repositories/user.repository"
import { CreateUserDto } from "../dto/create-user.dto"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"

import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from "../dto/change-password.dto"
import { KeyTokenService } from "src/modules/key-token/service/key-token.service"
import { SearchUsersDto } from "../dto/search-users.dto"
import { RedisService } from "src/common/modules/redis/redis.service"
import { User } from "../entities/user.entity"
import { FileService } from "src/modules/files/services/file.service"
import { UpdateProfileDto } from "../dto/update-user.dto"
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepo: UsersRepository,
        private readonly keyTokenService: KeyTokenService,
        private readonly redisService: RedisService,
        private readonly fileService: FileService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async findByEmailForAuth(email: string) {
        return this.usersRepo.findByEmailWithPassword(email)
    }

    async findById(id: string) {
        return this.redisService.remember(`users:profile:${id}`, 3600, async () => {
            const user = await this.usersRepo.findById(id)
            if (!user) throw new BadRequestError('Không tìm thấy người dùng')
            return user
        }, User);
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

    async updateProfile(params: {
        userId: string
        dto: UpdateProfileDto
        avatarFile?: Express.Multer.File
    }) {
        const { userId, dto, avatarFile } = params

        const profileUpdate: Partial<Pick<User, 'fullName' | 'avatarUrl' | 'phoneNumber' | 'address'>> = {}

        if (dto.fullName) profileUpdate.fullName = dto.fullName
        if (dto.phoneNumber) profileUpdate.phoneNumber = dto.phoneNumber
        if (dto.address) profileUpdate.address = dto.address

        if (avatarFile) {
            const uploaded = await this.fileService.uploadRaw(avatarFile, 'avatars')
            profileUpdate.avatarUrl = uploaded.url
        } else if (dto.avatarUrl) {
            profileUpdate.avatarUrl = dto.avatarUrl
        }

        if (Object.keys(profileUpdate).length > 0) {
            await this.usersRepo.updateProfile(userId, profileUpdate)
        }

        if (dto.currentPassword || dto.newPassword || dto.confirmPassword) {
            if (!dto.currentPassword || !dto.newPassword || !dto.confirmPassword) {
                throw new BadRequestError('Cần cung cấp đầy đủ currentPassword, newPassword và confirmPassword để đổi mật khẩu')
            }

            const user = await this.usersRepo.findByIdWithPassword(userId)
            if (!user) throw new BadRequestError('Không tìm thấy người dùng')

            const isMatch = await bcrypt.compare(dto.currentPassword, user.password)
            if (!isMatch) throw new BadRequestError('Mật khẩu hiện tại không đúng')

            if (dto.currentPassword === dto.newPassword) {
                throw new BadRequestError('Mật khẩu mới không được trùng mật khẩu cũ')
            }
            if (dto.newPassword !== dto.confirmPassword) {
                throw new BadRequestError('Mật khẩu xác nhận không khớp')
            }

            const newHash = await bcrypt.hash(dto.newPassword, 10)
            await this.keyTokenService.revokeAll(userId)
            await this.usersRepo.updatePassword(userId, newHash)
        }

        await this.redisService.del(`users:profile:${userId}`)
        return this.usersRepo.findById(userId)
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

        const result = await this.usersRepo.updatePassword(userId, newHash)
        await this.redisService.del(`users:profile:${userId}`);

        return result
    }

    async deleteUser(userId: string) {
        await this.usersRepo.softDelete(userId)
        await this.redisService.del(`users:profile:${userId}`)
        this.eventEmitter.emit('user.deleted', { userId })
    }
}



