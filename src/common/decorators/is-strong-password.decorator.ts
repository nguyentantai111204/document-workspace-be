import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint()
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
    validate(password: string) {
        const hasUpper = /[A-Z]/.test(password)
        const hasLower = /[a-z]/.test(password)
        const hasNumber = /\d/.test(password)
        return hasUpper && hasLower && hasNumber
    }

    defaultMessage() {
        return 'Mật khẩu nên tồn tại kí tự hoa, thường và số'
    }
}