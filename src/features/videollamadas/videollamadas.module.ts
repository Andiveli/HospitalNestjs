import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
    SesionConsultaEntity,
    ParticipanteSesionEntity,
    MensajeChatEntity,
    EstadoSesionEntity,
    RolSesionEntity,
    TipoMensajeEntity,
} from './entities';
import { CitaEntity } from '../citas/entities/cita.entity';

// Repositories
import {
    SesionConsultaRepository,
    ParticipanteSesionRepository,
    MensajeChatRepository,
} from './repositories';

// Services
import { VideollamadaService, InvitacionesService } from './services';

// Controllers
import { InvitacionesController } from './controllers';

// Gateways
import { VideoLlamadaGateway } from './gateways';

// Other modules dependencies
import { AuthModule } from '../auth/auth.module';
import { CitasModule } from '../citas/citas.module';
import { PeopleModule } from '../people/people.module';

/**
 * Módulo principal de videollamadas
 *
 * Contiene toda la funcionalidad para:
 * - Sesiones de videollamada
 * - Gestión de participantes (incluidos invitados)
 * - Chat en tiempo real
 * - Señalización WebRTC
 * - Invitaciones con tokens JWT
 *
 * Dependencias externas:
 * - TypeORM para persistencia
 * - Socket.io para comunicación en tiempo real
 * - JWT para tokens de invitación
 * - CitaModule para validación de citas
 * - AuthModule para seguridad
 */
@Module({
    imports: [
        // TypeORM entities para este módulo
        TypeOrmModule.forFeature([
            SesionConsultaEntity,
            ParticipanteSesionEntity,
            MensajeChatEntity,
            EstadoSesionEntity,
            RolSesionEntity,
            TipoMensajeEntity,
            CitaEntity, // Necesitamos validar citas
        ]),

        // Módulos externos
        AuthModule,
        CitasModule,
        PeopleModule,
    ],

    controllers: [InvitacionesController],

    providers: [
        // Repositories
        SesionConsultaRepository,
        ParticipanteSesionRepository,
        MensajeChatRepository,

        // Services
        VideollamadaService,
        InvitacionesService,

        // Gateways
        VideoLlamadaGateway,
    ],

    exports: [
        // Exportar services para que otros módulos puedan usarlos
        VideollamadaService,
        InvitacionesService,

        // Exportar repositories para testing o módulos internos
        SesionConsultaRepository,
        ParticipanteSesionRepository,
        MensajeChatRepository,

        // Exportar gateway si se necesita desde otro lado
        VideoLlamadaGateway,
    ],
})
export class VideollamadasModule {}
