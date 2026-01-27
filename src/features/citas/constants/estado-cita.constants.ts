/**
 * Constantes para estados de cita médica
 * Estos valores DEBEN coincidir exactamente con los registros en la tabla estados_cita
 * En la BD están guardados como: 'Pendiente', 'Atendida', 'Cancelada' (Title Case)
 */
export const EstadoCita = {
    PENDIENTE: 'Pendiente',
    ATENDIDA: 'Atendida',
    CANCELADA: 'Cancelada',
} as const;

export type EstadoCitaType = (typeof EstadoCita)[keyof typeof EstadoCita];

/**
 * Constantes de negocio para citas
 */
export const CITA_DURACION_MINUTOS = 30;
export const CITA_HORAS_MINIMAS_MODIFICACION = 72;
