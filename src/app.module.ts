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
import { DerivacionesModule } from './features/derivaciones/derivaciones.module';
import { DocumentsModule } from './features/documents/documents.module';
import { EnfermedadesModule } from './features/enfermedades/enfermedades.module';
import { EspecialidadModule } from './features/especialidad/especialidad.module';
import { EstadoVidaModule } from './features/estado-vida/estado-vida.module';
import { EstiloVidaModule } from './features/estilo-vida/estilo-vida.module';
import { GenerosModule } from './features/generos/generos.module';
import { HistoriaClinicaModule } from './features/historia-clinica/historia-clinica.module';
import { HorarioModule } from './features/horario/horario.module';
import { MedicamentosModule } from './features/medicamentos/medicamentos.module';
import { MedicosModule } from './features/medicos/medicos.module';
import { PacienteEnfermedadModule } from './features/paciente-enfermedad/paciente-enfermedad.module';
import { PacientesModule } from './features/pacientes/pacientes.module';
import { PaisesModule } from './features/paises/paises.module';
import { PeopleModule } from './features/people/people.module';
import { PermisosModule } from './features/permisos/permisos.module';
import { RecetasModule } from './features/recetas/recetas.module';
import { RolesModule } from './features/roles/roles.module';
import { SangreModule } from './features/sangre/sangre.module';
import { TipoEnfermedadModule } from './features/tipo-enfermedad/tipo-enfermedad.module';
import { VideollamadasModule } from './features/videollamadas/videollamadas.module';

@Module({
    imports: [
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_URL');
                return {
                    ttl: 60 * 1000,
                    store: await redisStore({
                        url: redisUrl,
                        socket: !redisUrl
                            ? {
                                  host:
                                      configService.get<string>('REDIS_HOST') ||
                                      'localhost',
                                  port:
                                      configService.get<number>('REDIS_PORT') ||
                                      6379,
                              }
                            : undefined,
                    }),
                };
            },
            inject: [ConfigService],
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                connection: configService.get('REDIS_URL')
                    ? { url: configService.get('REDIS_URL') }
                    : { host: 'redis', port: 6379 },
            }),
            inject: [ConfigService],
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env`,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('development', 'production', 'test')
                    .default('development'),
                PORT: Joi.number().default(3000),
                JWT_SECRET: Joi.string().required(),
                // Database: Either DATABASE_URL or individual fields
                DATABASE_URL: Joi.string().optional(),
                DB_TYPE: Joi.string()
                    .valid('postgres', 'mysql', 'mariadb')
                    .default('postgres'),
                DB_HOST: Joi.string().optional(),
                DB_PORT: Joi.number().optional(),
                DB_USER: Joi.string().optional(),
                DB_PASS: Joi.string().optional(),
                DB_NAME: Joi.string().optional(),
                // Email
                EMAIL_HOST: Joi.string().optional(),
                EMAIL_PORT: Joi.number().optional(),
                EMAIL_USER: Joi.string().optional(),
                EMAIL_PASS: Joi.string().optional(),
                // Frontend
                FRONTEND_URL: Joi.string().required(),
                // Redis
                REDIS_HOST: Joi.string().default('localhost'),
                REDIS_PORT: Joi.number().default(6379),
                REDIS_URL: Joi.string().optional(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: configService.getOrThrow<
                    'postgres' | 'mysql' | 'mariadb'
                >('DB_TYPE'),
                url: configService.get<string>('DATABASE_URL'),
                // Force IPv4 to avoid IPv6 issues
                extra: {
                    family: 4,
                },
                autoLoadEntities: true,
                synchronize: false,
                retryDelay: 3000,
                ssl: { rejectUnauthorized: false },
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
        MedicamentosModule,
        DerivacionesModule,
        HistoriaClinicaModule,
    ],
})
export class AppModule {}
