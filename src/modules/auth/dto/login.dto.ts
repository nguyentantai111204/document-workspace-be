import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class LoginDto {
    @ApiProperty({
        example: 'uuid-device-id',
        description: 'ID thiết bị (nếu có)',
        required: false
    })
    @IsString()
    @IsOptional()
    deviceId?: string;

    @IsEmail()
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email của người dùng'
    })
    email: string

    @IsString()
    @MinLength(6)
    @ApiProperty({
        example: 'password123',
        description: 'Mật khẩu (tối thiểu 6 ký tự)',
        minLength: 6
    })
    password: string
}
