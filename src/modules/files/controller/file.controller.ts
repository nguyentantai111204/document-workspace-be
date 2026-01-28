import {
    Controller, Delete, Get, Param, Post, Query, UploadedFiles, UseGuards, UseInterceptors, Body, Patch
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WorkspacePolicyGuard } from "src/common/guards/workspace-action.guard";
import { WorkspaceGuard } from "src/common/guards/workspace.guard";
import { FileService } from "../services/file.service";
import { WorkspaceActionPermission } from "src/common/decorators/workspace-action.decorator";
import {  FileFieldsInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { CurrentWorkspace } from "src/common/decorators/current-workspace.decorator";
import { WorkspaceAction } from "src/modules/workspaces/enums/workspace-action.enum";
import multer from "multer";
import { FileActionGuard } from "src/common/guards/file-action.guard";
import { FileActionPermission } from "src/common/decorators/file-action.decorator";
import { FileAction } from "../enums/file-action.enum";
import { FileOwnershipGuard } from "src/common/guards/file-ownership.guard";
import { FileQueryDto } from "../dto/file-query.dto";
import { UpdateFileDto } from "../dto/update-file.dto";
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
        FileFieldsInterceptor([
            { name: 'file', maxCount: 1 },
            { name: 'files', maxCount: 10 },
        ], {
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
            },
        }),
    )
    @ApiOperation({ summary: 'Upload file vào workspace (hỗ trợ single "file" hoặc multi "files")' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Single upload (legacy)'
                },
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Multi upload'
                },
            },
        },
    })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiResponse({ status: 201, description: 'Upload thành công' })
    @ApiResponse({ status: 400, description: 'File không hợp lệ' })
    upload(
        @UploadedFiles() files: { file?: Express.Multer.File[], files?: Express.Multer.File[] },
        @CurrentUser() user,
        @CurrentWorkspace() workspace,
    ) {
        const allFiles = [
            ...(files.file || []),
            ...(files.files || []),
        ];

        return this.fileService.uploadMany({
            workspaceId: workspace.id,
            userId: user.id,
            files: allFiles,
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

    // update
    @Patch(':fileId')
    @UseGuards(FileActionGuard, FileOwnershipGuard)
    @FileActionPermission(FileAction.UPDATE)
    @ApiOperation({ summary: 'Cập nhật thông tin file' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiParam({ name: 'fileId', description: 'ID của file cần cập nhật' })
    @ApiBody({ type: UpdateFileDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    update(
        @Param('fileId') fileId: string,
        @CurrentWorkspace() workspace,
        @CurrentUser() user,
        @Body() body: UpdateFileDto,
    ) {
        return this.fileService.updateFile({
            fileId,
            workspaceId: workspace.id,
            userId: user.id,
            data: body,
        });
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
