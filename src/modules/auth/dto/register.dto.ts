import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email của người dùng'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'Mật khẩu (tối thiểu 6 ký tự)',
        minLength: 6
    })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        example: 'Nguyen Van A',
        description: 'Họ và tên'
    })
    @IsString()
    @IsNotEmpty()
    fullName: string;
    @ApiProperty({
        example: 'uuid-device-id',
        description: 'ID thiết bị (nếu có)',
        required: false
    })
    @IsString()
    @IsOptional()
    deviceId?: string;
}