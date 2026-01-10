import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { KeyTokenRepository } from "./repository/key-token.repository";
import { KeyTokenService } from "./service/key-token.service";
import { KeyToken } from "./entities/key-token.entity";

@Module({
    imports: [TypeOrmModule.forFeature([KeyToken])],
    providers: [KeyTokenRepository, KeyTokenService],
    exports: [KeyTokenService],
})
export class KeyTokenModule { }
