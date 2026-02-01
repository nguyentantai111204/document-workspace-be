import { Injectable } from "@nestjs/common"
import slugify from "slugify"
import { WorkspaceRole } from "../enums/workspace-role.enum"
import { WorkspaceMemberService } from "./workspace-member.service"
import { BadRequestError } from "src/common/exceptions/bad-request.exception"
import { WorkspaceQueryDto } from "../dto/workspace-filter.dto"
import { WorkspaceRepository } from "../repositories/workspace.repository"
import { RedisService } from "src/common/modules/redis/redis.service"
import { Workspace } from "../entities/workspace.entity"

@Injectable()
export class WorkspaceService {
    constructor(
        private readonly workspaceRepo: WorkspaceRepository,
        private readonly memberService: WorkspaceMemberService,
        private readonly redisService: RedisService,
    ) { }

    async createWorkspace(userId: string, name: string) {
        const slug = slugify(name, { lower: true })

        const workspace = await this.workspaceRepo.createWorkspace(
            name,
            slug,
            userId,
        )

        await this.memberService.addMember(
            workspace.id,
            userId,
            WorkspaceRole.OWNER,
        )

        return workspace
    }

    listUserWorkspaces(
        userId: string,
        query: WorkspaceQueryDto,
    ) {
        return this.workspaceRepo.listUserWorkspaces(userId, query)
    }

    async updateWorkspace(workspaceId: string, name: string) {
        const result = await this.workspaceRepo.updateWorkspace(workspaceId, name)
        await this.redisService.del(`workspaces:detail:${workspaceId}`);
        return result
    }

    async getWorkspaceDetail(
        workspaceId: string,
        userId: string,
    ) {
        const workspace = await this.redisService.remember(`workspaces:detail:${workspaceId}`, 86400, async () => {
            return this.workspaceRepo.findById(workspaceId)
        }, Workspace);

        if (!workspace) {
            throw new BadRequestError('Workspace không tồn tại')
        }


        const role = await this.memberService.getUserRole(
            workspaceId,
            userId,
        )
        return {
            workspace,
            role,
        }
    }

    async transferOwnership(
        workspaceId: string,
        currentOwnerId: string,
        newOwnerId: string,
    ) {
        await this.memberService.transferOwnership(
            workspaceId,
            currentOwnerId,
            newOwnerId,
        )
        await this.redisService.del(`workspaces:detail:${workspaceId}`);
    }

}


