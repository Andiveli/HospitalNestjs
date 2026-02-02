import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CitasModule } from '../citas/citas.module';
import { CitaEntity } from '../citas/entities/cita.entity';
import { PeopleModule } from '../people/people.module';
import {
    InvitacionesController,
    VideoRoomsController,
    WebSocketDocsController,
} from './controllers';
import {
    EstadoSesionEntity,
    InvitacionVideollamadaEntity,
    MensajeChatEntity,
    ParticipanteSesionEntity,
    RolSesionEntity,
    SesionConsultaEntity,
    TipoMensajeEntity,
} from './entities';
import { VideoLlamadaGateway } from './gateways';
import { SesionExpiracionJob } from './jobs';
import {
    InvitacionVideollamadaRepository,
    MensajeChatRepository,
    ParticipanteSesionRepository,
    SesionConsultaRepository,
} from './repositories';
import { InvitacionesService, VideollamadaService } from './services';

/**
 * Módulo principal de videollamadas
 *
 * Contiene toda la funcionalidad para:
 * - Sesiones de videollamada
 * - Gestión de participantes (incluidos invitados)
 * - Chat en tiempo real
 * - Señalización WebRTC
 * - Invitaciones con códigos de acceso (sin necesidad de cuenta)
 *
 * Dependencias externas:
 * - TypeORM para persistencia
 * - Socket.io para comunicación en tiempo real
 * - CitaModule para validación de citas
 * - AuthModule para seguridad
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            SesionConsultaEntity,
            ParticipanteSesionEntity,
            MensajeChatEntity,
            EstadoSesionEntity,
            RolSesionEntity,
            TipoMensajeEntity,
            InvitacionVideollamadaEntity,
            CitaEntity,
        ]),
        AuthModule,
        CitasModule,
        PeopleModule,
    ],

    controllers: [
        InvitacionesController,
        VideoRoomsController,
        WebSocketDocsController,
    ],

    providers: [
        // Repositories
        SesionConsultaRepository,
        ParticipanteSesionRepository,
        MensajeChatRepository,
        InvitacionVideollamadaRepository,
        // Services
        VideollamadaService,
        InvitacionesService,
        // Gateway
        VideoLlamadaGateway,
        // Jobs
        SesionExpiracionJob,
    ],

    exports: [
        VideollamadaService,
        InvitacionesService,
        SesionConsultaRepository,
        ParticipanteSesionRepository,
        MensajeChatRepository,
        InvitacionVideollamadaRepository,
        VideoLlamadaGateway,
    ],
})
export class VideollamadasModule {}
