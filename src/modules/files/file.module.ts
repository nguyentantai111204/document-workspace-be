import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./entities/file.entity";
import { CloudinaryProvider } from "./providers/cloudinary.provider";
import { FileStorageService } from "./services/file-storage.service";
import { CloudinaryStorageService } from "./services/cloudinary-storage.service";
import { FileService } from "./services/file.service";
import { FileController } from "./controller/file.controller";
import { FileValidationService } from "./services/file-validation.service";
import { WorkspaceModule } from "../workspaces/workspace.module";
import { FileRepository } from "./repositories/file.repository";
import { RedisModule } from "src/common/modules/redis/redis.module";


@Module({
    imports: [TypeOrmModule.forFeature([FileEntity]), WorkspaceModule, RedisModule],
    providers: [
        CloudinaryProvider,
        {
            provide: FileStorageService,
            useClass: CloudinaryStorageService,
        },
        FileService,
        FileValidationService,
        FileRepository,
    ],
    controllers: [FileController],
})
export class FileModule { }
