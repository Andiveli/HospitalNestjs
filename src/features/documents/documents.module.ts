import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentsEntity } from './documents.entity';
import { TipoDocumentoEntity } from './tipo-documento.entity';
import { HistoriaClinicaEntity } from '../citas/entities/historia-clinica.entity';
import { S3Service } from 'src/core/storage/s3.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DocumentsEntity,
            TipoDocumentoEntity,
            HistoriaClinicaEntity,
        ]),
    ],
    providers: [DocumentsService, S3Service],
    controllers: [DocumentsController],
    exports: [DocumentsService, S3Service],
})
export class DocumentsModule {}
