import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRole } from "../entities/user-role.entity";

@Injectable()
export class UserRoleRepository {
    constructor(
        @InjectRepository(UserRole)
        private readonly repo: Repository<UserRole>,
    ) { }

    assignRole(userId: string, roleId: string) {
        return this.repo.save(
            this.repo.create({
                userId,
                roleId,
            }),
        )
    }

    findByUserIdWithPermissions(userId: string) {
        return this.repo.find({
            where: { user: { id: userId } },
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
        })
    }
}
