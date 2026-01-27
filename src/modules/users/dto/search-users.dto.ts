import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchUsersDto {
    @ApiPropertyOptional({ description: 'Tìm kiếm theo email hoặc tên', example: 'john@example.com' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ description: 'Số trang', example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Số lượng kết quả mỗi trang', example: 10, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;
}

