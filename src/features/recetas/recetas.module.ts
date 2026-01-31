import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetasController } from './recetas.controller';
import { RecetasService } from './recetas.service';
import { RecetaMedicaEntity } from './entities/receta-medica.entity';
import { RecetaMedicamentoEntity } from './entities/receta-medicamento.entity';
import { MedicamentoEntity } from './entities/medicamento.entity';
import { PresentacionMedicamentoEntity } from './entities/presentacion-medicamento.entity';
import { ViaAdministracionEntity } from './entities/via-administracion.entity';
import { UnidadMedidaEntity } from './entities/unidad-medida.entity';
import { RecetaMedicaRepository } from './repositories/receta-medica.repository';
import { MedicamentoRepository } from './repositories/medicamento.repository';
import { RegistroAtencionEntity } from '../citas/entities/registro-atencion.entity';
import { MedicoEntity } from '../medicos/medicos.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            RecetaMedicaEntity,
            RecetaMedicamentoEntity,
            MedicamentoEntity,
            PresentacionMedicamentoEntity,
            ViaAdministracionEntity,
            UnidadMedidaEntity,
            RegistroAtencionEntity,
            MedicoEntity,
        ]),
    ],
    controllers: [RecetasController],
    providers: [RecetasService, RecetaMedicaRepository, MedicamentoRepository],
    exports: [RecetasService, RecetaMedicaRepository, MedicamentoRepository],
})
export class RecetasModule {}
