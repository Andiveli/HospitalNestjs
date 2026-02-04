/**
 * Interface que define la estructura base de un tipo de enfermedad
 */
export interface TipoEnfermedad {
    id: number;
    nombre: string;
}

/**
 * Interface para crear un tipo de enfermedad (sin ID)
 */
export interface CreateTipoEnfermedad {
    nombre: string;
}
