import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import * as Joi from 'joi';
import { CommonModule } from './common/common.module';
import { EmailModule } from './core/messaging/email/email.module';
import { AuthModule } from './features/auth/auth.module';
import { CitasModule } from './features/citas/citas.module';
import { DocumentsModule } from './features/documents/documents.module';
import { EnfermedadesModule } from './features/enfermedades/enfermedades.module';
import { RecetasModule } from './features/recetas/recetas.module';
import { HistoriasClinicasModule } from './features/historias-clinicas/historias-clinicas.module';
import { EspecialidadModule } from './features/especialidad/especialidad.module';
import { EstadoVidaModule } from './features/estado-vida/estado-vida.module';
import { EstiloVidaModule } from './features/estilo-vida/estilo-vida.module';
import { GenerosModule } from './features/generos/generos.module';
import { HorarioModule } from './features/horario/horario.module';
import { MedicosModule } from './features/medicos/medicos.module';
import { PacienteEnfermedadModule } from './features/paciente-enfermedad/paciente-enfermedad.module';
import { PacientesModule } from './features/pacientes/pacientes.module';
import { PaisesModule } from './features/paises/paises.module';
import { PeopleModule } from './features/people/people.module';
import { PermisosModule } from './features/permisos/permisos.module';
import { RolesModule } from './features/roles/roles.module';
import { SangreModule } from './features/sangre/sangre.module';
import { TipoEnfermedadModule } from './features/tipo-enfermedad/tipo-enfermedad.module';
import { VideollamadasModule } from './features/videollamadas/videollamadas.module';

@Module({
    imports: [
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                ttl: 60 * 1000,
                store: await redisStore({
                    socket: {
                        host:
                            configService.get<string>('REDIS_HOST') ||
                            'localhost',
                        port: configService.get<number>('REDIS_PORT') || 6379,
                    },
                }),
            }),
            inject: [ConfigService],
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                connection: {
                    host:
                        configService.get<string>('REDIS_HOST') || 'localhost',
                    port: configService.get<number>('REDIS_PORT') || 6379,
                },
            }),
            inject: [ConfigService],
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env`,
            validationSchema: Joi.object({
                JWT_SECRET: Joi.string().required(),
                DB_TYPE: Joi.string()
                    .valid('postgres', 'mysql', 'mariadb')
                    .required(),
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.number().required(),
                DB_USER: Joi.string().required(),
                DB_PASS: Joi.string().required(),
                DB_NAME: Joi.string().required(),
                EMAIL_HOST: Joi.string().required(),
                EMAIL_PORT: Joi.number().required(),
                EMAIL_USER: Joi.string().required(),
                EMAIL_PASS: Joi.string().required(),
                FRONTEND_URL: Joi.string().required(),
                REDIS_HOST: Joi.string().optional(),
                REDIS_PORT: Joi.number().optional(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: configService.getOrThrow<
                    'postgres' | 'mysql' | 'mariadb'
                >('DB_TYPE'),
                host: configService.get<string>('DB_HOST'),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASS'),
                database: configService.get<string>('DB_NAME'),
                port: configService.get<number>('DB_PORT'),
                autoLoadEntities: true,
                synchronize: false,
                retryDelay: 3000,
            }),
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        PeopleModule,
        EmailModule,
        CitasModule,
        PacientesModule,
        EnfermedadesModule,
        TipoEnfermedadModule,
        RolesModule,
        GenerosModule,
        EstadoVidaModule,
        PaisesModule,
        SangreModule,
        EstiloVidaModule,
        PermisosModule,
        MedicosModule,
        PacienteEnfermedadModule,
        DocumentsModule,
        CommonModule,
        EspecialidadModule,
        HorarioModule,
        VideollamadasModule,
        RecetasModule,
        HistoriasClinicasModule,
    ],
})
export class AppModule {}
