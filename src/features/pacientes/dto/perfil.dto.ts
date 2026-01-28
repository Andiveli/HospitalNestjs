export interface PerfilPaciente {
    info: {
        id: number;
        cedula: string;
        nombres: string;
        email: string;
        imagen?: string;
        verificado: boolean;
        genero?: {
            id: number;
            nombre: string;
        };
    };
    medico: {
        fechaNacimiento: Date;
        telefono: string;
        pais?: {
            id: number;
            nombre: string;
        };
        sangre?: {
            id: number;
            nombre: string;
        };
        estiloVida?: {
            id: number;
            nombre: string;
        };
        residencia: string;
        edad: number;
    };
    enfermedades: Record<string, string>;
}
