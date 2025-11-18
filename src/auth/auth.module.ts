import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PeopleEntity } from "src/people/people.entity";
import { EmailModule } from "src/email/email.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@Module({
    imports: [
        EmailModule,
        TypeOrmModule.forFeature([PeopleEntity]),
        JwtModule.registerAsync({
            inject: [ ConfigService ],
            useFactory: async (configService: ConfigService) => ({
                global: true,
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: '1h',
                },
            })
        })
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}