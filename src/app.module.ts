import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { CitasModule } from './citas/citas.module';
import { EmailModule } from './email/email.module';
import { EnfermedadesModule } from './enfermedades/enfermedades.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { PeopleModule } from './people/people.module';
import { TipoEnfermedadModule } from './tipo-enfermedad/tipo-enfermedad.module';
import { RolesModule } from './roles/roles.module';
import { GenerosModule } from './generos/generos.module';
import { EstadoVidaModule } from './estado-vida/estado-vida.module';
import { PaisesModule } from './paises/paises.module';
import { SangreModule } from './sangre/sangre.module';
import { EstiloVidaModule } from './estilo-vida/estilo-vida.module';
import { PermisosModule } from './permisos/permisos.module';
import { BullModule } from '@nestjs/bull';

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379,
            },
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env`,
            validationSchema: Joi.object({
                JWT_SECRET: Joi.string().required(),
                EMAIL_HOST: Joi.string().required(),
                EMAIL_PORT: Joi.number().required(),
                EMAIL_USER: Joi.string().required(),
                EMAIL_PASS: Joi.string().required(),
                FRONTEND_URL: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                type: configService.get<any>('DB_TYPE'),
                host: configService.get<string>('DB_HOST'),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASS'),
                database: configService.get<string>('DB_NAME'),
                port: configService.get<number>('DB_PORT'),
                autoLoadEntities: true,
                // synchronize: true,
                retryDelay: 3000,
            }),
        }),
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
    ],
})
export class AppModule {}
