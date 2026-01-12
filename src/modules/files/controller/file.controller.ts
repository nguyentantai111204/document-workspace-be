import {
    Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors
} from "@nestjs/common";
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
import { PaginationDto } from "src/common/dto/pagination.dto";
import { FileQueryDto } from "../dto/file-query.dto";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Files')
@ApiBearerAuth()
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
    @ApiOperation({ summary: 'Upload file vào workspace' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File cần upload'
                },
            },
            required: ['file'],
        },
    })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiResponse({ status: 201, description: 'Upload thành công' })
    @ApiResponse({ status: 400, description: 'File không hợp lệ' })
    upload(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user,
        @CurrentWorkspace() workspace,
    ) {
        return this.fileService.uploadFile({
            workspaceId: workspace.id,
            userId: user.id,
            file,
        });
    }

    // list
    @Get()
    @ApiOperation({ summary: 'Lấy danh sách file trong workspace' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Danh sách file' })
    listFiles(
        @Param('workspaceId') workspaceId: string,
        @Query() query: FileQueryDto,
    ) {
        return this.fileService.listByWorkspace(workspaceId, query);
    }

    // delete
    @Delete(':fileId')
    @UseGuards(FileActionGuard, FileOwnershipGuard)
    @FileActionPermission(FileAction.DELETE)
    @ApiOperation({ summary: 'Xóa file khỏi workspace' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiParam({ name: 'fileId', description: 'ID của file cần xóa' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 403, description: 'Không có quyền xóa file' })
    delete(
        @Param('fileId') fileId: string,
        @CurrentWorkspace() workspace,
        @CurrentUser() user,
    ) {
        return this.fileService.deleteFile({
            fileId,
            workspaceId: workspace.id,
            userId: user.id,
        });
    }
}
