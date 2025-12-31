# Configuración de Documentos con AWS S3

## 📋 Resumen de la Implementación

He creado un módulo completo para manejar documentos con AWS S3:

- **Entidad**: `DocumentsEntity` - Mapea la tabla `documentos_hc` con FKs directas
- **Servicio**: `S3Service` - Maneja todas las operaciones con S3
- **Controlador**: `DocumentsController` - Endpoints REST
- **DTOs**: Validaciones y documentación Swagger

## 🔗 Estructura de Relaciones

La entidad se conecta directamente con tus tablas existentes:

```sql
-- Tabla principal (documentos_hc)
CREATE TABLE documentos_hc (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  url VARCHAR(255) NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  fecha_hora_subida TIMESTAMP NOT NULL,
  tipo_id INT NOT NULL,           -- FK → tipo_documento.id
  historia_id INT NOT NULL,       -- FK → historias_clinicas.paciente_id
  FOREIGN KEY (tipo_id) REFERENCES tipo_documento(id),
  FOREIGN KEY (historia_id) REFERENCES historias_clinicas(paciente_id) ON DELETE CASCADE
);

-- Tablas de referencia existentes
CREATE TABLE historias_clinicas (
  paciente_id INT PRIMARY KEY,
  fecha_hora_apertura TIMESTAMP NOT NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(usuario_id) ON DELETE CASCADE
);

CREATE TABLE tipo_documento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);
```

## 🚀 Endpoints Disponibles

| Método | Endpoint                          | Descripción                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | `/documents/upload`               | Subir documento                |
| GET    | `/documents/historia/:historiaId` | Listar documentos por historia |
| GET    | `/documents/:documentId/download` | Generar URL de descarga        |
| DELETE | `/documents/:documentId`          | Eliminar documento             |

## 🔧 Configuración de AWS S3

### 1. Crear Bucket en AWS S3

1. Ve a [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Crea un nuevo bucket
3. Configura **Block all public access** (más seguro)
4. Mantén la configuración por defecto

### 2. Crear Usuario IAM

1. Ve a [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Crea nuevo usuario → "Programmatic access"
3. Asigna política personalizada:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
            "Resource": "arn:aws:s3:::tu_bucket/*"
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::tu_bucket"
        }
    ]
}
```

### 3. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=tu-nombre-de-bucket
AWS_REGION=us-east-1
```

## 📱 Ejemplo de Uso en Frontend

### Subir Documento

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('titulo', 'Radiografía de tórax');
formData.append('tipoId', '1'); // ID de tipo_documento
formData.append('historiaId', '123'); // ID de historias_clinicas.paciente_id

const response = await fetch('/documents/upload', {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${token}`,
    },
    body: formData,
});

const document = await response.json();
```

### Descargar Documento

```javascript
// 1. Obtener URL firmada
const response = await fetch(`/documents/${documentId}/download`, {
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

const { downloadUrl } = await response.json();

// 2. Descargar archivo
window.open(downloadUrl, '_blank');
```

## 🔒 Consideraciones de Seguridad

### ✅ Ventajas de esta Arquitectura:

- **URLs Firmadas Temporales** - Solo válidas por 1 hora
- **Validación de Archivos** - Solo PDF y imágenes, max 10MB
- **Almacenamiento Seguro** - Bucket privado con IAM
- **Metadata en DB** - Consultas eficientes sin tocar S3

### 🛡️ Medidas de Seguridad Implementadas:

1. **Autenticación JWT** - Todos los endpoints requieren token
2. **Validación de archivos** - Tipos y tamaños permitidos
3. **URLs temporales** - Previenen hotlinking
4. **Rollback en errores** - Si falla S3, no se guarda en DB

## 💰 Costos Estimados (AWS S3)

| Operación      | Costo        | Ejemplo mensual |
| -------------- | ------------ | --------------- |
| Almacenamiento | $0.023/GB    | 100GB = $2.30   |
| Subida (PUT)   | $0.005/1000  | 10,000 = $0.05  |
| Descarga (GET) | $0.0004/1000 | 100,000 = $0.04 |

**Total estimado para uso moderado:** <$10/mes

## 🔄 Flujo Completo

1. **Frontend** → Envia archivo a `/documents/upload`
2. **Backend** → Valida y genera clave S3 única
3. **Backend** → Sube a S3 + guarda metadata en DB
4. **Frontend** → Cuando necesita el archivo:
    - Pide URL a `/documents/:id/download`
    - **Backend** genera URL firmada temporal
    - **Frontend** descarga directo de S3

## 🚨 Notas Importantes

- **Bucket Privado** - No hacer público por seguridad
- **URLs Temporales** - Evita acceso no autorizado
- **Eliminación Cascade** - Si se elimina historia, se eliminan documentos
- **CORS** - Si frontend está en dominio diferente, configurar en S3

¿Necesitas configurar algo específico o probar los endpoints?
