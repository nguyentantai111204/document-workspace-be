import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config.module";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/user.module";
import { APP_FILTER } from "@nestjs/core";
import { HttpExceptionFilter } from "src/common/filters/http-exception.filter";
import { LoggerModule } from "src/common/logger/logger.module";
import { KeyTokenModule } from "../key-token/key-token.module";
import { PermissionModule } from "../permission/permission.module";
import { SeedModule } from "./seeds/seed.module";
import { WorkspaceModule } from "../workspaces/workspace.module";
import { FileModule } from "../files/file.module";

@Module({
  imports: [
    AppConfigModule, DatabaseModule, LoggerModule, AuthModule, UsersModule,
    KeyTokenModule, PermissionModule, SeedModule, WorkspaceModule, FileModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class CoreModule { }
