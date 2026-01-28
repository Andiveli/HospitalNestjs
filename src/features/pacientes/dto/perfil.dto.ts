export interface PerfilPaciente {
    nombres: string;
    edad: number;
    email: string;
    cedula: string;
    telefono: string;
    pais: string;
    genero: string;
    residencia: string;
    sangre: string;
    estilo: string;
    imagen?: string;
    enfermedades: Record<string, string>;
}
