import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Workspace } from "../entities/workspace.entity"
import { Repository } from "typeorm"
import slugify from "slugify"
import { WorkspaceRole } from "../enums/workspace-role.enum"
import { WorkspaceMemberService } from "./workspace-member.service"

@Injectable()
export class WorkspaceService {
    constructor(
        @InjectRepository(Workspace)
        private readonly workspaceRepo: Repository<Workspace>,
        private readonly memberService: WorkspaceMemberService,
    ) { }

    async createWorkspace(userId: string, name: string) {
        const slug = slugify(name, { lower: true })

        const workspace = this.workspaceRepo.create({
            name,
            slug,
            ownerId: userId,
        })

        await this.workspaceRepo.save(workspace)

        await this.memberService.addMember(
            workspace.id,
            userId,
            WorkspaceRole.OWNER,
        )

        return workspace
    }
}

