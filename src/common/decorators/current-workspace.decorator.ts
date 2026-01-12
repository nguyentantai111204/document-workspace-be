import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const CurrentWorkspace = createParamDecorator(
    (_, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest()
        return {
            id: req.workspaceId,
            role: req.workspaceRole,
        }
    },
)
