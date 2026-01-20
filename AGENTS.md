# Hospital NestJS - Project Specific Standards

## Available Skills

| Skill Name  | Description                                                                          | Documentation                      |
| ----------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| `AGENTS.md` | NestJS + TypeScript enterprise patterns with strict type safety and SOLID principles | [SKILL.md](skills/nestjs/SKILL.md) |

## 1. Project Structure (Hospital Specific)

```
src/
├─ main.ts
├─ app.module.ts
├─ config/
│  ├─ env.validation.ts
│  ├─ configuration.ts
│  └─ database.config.ts
│
├─ common/
│  ├─ decorators/
│  ├─ filters/            # exception filters
│  ├─ guards/
│  ├─ interceptors/
│  ├─ pipes/
│  ├─ middleware/
│  ├─ utils/
│  └─ constants/
│
├─ infrastructure/        # dependencias externas
│  ├─ database/
│  │  ├─ prisma/ | typeorm/
│  │  │  ├─ migrations/
│  │  │  └─ repositories/
│  │  └─ database.module.ts
│  ├─ messaging/          # kafka, rabbitmq, sqs
│  ├─ cache/              # redis
│  └─ storage/            # s3, gcs
│
├─ modules/               # dominios del negocio
│  ├─ auth/
│  │  ├─ auth.controller.ts
│  │  ├─ auth.service.ts
│  │  ├─ dto/
│  │  ├─ strategies/
│  │  ├─ guards/
│  │  └─ auth.module.ts
│  │
│  ├─ users/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ dto/
│  │  ├─ entities/
│  │  ├─ repositories/
│  │  └─ users.module.ts
│  │
│  ├─ orders/
│  │  ├─ application/     # casos de uso
│  │  ├─ domain/          # entidades, value objects
│  │  ├─ infrastructure/ # repos concretos
│  │  └─ orders.module.ts
│  │
│  └─ ...
│
├─ shared/                # reutilizable entre módulos
│  ├─ dto/
│  ├─ enums/
│  ├─ interfaces/
│  └─ services/
│
├─ jobs/                  # cron, workers
│  └─ cleanup.job.ts
│
├─ events/
│  ├─ listeners/
│  └─ emitters/
│
└─ test/
   ├─ unit/
   └─ e2e/
```

### Module Organization Rules

- **Feature modules** en `src/features/[module-name]/`
- **Core infrastructure** en `src/core/`
- **Shared utilities** en `src/shared/`
- **Configuration** en `src/config/`
- **Common components** en `src/common/`
- **Test files** al lado del source (`.spec.ts`)

## 2. File Naming Conventions (Project Specific)

### TypeScript Files

**Controllers**: `[module-name].controller.ts`

- Examples: `user.controller.ts`, `patient.controller.ts`, `doctor.controller.ts`

**Services**: `[module-name].service.ts`

- Examples: `user.service.ts`, `patient.service.ts`, `doctor.service.ts`

**Modules**: `[module-name].module.ts`

- Examples: `user.module.ts`, `patient.module.ts`, `doctor.module.ts`

**DTOs**: `[action]-[entity].dto.ts`

- Examples: `create-user.dto.ts`, `update-patient.dto.ts`, `doctor-response.dto.ts`

**Entities**: `[entity].entity.ts`

- Examples: `user.entity.ts`, `patient.entity.ts`, `doctor.entity.ts`

**Repositories**: `[entity].repository.ts`

- Examples: `user.repository.ts`, `patient.repository.ts`, `doctor.repository.ts`

**Tests**: `[filename].spec.ts`

- Examples: `user.service.spec.ts`, `patient.controller.spec.ts`

### Directory Names

- **kebab-case** para directorios de módulos: `user-management`, `medical-records`
- **plural** para nombres de entidades que representan colecciones: `users`, `patients`, `doctors`

## 3. Business Domain Structure (Hospital Specific)

### Core Entities

**User Management:**

- `User` - Base user entity with authentication
- `Role` - User roles (admin, doctor, nurse, patient)
- `Permission` - Granular permissions

**Medical Domain:**

- `Patient` - Patient information and medical history
- `Doctor` - Doctor profiles and specializations
- `Appointment` - Medical appointments and scheduling
- `MedicalRecord` - Patient medical records
- `Prescription` - Medical prescriptions

**Hospital Management:**

- `Department` - Hospital departments
- `Room` - Hospital rooms and beds
- `Schedule` - Doctor schedules and availability

## 4. Response Format Standards (Project Specific)

### Success Response Structure

```typescript
// Single resource response
{
  message: "Operation completed successfully",
  data: User | Patient | Doctor
}

// Collection response
{
  message: "Resources retrieved successfully",
  data: User[] | Patient[] | Doctor[],
  meta: {
    total: number,
    page: number,
    limit: number
  }
}

// Create response
{
  message: "Resource created successfully",
  data: User | Patient | Doctor
}

// Update response
{
  message: "Resource updated successfully",
  data: User | Patient | Doctor
}

// Delete response
{
  message: "Resource deleted successfully"
}
```

### Error Response Structure

```typescript
{
  error: {
    code: "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN",
    message: "Human readable error message",
    details?: any // Additional error context
  },
  timestamp: "2023-01-01T00:00:00.000Z",
  path: "/api/users/123"
}
```

## 5. Database Naming Conventions (Project Specific)

### Table Names

- **snake_case** y plural: `users`, `patients`, `doctors`, `medical_records`
- **Relational tables**: `user_roles`, `patient_doctors`, `appointment_prescriptions`

### Column Names

- **snake_case**: `first_name`, `last_name`, `created_at`, `updated_at`
- **Foreign keys**: `[table]_id`: `user_id`, `patient_id`, `doctor_id`
- **Timestamps**: `created_at`, `updated_at` (mandatory for all entities)

### Indexes

- **Primary keys**: `id` (UUID)
- **Foreign keys**: Index on all `[table]_id` columns
- **Unique constraints**: Email, medical license numbers, etc.

## 6. Environment Configuration (Project Specific)

### Required Environment Variables

```bash
# Application
=development|production|test
PORT=3000

# Database
DB_TYPE=postgres|mysql|mariadb
DB_HOST=localhost 
DB_PORT=5432
DB_USER=hospital_user
DB_PASS=hospital_password
DB_NAME=hospital_db

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hospital@example.com
EMAIL_PASS=email-password

# File Upload (Medical documents, images)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Redis (for sessions, cache)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 7. Testing Strategy (Project Specific)

### Test Structure

```
src/features/user/
├── user.controller.ts
├── user.controller.spec.ts    # E2E tests for HTTP endpoints
├── user.service.ts
├── user.service.spec.ts       # Unit tests for business logic
├── user.repository.ts
├── user.repository.spec.ts     # Unit tests for data access
└── user.module.ts
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
- File uploads: Medical document handling

## 8. Code Review Checklist (Project Specific)

### Architecture & Structure

- [ ] Feature follows `src/features/[module]/` structure
- [ ] All files follow naming conventions
- [ ] Proper separation of concerns (Controller → Service → Repository)
- [ ] Database entities use snake_case columns and table names

### Business Logic

- [ ] Medical validation rules implemented correctly
- [ ] Patient data follows HIPAA compliance
- [ ] Appointment scheduling prevents conflicts
- [ ] Medical records maintain audit trail

### Security

- [ ] Patient data encryption at rest
- [ ] Authentication required for medical data access
- [ ] Role-based access control for different user types
- [ ] Audit logging for medical record access

### Documentation

- [ ] All medical endpoints documented with medical terminology
- [ ] Response examples include real medical data structures
- [ ] Error messages provide clear medical context

---

**Project Mantra**: "Medical software requires absolute precision and security. Every line of code impacts patient care."
