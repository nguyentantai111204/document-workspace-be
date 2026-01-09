import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { KeyToken } from "../entities/key-token.entity";
import { Repository } from "typeorm";

@Injectable()
export class KeyTokenRepository {
    constructor(
        @InjectRepository(KeyToken)
        private readonly repo: Repository<KeyToken>,
    ) { }

    async createKeyToken(data: Partial<KeyToken>) {
        return await this.repo.save(this.repo.create(data));
    }

    async findByRefreshToken(refreshToken: string) {
        return await this.repo.findOne({ where: { refreshToken, isRevoked: false } });
    }

    async deleteById(id: string) {
        return await this.repo.delete(id);
    }

    revokeToken(id: string) {
        return this.repo.update(id, { isRevoked: true })
    }

    revokeAllByUser(userId: string) {
        return this.repo.update(
            { user: { id: userId } },
            { isRevoked: true },
        )
    }
}