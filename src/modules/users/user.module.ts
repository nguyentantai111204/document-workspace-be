import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersRepository } from "./repository/user.repository";
import { UsersService } from "./service/user.service";
import { UsersController } from "./controllers/users.controller";
import { KeyTokenModule } from "../key-token/key-token.module";

@Module({
    imports: [TypeOrmModule.forFeature([User]), KeyTokenModule],
    providers: [UsersService, UsersRepository],
    controllers: [UsersController],
    exports: [UsersService, UsersRepository], // cho Auth, Workspace
})
export class UsersModule { }
