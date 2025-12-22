import { DocumentBuilder } from '@nestjs/swagger';

export function createSwaggerConfig() {
    const builder = new DocumentBuilder()
        .setTitle('🏥 Hospital API')
        .setDescription(
            `
    ## Sistema de Gestión Hospitalaria
    
    API RESTful para la gestión completa de un sistema hospitalario moderna.
    
    ### 🚀 Características Principales
    - **Gestión de Pacientes**: Registro completo con datos médicos
    - **Gestión de Médicos**: Perfiles y especialidades
    - **Sistema de Citas**: Agendamiento y gestión
    - **Historial Médico**: Relaciones paciente-enfermedad
    - **Autenticación JWT**: Seguridad y autorización por roles
    
    ### 📚 Cómo Usar
    1. Autentícate con \`/auth/login\`
    2. Copia el token de autorización
    3. Haz clic en el botón **Authorize** arriba
    4. Pega tu token en formato: \`Bearer YOUR_TOKEN\`
    5. ¡Listo para usar la API!
    
    ### 🔐 Seguridad
    - Todas las endpoints protegidas requieren token JWT válido
    - Los roles determinan el acceso a recursos específicos
    - Los tokens expiran según configuración del sistema
    `,
        )
        .setVersion('2.0.0')
        .setContact(
            'Hospital Development Team',
            'https://hospital-api.com',
            'dev@hospital-api.com',
        )
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Token de autenticación JWT',
            name: 'Authorization',
            in: 'header',
        })
        .addServer('http://localhost:3000', 'Servidor de desarrollo')
        .addServer('https://api.hospital.com', 'Servidor de producción');

    return builder.build();
}
