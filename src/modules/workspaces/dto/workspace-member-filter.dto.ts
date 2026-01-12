import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { WorkspaceRole } from '../enums/workspace-role.enum';

export class ListMembersQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsEnum(WorkspaceRole)
    role?: WorkspaceRole;
}
