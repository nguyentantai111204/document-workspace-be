import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { KeyToken } from "../entities/key-token.entity";

@Injectable()
export class KeyTokenRepository {
    constructor(
        @InjectRepository(KeyToken)
        private readonly repo: Repository<KeyToken>,
    ) { }

    createKeyToken(data: Partial<KeyToken>) {
        return this.repo.save(this.repo.create(data));
    }

    findByRefreshToken(refreshToken: string) {
        return this.repo.findOne({ where: { refreshToken, isRevoked: false } });
    }

    deleteById(id: string) {
        return this.repo.delete(id);
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