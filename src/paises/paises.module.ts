import { Module } from '@nestjs/common';
import { PaisEntity } from './paises.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([PaisEntity])],
    exports: [TypeOrmModule],
})
export class PaisesModule {}
