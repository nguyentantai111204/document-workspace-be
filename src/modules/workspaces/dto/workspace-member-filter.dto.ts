import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { WorkspaceRole } from '../enums/workspace-role.enum';

export class ListMembersQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsEnum(WorkspaceRole)
    role?: WorkspaceRole;
}
