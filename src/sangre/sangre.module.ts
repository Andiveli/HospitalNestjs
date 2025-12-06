import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoSanguineoEntity } from './sangre.entity';

@Module({
    imports: [TypeOrmModule.forFeature([GrupoSanguineoEntity])],
    exports: [TypeOrmModule],
})
export class SangreModule {}
