import { Module } from '@nestjs/common';
import { TipoEnfermedadController } from './tipo-enfermedad.controller';
import { TipoEnfermedadService } from './tipo-enfermedad.service';
import { TiposEnfermedadEntity } from './tipo-enfermedad.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([TiposEnfermedadEntity])],
    controllers: [TipoEnfermedadController],
    providers: [TipoEnfermedadService],
})
export class TipoEnfermedadModule {}
