import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoUsuarioEntity } from './estado-vida.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EstadoUsuarioEntity])],
    exports: [TypeOrmModule],
})
export class EstadoVidaModule {}
