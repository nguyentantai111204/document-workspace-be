import { IsOptional, IsString, MinLength, MaxLength, IsPhoneNumber } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Họ và tên' })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiPropertyOptional({ description: 'URL avatar (nếu đã upload riêng)' })
  @IsOptional()
  @IsString()
  avatarUrl?: string

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phoneNumber?: string

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  address?: string

  // --- Đổi mật khẩu (tất cả 3 field phải gửi cùng nhau) ---
  @ApiPropertyOptional({ description: 'Mật khẩu hiện tại' })
  @IsOptional()
  @IsString()
  currentPassword?: string

  @ApiPropertyOptional({ description: 'Mật khẩu mới (tối thiểu 6 ký tự)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword?: string

  @ApiPropertyOptional({ description: 'Xác nhận mật khẩu mới' })
  @IsOptional()
  @IsString()
  confirmPassword?: string
}
