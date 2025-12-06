import { Module } from '@nestjs/common';
import { MedicosController } from './medicos.controller';
import { MedicosService } from './medicos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicoEntity } from './medicos.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MedicoEntity])],
    controllers: [MedicosController],
    providers: [MedicosService],
})
export class MedicosModule {}
