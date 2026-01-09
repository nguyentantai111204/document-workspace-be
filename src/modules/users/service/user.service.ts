import { Injectable } from "@nestjs/common"
import { UsersRepository } from "../repository/user.repository"
import { NotFoundError } from "src/common/exceptions/not-found.exception"
import { CreateUserDto } from "../dto/create-user.dto"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"

import * as bcrypt from 'bcrypt';
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

    async findByEmail(email: string) {
        const user = await this.usersRepo.findByEmail(email);

        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng')
        }

        return user
    }

    async create(createUserDto: CreateUserDto) {
        const foundUser = await this.usersRepo.findByEmail(createUserDto.email)

        if (foundUser) {
            throw new BadRequestError('Email này đã được sử dụng')
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

        const userData = {
            ...createUserDto,
            password: hashedPassword
        };

        return await this.usersRepo.createUser(userData)
    }
}

