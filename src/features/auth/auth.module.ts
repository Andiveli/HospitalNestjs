import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoUsuarioEntity } from '../estado-vida/estado-vida.entity';
import { GeneroEntity } from '../generos/generos.entity';
import { PeopleEntity } from '../people/people.entity';
import { PerfilesModule } from '../perfiles/perfiles.module';
import { RolesEntity } from '../roles/roles.entity';
import { RolesGuard } from '../roles/roles.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailModule } from 'src/core/messaging/email/email.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'email',
        }),
        ConfigModule.forRoot(),
        EmailModule,
        PerfilesModule,
        TypeOrmModule.forFeature([PeopleEntity]),
        TypeOrmModule.forFeature([GeneroEntity]),
        TypeOrmModule.forFeature([EstadoUsuarioEntity]),
        TypeOrmModule.forFeature([RolesEntity]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                global: true,
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: '24h',
                },
            }),
        }),
        PassportModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        LocalStrategy,
        JwtStrategy,
    ],
})
export class AuthModule {}
