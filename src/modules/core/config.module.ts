import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import coreConfig from "./core.config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [coreConfig],
        }),
    ],
})
export class AppConfigModule { }
