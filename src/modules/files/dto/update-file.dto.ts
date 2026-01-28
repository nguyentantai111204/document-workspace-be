import { IsNotEmpty, IsString } from "class-validator";

export class UpdateFileDto {

    @IsNotEmpty()
    @IsString()
    name: string
}