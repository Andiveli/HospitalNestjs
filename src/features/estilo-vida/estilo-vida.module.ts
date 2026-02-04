import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstiloVidaEntity } from './estilo-vida.entity';
import { EstiloVidaController } from './estilo-vida.controller';
import { EstiloVidaService } from './estilo-vida.service';

@Module({
    imports: [TypeOrmModule.forFeature([EstiloVidaEntity])],
    controllers: [EstiloVidaController],
    providers: [EstiloVidaService],
    exports: [EstiloVidaService],
})
export class EstiloVidaModule {}
