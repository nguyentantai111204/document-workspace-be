import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsNotEmpty,
    Matches
} from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @MinLength(6)
    @MaxLength(20)
    @Matches(
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        { message: 'Mật khẩu quá yếu' }
    )
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    fullName: string;
}