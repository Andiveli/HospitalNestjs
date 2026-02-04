import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicamentosController } from './medicamentos.controller';
import { MedicamentosService } from './medicamentos.service';
import { MedicamentosRepository } from './repositories/medicamentos.repository';
import { MedicamentoEntity } from './entities/medicamento.entity';
import { PresentacionMedicamentoEntity } from './entities/presentacion-medicamento.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedicamentoEntity,
            PresentacionMedicamentoEntity,
        ]),
    ],
    controllers: [MedicamentosController],
    providers: [MedicamentosService, MedicamentosRepository],
    exports: [MedicamentosService, MedicamentosRepository],
})
export class MedicamentosModule {}
