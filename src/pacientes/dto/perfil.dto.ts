// import { ApiProperty } from '@nestjs/swagger';
//
// export class PerfilPacienteEnfermedadDto {
//     @ApiProperty({ description: 'ID de la enfermedad' })
//     id: number;
//
//     @ApiProperty({ description: 'Nombre de la enfermedad' })
//     nombre: string;
//
//     @ApiProperty({ description: 'Tipo de enfermedad (formateado)' })
//     tipo: string;
//
//     @ApiProperty({
//         description: 'Detalles adicionales de la enfermedad',
//         required: false,
//     })
//     detalle?: string;
// }
//
// export class PerfilPacienteDto {
//     @ApiProperty({ description: 'ID del paciente' })
//     id: number;
//
//     @ApiProperty({ description: 'Fecha de nacimiento del paciente' })
//     fechaNacimiento: Date;
//
//     @ApiProperty({ description: 'Lugar de residencia', required: false })
//     lugarResidencia?: string;
//
//     @ApiProperty({ description: 'Número de celular', required: false })
//     numeroCelular?: string;
//
//     @ApiProperty({ description: 'Información del grupo sanguíneo' })
//     grupoSanguineo: {
//         id: number;
//         tipo: string;
//         factor: string;
//     };
//
//     @ApiProperty({ description: 'Información del estilo de vida' })
//     estiloVida: {
//         id: number;
//         nombre: string;
//     };
//
//     @ApiProperty({
//         description: 'Información del país',
//         type: 'object',
//     })
//     pais: {
//         id: number;
//         nombre: string;
//         codigo: string;
//     };
//
//     @ApiProperty({
//         description: 'Enfermedades del paciente con tipo combinado',
//         type: [PerfilPacienteEnfermedadDto],
//     })
//     enfermedades: PerfilPacienteEnfermedadDto[];
// }
