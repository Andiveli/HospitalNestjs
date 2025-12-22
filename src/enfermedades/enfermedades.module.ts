import { Module } from '@nestjs/common';
import { EnfermedadesController } from './enfermedades.controller';
import { EnfermedadesService } from './enfermedades.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnfermedadesEntity } from './enfermedades.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EnfermedadesEntity])],
    controllers: [EnfermedadesController],
    providers: [EnfermedadesService],
})
export class EnfermedadesModule {}
