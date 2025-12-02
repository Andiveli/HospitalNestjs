import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstiloVidaEntity } from './estilo-vida.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EstiloVidaEntity])],
    exports: [TypeOrmModule],
})
export class EstiloVidaModule {}
