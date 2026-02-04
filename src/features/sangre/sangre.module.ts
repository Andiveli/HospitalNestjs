import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoSanguineoEntity } from './sangre.entity';
import { SangreController } from './sangre.controller';
import { SangreService } from './sangre.service';

@Module({
    imports: [TypeOrmModule.forFeature([GrupoSanguineoEntity])],
    controllers: [SangreController],
    providers: [SangreService],
    exports: [SangreService],
})
export class SangreModule {}
