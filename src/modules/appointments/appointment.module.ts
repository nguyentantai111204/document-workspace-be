import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { AppointmentParticipant } from "./entities/appointment-participant.entity";
import { AppointmentReminder } from "./entities/appointment-reminder.entity";
import { AppointmentController } from "./controllers/appointment.controller";
import { AppointmentService } from "./services/appointment.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Appointment,
            AppointmentParticipant,
            AppointmentReminder,
        ])
    ],
    controllers: [AppointmentController],
    providers: [AppointmentService],
    exports: [],
})
export class AppointmentModule { }