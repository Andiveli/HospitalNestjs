import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DocsDto {
    @ApiProperty({
        description: 'Título descriptivo del documento médico',
        example: 'Análisis de sangre - Hemograma completo',
        minLength: 5,
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty({ message: 'El ID del paciente es requerido' })
    titulo!: string;

    @ApiProperty({
        description: 'URL del documento o contenido del archivo',
        example:
            'https://s3.amazonaws.com/hospital/docs/hemograma_juan_perez_2024_01_15.pdf',
        format: 'uri',
        pattern: '^https?://.+\\.(pdf|jpg|jpeg|png|dicom)$',
    })
    @IsString()
    @IsNotEmpty({ message: 'La descripcion del documento es requerida' })
    documento!: string;
}
