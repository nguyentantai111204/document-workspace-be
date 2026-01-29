import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UserDevice } from "../entities/user-device.entity"

@Injectable()
export class UserDeviceRepository {
    constructor(
        @InjectRepository(UserDevice)
        private readonly repo: Repository<UserDevice>,
    ) { }

    async registerDevice(userId: string, token: string, deviceId: string, deviceType?: string) {
        let device = await this.repo.findOne({ where: { userId, deviceId } })

        if (device) {
            device.fcmToken = token
            device.lastActiveAt = new Date()
            if (deviceType) device.deviceType = deviceType
        } else {
            device = this.repo.create({
                userId,
                deviceId,
                fcmToken: token,
                deviceType,
            })
        }

        return this.repo.save(device)
    }

    async getTokensByUser(userId: string): Promise<string[]> {
        const devices = await this.repo.find({ where: { userId } })
        return devices.map(d => d.fcmToken)
    }

    async removeToken(token: string) {
        return this.repo.delete({ fcmToken: token })
    }
}
