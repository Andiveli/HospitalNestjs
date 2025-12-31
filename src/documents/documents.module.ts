import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentsEntity } from './documents.entity';
import { S3Service } from './s3.service';
import { HistoriaClinicaEntity } from 'src/citas/historia-clinica.entity';
import { TipoDocumentoEntity } from './tipo-documento.entity';

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
