import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./entities/workspace.entity";
import { WorkspaceMember } from "./entities/workspace-member.entity";
import { WorkspaceService } from "./services/workspace.service";
import { WorkspaceMemberService } from "./services/workspace-member.service";
import { WorkspaceController } from "./controller/workspace.controller";
import { WorkspaceGuard } from "src/common/guards/workspace.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([Workspace, WorkspaceMember]),
    ],
    controllers: [WorkspaceController],
    providers: [
        WorkspaceService,
        WorkspaceMemberService,
        WorkspaceGuard
    ],
    exports: [WorkspaceMemberService, WorkspaceGuard, TypeOrmModule],
})
export class WorkspaceModule { }

