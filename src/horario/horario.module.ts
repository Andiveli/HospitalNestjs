import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaAtencionEntity } from './dia-atencion.entity';
import { ExcepcionHorarioEntity } from './excepcion-horario.entity';
import { HorarioMedicoEntity } from './horario-medico.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DiaAtencionEntity,
            HorarioMedicoEntity,
            ExcepcionHorarioEntity,
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [
        TypeOrmModule.forFeature([
            DiaAtencionEntity,
            HorarioMedicoEntity,
            ExcepcionHorarioEntity,
        ]),
    ],
})
export class HorarioModule {}
