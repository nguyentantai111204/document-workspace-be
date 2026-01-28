import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;
}