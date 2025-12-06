import { Module } from '@nestjs/common';
import { EnfermedadesController } from './enfermedades.controller';
import { EnfermedadesService } from './enfermedades.service';

@Module({
    controllers: [EnfermedadesController],
    providers: [EnfermedadesService],
})
export class EnfermedadesModule {}
