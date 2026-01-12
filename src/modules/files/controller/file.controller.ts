import { Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WorkspacePolicyGuard } from "src/common/guards/workspace-action.guard";
import { WorkspaceGuard } from "src/common/guards/workspace.guard";
import { FileService } from "../services/file.service";
import { WorkspaceActionPermission } from "src/common/decorators/workspace-action.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { CurrentWorkspace } from "src/common/decorators/current-workspace.decorator";
import { WorkspaceAction } from "src/modules/workspaces/enums/workspace-action.enum";
import multer from "multer";
import { FileActionGuard } from "src/common/guards/file-action.guard";
import { FileActionPermission } from "src/common/decorators/file-action.decorator";
import { FileAction } from "../enums/file-action.enum";
import { FileOwnershipGuard } from "src/common/guards/file-ownership.guard";
import { PaginationDto } from "src/common/dto/pagination.interface";

@Controller('workspaces/:workspaceId/files')
@UseGuards(AuthGuard('jwt'), WorkspaceGuard, WorkspacePolicyGuard)
export class FileController {
    constructor(private readonly fileService: FileService) { }

    // upload
    @Post()
    @WorkspaceActionPermission(WorkspaceAction.UPLOAD_FILE)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
            },
        }),
    )
    upload(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user,
        @CurrentWorkspace() workspace,
    ) {
        return this.fileService.uploadFile({
            workspaceId: workspace.id,
            userId: user.id,
            file,
        })
    }

    // list
    @Get()
    listFiles(
        @Param('workspaceId') workspaceId: string,
        @Query() pagination: PaginationDto,
    ) {
        return this.fileService.listByWorkspace(workspaceId, pagination)
    }


    // delete
    @Delete(':fileId')
    @UseGuards(FileActionGuard, FileOwnershipGuard)
    @FileActionPermission(FileAction.DELETE)
    delete(
        @Param('fileId') fileId: string,
        @CurrentWorkspace() workspace,
        @CurrentUser() user,
    ) {
        return this.fileService.deleteFile({
            fileId,
            workspaceId: workspace.id,
            userId: user.id,
        })
    }



}
