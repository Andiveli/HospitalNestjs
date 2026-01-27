import { Module } from '@nestjs/common';
import { PermisosEntity } from './permisos.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([PermisosEntity])],
    exports: [TypeOrmModule],
})
export class PermisosModule {}
