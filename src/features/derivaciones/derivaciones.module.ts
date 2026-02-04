import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DerivacionesController } from './derivaciones.controller';
import { DerivacionesService } from './derivaciones.service';
import {
    DerivacionEntity,
    ServicioReferidoEntity,
    CentroSaludEntity,
} from './entities';
import { MedicoEntity } from '../medicos/medicos.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DerivacionEntity,
            ServicioReferidoEntity,
            CentroSaludEntity,
            MedicoEntity,
        ]),
    ],
    controllers: [DerivacionesController],
    providers: [DerivacionesService],
    exports: [DerivacionesService],
})
export class DerivacionesModule {}
