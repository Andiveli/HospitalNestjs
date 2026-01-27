import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacienteEnfermedadController } from './paciente-enfermedad.controller';
import { PacienteEnfermedadService } from './paciente-enfermedad.service';
import { PacienteEnfermedadEntity } from './paciente-enfermedad.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PacienteEnfermedadEntity])],
    controllers: [PacienteEnfermedadController],
    providers: [PacienteEnfermedadService],
    exports: [PacienteEnfermedadService],
})
export class PacienteEnfermedadModule {}
