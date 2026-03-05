import { Module } from "@nestjs/common";
import { CloudinaryProvider } from "./providers/cloudinary.provider";
import { FileStorageService } from "./services/file-storage.service";
import { CloudinaryStorageService } from "./services/cloudinary-storage.service";
import { FileValidationService } from "./services/file-validation.service";
import { FileService } from "./services/file.service";
import { FileRepository } from "./repositories/file.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./entities/file.entity";
import { RedisModule } from "src/common/modules/redis/redis.module";

@Module({
    imports: [TypeOrmModule.forFeature([FileEntity]), RedisModule],
    providers: [
        CloudinaryProvider,
        {
            provide: FileStorageService,
            useClass: CloudinaryStorageService,
        },
        FileValidationService,
        FileService,
        FileRepository,
    ],
    exports: [FileService, FileValidationService],
})
export class FileUploadModule { }
