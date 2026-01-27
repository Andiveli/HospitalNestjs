import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class PaginationDto {
    @ApiProperty({
        description: 'Número de página (empezando desde 1)',
        example: 1,
        minimum: 1,
        default: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'La página debe ser un número entero' })
    @Min(1, { message: 'La página debe ser mayor o igual a 1' })
    page?: number = 1;

    @ApiProperty({
        description: 'Cantidad de registros por página',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El límite debe ser un número entero' })
    @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
    @Max(100, { message: 'El límite no puede ser mayor a 100' })
    limit?: number = 10;
}

export class PaginatedResponseDto<T> {
    @ApiProperty({ description: 'Lista de elementos' })
    data!: T[];

    @ApiProperty({
        description: 'Metadatos de paginación',
        example: {
            total: 50,
            page: 1,
            limit: 10,
            totalPages: 5,
        },
    })
    meta!: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
