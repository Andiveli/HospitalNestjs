import { Module } from '@nestjs/common';
import { GeneroEntity } from './generos.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([GeneroEntity])],
    exports: [TypeOrmModule],
})
export class GenerosModule {}
