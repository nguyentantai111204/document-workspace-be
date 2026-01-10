import { IsString, IsNotEmpty, MinLength, MaxLength, Validate } from 'class-validator'
import { IsStrongPasswordConstraint } from 'src/common/decorators/is-strong-password.decorator'

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    currentPassword: string

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    // @Validate(IsStrongPasswordConstraint)
    newPassword: string

    @IsString()
    @IsNotEmpty()
    confirmPassword: string
}