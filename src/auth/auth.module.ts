import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { EstadoUsuarioEntity } from 'src/estado-vida/estado-vida.entity';
import { GeneroEntity } from 'src/generos/generos.entity';
import { PeopleEntity } from 'src/people/people.entity';
import { RolesEntity } from 'src/roles/roles.entity';
import { RolesGuard } from 'src/roles/roles.guard';
import { PerfilesModule } from 'src/perfiles/perfiles.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

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
