import { Module } from '@nestjs/common';
import { PaisEntity } from './paises.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaisesController } from './paises.controller';
import { PaisesService } from './paises.service';

@Module({
    imports: [TypeOrmModule.forFeature([PaisEntity])],
    exports: [TypeOrmModule],
    controllers: [PaisesController],
    providers: [PaisesService],
})
export class PaisesModule {}
