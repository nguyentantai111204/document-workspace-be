import { IsString, IsNotEmpty } from 'class-validator'

export class AddParticipantDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}
