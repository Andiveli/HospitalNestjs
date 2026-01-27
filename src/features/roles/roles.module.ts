import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './roles.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RolesEntity])],
    exports: [TypeOrmModule],
})
export class RolesModule {}
