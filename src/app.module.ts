import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PeopleModule } from './people/people.module';
import { EmailModule } from './email/email.module';
import { CitasModule } from './citas/citas.module';
import * as Joi from 'joi';

@Module({
    imports: [
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
                synchronize: true,
                retryDelay: 3000,
            }),
        }),
        AuthModule,
        PeopleModule,
        EmailModule,
        CitasModule,
    ],
})
export class AppModule {}
