# Hospital NestJS - Project Specific Standards

## Available Skills

| Skill Name | Description                                                                          | Documentation                      |
| ---------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| `nestjs`   | NestJS + TypeScript enterprise patterns with strict type safety and SOLID principles | [SKILL.md](skills/nestjs/SKILL.md) |

## Important: Spanish Domain Language

> **This project uses Spanish for domain naming** because the database schema was designed in Spanish.
> This is an intentional decision to maintain consistency with the existing database.
> All code patterns and best practices still apply - only the language of domain terms differs.

## 1. Project Structure

```
src/
├─ main.ts
├─ app.module.ts
│
├─ features/                 # Feature modules (dominio)
│  ├─ auth/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ dto/
│  │  ├─ entities/
│  │  ├─ repositories/
│  │  ├─ guards/
│  │  ├─ strategies/
│  │  ├─ auth.module.ts
│  │  └─ auth.controller.spec.ts
│  │
│  ├─ citas/                 # Appointments
│  │  ├─ dto/
│  │  ├─ entities/
│  │  ├─ repositories/
│  │  ├─ citas.controller.ts
│  │  ├─ citas.service.ts
│  │  ├─ citas.module.ts
│  │  └─ citas.service.spec.ts
│  │
│  ├─ pacientes/             # Patients
│  ├─ medicos/               # Doctors
│  ├─ especialidad/          # Specialties
│  ├─ horario/               # Schedules
│  └─ [other-modules]/
│
├─ core/                     # Core infrastructure
│  ├─ database/
│  │  ├─ typeorm/
│  │  │  ├─ migrations/
│  │  │  └─ data-source.ts
│  │  ├─ database.module.ts
│  │  └─ database.service.ts
│  │
│  ├─ messaging/
│  │  └─ email/
│  │     ├─ email.module.ts
│  │     ├─ email.service.ts
│  │     ├─ email.processor.ts
│  │     └─ templates/
│  │
│  ├─ storage/
│  │  └─ s3.service.ts
│  │
│  └─ core.module.ts
│
├─ shared/                   # Shared utilities (negocio reutilizable)
│  ├─ dto/
│  ├─ enums/
│  ├─ interfaces/
│  ├─ constants/
│  └─ services/
│
├─ common/                   # Common components (technical cross-cutting)
│  ├─ decorators/
│  ├─ guards/
│  ├─ interceptors/
│  ├─ filters/
│  ├─ pipes/
│  └─ middleware/
│
├─ config/                   # Configuration
│  ├─ configuration.ts
│  ├─ env.schema.ts
│  ├─ database.config.ts
│  └─ app.config.ts
│
└─ app.controller.spec.ts    # Tests alongside source
```

### Module Organization Rules

- **Feature modules** en `src/features/[module-name]/`
- **Core infrastructure** en `src/core/`
- **Shared utilities** en `src/shared/`
- **Configuration** en `src/config/`
- **Common components** en `src/common/`
- **Test files** alongside source (`.spec.ts`)

## 2. File Naming Conventions

### TypeScript Files (Spanish Domain Names)

**Controllers**: `[modulo].controller.ts`

- Examples: `citas.controller.ts`, `pacientes.controller.ts`, `medicos.controller.ts`

**Services**: `[modulo].service.ts`

- Examples: `citas.service.ts`, `pacientes.service.ts`, `medicos.service.ts`

**Modules**: `[modulo].module.ts`

- Examples: `citas.module.ts`, `pacientes.module.ts`, `medicos.module.ts`

**DTOs**: `[accion]-[entidad].dto.ts`

- Examples: `create-cita.dto.ts`, `update-paciente.dto.ts`, `medico-response.dto.ts`

**Entities**: `[entidad].entity.ts` (singular preferred, plural accepted for legacy)

- Examples: `cita.entity.ts`, `paciente.entity.ts`, `medico.entity.ts`
- Legacy files: `pacientes.entity.ts`, `medicos.entity.ts` are acceptable (pre-existing)

**Repositories**: `[entidad].repository.ts`

- Examples: `cita.repository.ts`, `paciente.repository.ts`, `medico.repository.ts`

**Tests**: `[filename].spec.ts`

- Examples: `citas.service.spec.ts`, `pacientes.controller.spec.ts`

### Directory Names

- **kebab-case** for module directories: `estado-vida`, `estilo-vida`, `tipo-enfermedad`
- **plural** for entity collections: `citas`, `pacientes`, `medicos`

## 3. Business Domain Structure

### Domain Language Mapping (Spanish → English)

| Spanish            | English           | Description                 |
| ------------------ | ----------------- | --------------------------- |
| `Cita`             | Appointment       | Medical appointments        |
| `Paciente`         | Patient           | Patient information         |
| `Medico`           | Doctor            | Doctor profiles             |
| `Especialidad`     | Specialty         | Medical specialties         |
| `Horario`          | Schedule          | Doctor schedules            |
| `HistoriaClinica`  | MedicalRecord     | Patient medical history     |
| `RegistroAtencion` | AttentionRecord   | Appointment diagnosis/notes |
| `EstadoCita`       | AppointmentStatus | Appointment states          |
| `Enfermedad`       | Disease           | Diseases/conditions         |
| `Persona`          | Person            | Base person entity          |
| `Rol`              | Role              | User roles                  |
| `Permiso`          | Permission        | Granular permissions        |

### Core Entities

**Gestión de Usuarios:**

- `Persona` - Base person entity
- `Rol` - User roles (admin, medico, paciente)
- `Permiso` - Granular permissions

**Dominio Médico:**

- `Paciente` - Patient information and medical history
- `Medico` - Doctor profiles and specializations
- `Cita` - Medical appointments and scheduling
- `HistoriaClinica` - Patient medical records
- `RegistroAtencion` - Appointment diagnosis and notes
- `Especialidad` - Medical specialties

**Gestión Hospitalaria:**

- `Horario` - Doctor schedules and availability
- `DiaAtencion` - Days of attention
- `ExcepcionHorario` - Schedule exceptions

## 4. Response Format Standards

### Success Response Structure

```typescript
// Single resource response
{
  message: "Operación completada exitosamente",
  data: Cita | Paciente | Medico
}

// Collection response (paginated)
{
  message: "Recursos obtenidos exitosamente",
  data: Cita[] | Paciente[] | Medico[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}

// Create response
{
  message: "Recurso creado exitosamente",
  data: Cita | Paciente | Medico
}

// Update response
{
  message: "Recurso actualizado exitosamente",
  data: Cita | Paciente | Medico
}

// Delete response (soft delete)
{
  message: "Recurso eliminado exitosamente"
}
```

### Error Response Structure

```typescript
{
  statusCode: 400 | 401 | 403 | 404 | 409 | 500,
  message: "Mensaje de error legible",
  error: "Bad Request" | "Unauthorized" | "Forbidden" | "Not Found" | "Conflict"
}
```

## 5. Database Naming Conventions

> **IMPORTANT**: This database uses Spanish naming conventions.
> Do NOT change column/table names - they must match the existing schema.

### Table Names

- **snake_case** y plural: `citas`, `pacientes`, `medicos`, `estados_cita`
- **Relational tables**: `medico_especialidad`, `paciente_enfermedad`

### Column Names

- **snake_case**: `nombre`, `apellido`, `fecha_nacimiento`
- **Foreign keys**: `[tabla]_id`: `paciente_id`, `medico_id`, `estado_id`
- **Timestamps**: Use existing column names from database:
    - `fecha_hora_creacion` - Creation timestamp
    - `fecha_hora_inicio` - Start datetime
    - `fecha_hora_fin` - End datetime

### TypeORM Entity Rules

```typescript
// CORRECT: Match database column names exactly
@Column({ name: 'fecha_hora_creacion' })
fechaHoraCreacion: Date;

// CORRECT: Use camelCase in TypeORM queries
.where('cita.medicoId = :medicoId')  // TypeORM relation property

// WRONG: Don't use snake_case in TypeORM queries
.where('cita.medico_id = :medicoId')  // This won't work!
```

### Primary Keys

- **Integer auto-increment**: `id` for most tables
- **Composite keys**: Some tables use `usuario_id` as PK (e.g., `medicos`, `pacientes`)

## 6. Environment Configuration

### Required Environment Variables

```bash
# Database (REQUIRED)
DB_TYPE=postgres|mysql|mariadb
DB_HOST=localhost
DB_PORT=3306
DB_USER=hospital_user
DB_PASS=hospital_password
DB_NAME=hospital_db

# Authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key

# Email (REQUIRED)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hospital@example.com
EMAIL_PASS=email-password
FRONTEND_URL=http://localhost:3000

# Redis (OPTIONAL - for cache and queues)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Configuration Usage

```typescript
// CORRECT: Use ConfigService for all config values
type: configService.get<'postgres' | 'mysql' | 'mariadb'>('DB_TYPE'),

// WRONG: Hardcoded values
type: 'mariadb',  // Never hardcode!
```

## 7. Business Rules (Citas Module)

### Appointment Creation

- Validate doctor exists
- Validate future date
- Check for scheduling conflicts (same doctor, overlapping time)
- Auto-calculate `fechaHoraFin` (+30 minutes)
- Initial status: `pendiente`

### Appointment Update

- Only `pendiente` status appointments
- **72-hour rule**: Only if 72+ hours before appointment
- Cannot change doctor (medicoId)
- Re-validate scheduling conflicts

### Appointment Cancellation (Soft Delete)

- Only `pendiente` status appointments
- **72-hour rule**: Only if 72+ hours before appointment
- Changes status to `cancelada` (does not delete record)

## 8. Testing Strategy

### Test Structure

```
src/features/citas/
├── citas.controller.ts
├── citas.controller.spec.ts    # Controller tests
├── citas.service.ts
├── citas.service.spec.ts       # Service unit tests
├── repositories/
│   ├── cita.repository.ts
│   └── cita.repository.spec.ts # Repository tests
└── citas.module.ts
```

### Test Categories

**Unit Tests:**

- Services: Business logic, validation, error handling
- Repositories: Data access, query building
- Utilities: Helper functions, transformers

**Integration Tests:**

- Controllers: HTTP layer with mocked services
- Modules: Dependency injection, provider configuration

**E2E Tests:**

- Complete flows: Patient registration, appointment booking
- Authentication: Login, logout, token refresh

## 9. Code Review Checklist

### Architecture & Structure

- [ ] Feature follows `src/features/[module]/` structure
- [ ] Files follow Spanish naming conventions consistently
- [ ] Proper separation: Controller → Service → Repository
- [ ] No `any` types - use proper TypeScript types
- [ ] DTOs use class-validator decorators

### Business Logic

- [ ] Medical validation rules implemented correctly
- [ ] Appointment scheduling prevents conflicts
- [ ] 72-hour rule enforced for updates/cancellations
- [ ] Soft deletes used (no hard deletes on medical data)

### Security

- [ ] JWT authentication on all medical endpoints
- [ ] Role-based access control where needed
- [ ] No sensitive data in logs (passwords, tokens)
- [ ] Input validation on all DTOs

### Database

- [ ] Entity column names match database schema exactly
- [ ] Use camelCase for TypeORM relation queries
- [ ] Proper indexes on foreign keys
- [ ] Transactions for multi-table operations

---

**Project Mantra**: "El software médico requiere precisión absoluta y seguridad. Cada línea de código impacta el cuidado del paciente."
