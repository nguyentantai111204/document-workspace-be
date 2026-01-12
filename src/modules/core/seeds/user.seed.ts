import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'src/modules/users/entities/user.entity'
import { Role } from 'src/modules/permission/entities/role.entity'
import { UserRole } from 'src/modules/permission/entities/user-role.entity'
import { UserStatus } from 'src/modules/users/enums/user-status.enum'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserSeed {
    private readonly logger = new Logger(UserSeed.name)

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,

        @InjectRepository(UserRole)
        private readonly userRoleRepo: Repository<UserRole>,
    ) { }

    async run(): Promise<void> {
        const queryRunner = this.userRepo.manager.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
            const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123'
            const adminName = process.env.ADMIN_NAME || 'System Administrator'

            const existingAdmin = await queryRunner.manager.findOne(User, {
                where: { email: adminEmail },
            })

            if (existingAdmin) {
                this.logger.log('Admin account already exists')
                return
            }

            const saltRounds = 10
            const passwordHash = await bcrypt.hash(adminPassword, saltRounds)

            const adminUser = await queryRunner.manager.save(
                this.userRepo.create({
                    email: adminEmail,
                    password: passwordHash,
                    fullName: adminName,
                    status: UserStatus.ACTIVE

                }),
            )

            const adminRole = await queryRunner.manager.findOne(Role, {
                where: { code: 'ADMIN' },
            })

            if (!adminRole) {
                throw new Error('ADMIN role does not exist. Please run role seed first.')
            }

            await queryRunner.manager.save(
                this.userRoleRepo.create({
                    userId: adminUser.id,
                    roleId: adminRole.id,
                    createdAt: new Date(),
                }),
            )

            await queryRunner.commitTransaction()
            this.logger.log('User seed completed successfully')
        } catch (error) {
            await queryRunner.rollbackTransaction()
            this.logger.error('Error seeding user:', error)
            throw error
        } finally {
            await queryRunner.release()
        }
    }
}