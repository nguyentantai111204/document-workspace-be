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
import { MailModule } from "src/common/services/mail/mail.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Workspace, WorkspaceMember, WorkspaceInvite]),
        MailModule,
    ],
    controllers: [WorkspaceController, WorkspaceInviteController],
    providers: [
        WorkspaceService,
        WorkspaceMemberService,
        WorkspaceInviteService,
        WorkspaceGuard
    ],
    exports: [WorkspaceMemberService, WorkspaceGuard, TypeOrmModule],
})
export class WorkspaceModule { }

