import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { WORKSPACE_ACTION_KEY } from "../decorators/workspace-action.decorator"
import { WorkspacePolicy } from "src/modules/workspaces/policies/workspace.policy"

@Injectable()
export class WorkspacePolicyGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const action = this.reflector.get(
            WORKSPACE_ACTION_KEY,
            context.getHandler(),
        )

        if (!action) return true

        const request = context.switchToHttp().getRequest()
        const role = request.workspaceRole

        return WorkspacePolicy[role]?.includes(action)
    }
}
