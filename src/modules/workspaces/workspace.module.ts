import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./entities/workspace.entity";
import { WorkspaceMember } from "./entities/workspace-member.entity";
import { WorkspaceService } from "./services/workspace.service";
import { WorkspaceMemberService } from "./services/workspace-member.service";
import { WorkspaceController } from "./controller/workspace.controller";
import { WorkspaceGuard } from "src/common/guards/workspace.guard";
import { WorkspaceInvite } from "./entities/workspace-invite.entity";
import { WorkspaceInviteService } from "./services/workspace-invite.service";
import { WorkspaceInviteController } from "./controller/workspace-invite.controller";
import { WorkspaceRepository } from "./repositories/workspace.repository";
import { WorkspaceMemberRepository } from "./repositories/workspace-memeber.repository";
import { WorkspaceInviteRepository } from "./repositories/workspace-invite.repository";
import { UsersModule } from "../users/user.module";
import { MailModule } from "src/common/modules/mail/mail.module";
import { RedisModule } from "src/common/modules/redis/redis.module";


@Module({
    imports: [
        TypeOrmModule.forFeature([Workspace, WorkspaceMember, WorkspaceInvite]),
        MailModule, UsersModule, RedisModule,
    ],
    controllers: [WorkspaceController, WorkspaceInviteController],
    providers: [
        WorkspaceService,
        WorkspaceMemberService,
        WorkspaceInviteService,
        WorkspaceRepository,
        WorkspaceMemberRepository,
        WorkspaceInviteRepository,
        WorkspaceGuard
    ],
    exports: [WorkspaceMemberService, WorkspaceGuard, TypeOrmModule],
})
export class WorkspaceModule { }

