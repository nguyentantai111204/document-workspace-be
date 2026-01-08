import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersRepository } from "./repository/user.repository";
import { UsersService } from "./service/user.service";
import { UsersController } from "./controllers/users.controller";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService, UsersRepository],
    controllers: [UsersController],
    exports: [UsersService], // cho Auth, Workspace
})
export class UsersModule { }
