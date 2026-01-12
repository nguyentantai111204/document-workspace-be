import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./entities/file.entity";
import { CloudinaryProvider } from "./providers/cloudinary.provider";
import { FileStorageService } from "./services/file-storage.service";
import { CloudinaryStorageService } from "./services/cloudinary-storage.service";
import { FileService } from "./services/file.service";
import { FileController } from "./controller/file.controller";

@Module({
    imports: [TypeOrmModule.forFeature([FileEntity])],
    providers: [
        CloudinaryProvider,
        {
            provide: FileStorageService,
            useClass: CloudinaryStorageService,
        },
        FileService,
    ],
    controllers: [FileController],
})
export class FileModule { }
