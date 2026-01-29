import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RegisterDeviceDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    deviceType?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    deviceId: string;
}
