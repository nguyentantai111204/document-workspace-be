import { IsOptional, IsString } from "class-validator"

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string

  @IsOptional()
  avatarUrl?: string
}
