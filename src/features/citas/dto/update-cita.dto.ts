import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar una cita existente
 *
 * Reglas de negocio:
 * - Solo se puede modificar la fecha/hora y si es telefónica
 * - NO se puede cambiar el médico asignado
 * - Solo citas con estado "pendiente"
 * - Solo si faltan 72+ horas para la cita
 * - La fecha/hora de fin se calcula automáticamente (+30 minutos)
 */
export class UpdateCitaDto {
    @ApiProperty({
        description: 'Nueva fecha y hora de inicio de la cita (ISO 8601)',
        example: '2024-02-15T14:30:00Z',
        required: true,
    })
    @IsDateString({}, { message: 'La fecha debe estar en formato ISO 8601' })
    fechaHoraInicio?: string;

    @ApiProperty({
        description: 'Indica si la cita será telefónica',
        example: false,
        required: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'El campo telefónica debe ser un valor booleano' })
    telefonica?: boolean;
}
