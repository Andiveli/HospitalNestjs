# Code Review Rules - NestJS + TypeScript

## 1. General Principles

- **Use TypeScript strict mode** - No compromises
- **Prefer composition over inheritance**
- **Keep modules small and cohesive** - One module = one responsibility
- **Avoid business logic in controllers**
- **Single Responsibility Principle** everywhere
- **No circular dependencies** - Use `nest graph` to detect
- **Follow SOLID principles religiously**

## 2. Project Structure

```
src/
├── core/                    # Core infrastructure (auth, config)
├── shared/                  # Shared utilities, common modules
├── features/                # Business features
│   ├── user/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   └── *.spec.ts
│   └── patient/
├── config/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
└── main.ts
```

- **Feature modules** for business logic
- **Core modules** for infrastructure
- **Shared modules** for reusable utilities
- **Test files** alongside source files (`.spec.ts`)

## 3. TypeScript Standards

### Strict Configuration

```json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "exactOptionalPropertyTypes": true
    }
}
```

### Type Rules

- **NEVER use `any`** - Zero tolerance, absolute prohibition
- **Prefer interfaces** over type aliases for objects
- **Use enums** for fixed values, not magic strings
- **Discriminated unions** for complex types
- **const over let** when possible
- **Explicit return types** for public methods

## 4. Controllers

### Controllers Must

- **Only handle HTTP concerns** (request/response)
- **Call services** for ALL business logic
- **Use DTOs** with validation decorators
- **Return HTTP responses** with proper status codes
- **Document endpoints with Swagger/OpenAPI decorators**

### Controllers Must NOT

- **Access repositories directly**
- **Contain validation logic** beyond DTO decorators
- **Have business logic**
- **Use any type** in method parameters
- **Throw raw Error objects**

```typescript
@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiCreatedResponse({
        description: 'User successfully created',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiConflictResponse({
        description: 'Email already exists',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized access',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden operation',
    })
    async createUser(
        @Body() createUserDto: CreateUserDto,
    ): Promise<UserResponseDto> {
        // ✅ Good: Just HTTP handling with full documentation
        const user = await this.userService.createUser(createUserDto);
        return { message: 'User created', data: user };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        type: String,
    })
    @ApiOkResponse({
        description: 'User found',
        type: UserResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized access',
    })
    async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
        const user = await this.userService.findById(id);
        return { data: user };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user by ID' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        type: String,
    })
    @ApiOkResponse({
        description: 'User updated successfully',
        type: UserResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized access',
    })
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        const user = await this.userService.updateUser(id, updateUserDto);
        return { message: 'User updated', data: user };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user by ID' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        type: String,
    })
    @ApiNoContentResponse({
        description: 'User deleted successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized access',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden operation',
    })
    async deleteUser(@Param('id') id: string): Promise<void> {
        await this.userService.deleteUser(id);
    }
}
```

## 5. Services

### Services Must

- **Contain all business rules**
- **Be unit testable** without HTTP layer
- **Have no direct usage** of Request/Response objects
- **Handle business validation**
- **Use dependency injection** via constructor

### Services Must NOT

- **Know about HTTP**
- **Access database directly** (use repositories)
- **Handle HTTP responses**
- **Have static methods** (breaks DI)

```typescript
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: UserRepository,
        private emailService: EmailService,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        // ✅ Business logic here
        if (await this.userRepository.existsByEmail(createUserDto.email)) {
            throw new ConflictException('Email already exists');
        }

        const user = await this.userRepository.create(createUserDto);
        await this.emailService.sendWelcomeEmail(user.email);
        return user;
    }
}
```

## 6. DTO & Validation

### All Input Must Use DTOs With

- **class-validator** decorators for validation
- **class-transformer** for transformation
- **@Transform()** for complex transformations
- **@ApiProperty()** for Swagger documentation
- **Whitelist option** to strip unknown properties

### Controllers Must Use OpenAPI Decorators

- **@ApiTags()** for grouping endpoints
- **@ApiOperation()** for endpoint descriptions
- **@ApiParam()** for path parameters
- **@ApiQuery()** for query parameters
- **@ApiBody()** when body schema needs explicit definition

### Response Decorators - Use Specific HTTP Status Decorators:

- **@ApiOkResponse()** - 200 OK (successful GET requests)
- **@ApiCreatedResponse()** - 201 Created (successful POST requests)
- **@ApiNoContentResponse()** - 204 No Content (successful DELETE/PUT without body)
- **@ApiBadRequestResponse()** - 400 Bad Request (validation errors)
- **@ApiUnauthorizedResponse()** - 401 Unauthorized (missing/invalid auth)
- **@ApiForbiddenResponse()** - 403 Forbidden (auth valid but insufficient permissions)
- **@ApiNotFoundResponse()** - 404 Not Found (resource doesn't exist)
- **@ApiConflictResponse()** - 409 Conflict (resource already exists)
- **@ApiUnprocessableEntityResponse()** - 422 Unprocessable Entity (semantic validation errors)
- **@ApiInternalServerErrorResponse()** - 500 Internal Server Error (unexpected server errors)

### Never

- **Accept any** in controllers - Zero exceptions
- **Reuse DTOs for database entities** - Clear separation mandatory
- **Skip validation** in any endpoint - All inputs must be validated
- **Use plain objects** without transformation - Always use typed DTOs
- **Skip OpenAPI documentation** - All endpoints must be fully documented

```typescript
export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain uppercase, lowercase and number',
    })
    password: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(2)
    name: string;
}
```

## 7. Error Handling

### Rules

- **Use Nest HttpException** or custom exceptions
- **Do not throw raw Error** in controllers/services
- **Create domain-specific exceptions**
- **Centralize error mapping** with exception filters
- **Log errors with context**

### Exception Structure

```typescript
export class UserNotFoundException extends NotFoundException {
    constructor(userId: string) {
        super(`User with ID ${userId} not found`);
    }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        // Centralized error handling
    }
}
```

## 8. Database & Repositories

### Architecture Flow

**Controllers → Services → Repositories → Database**

### Rules

- **Never skip layers**
- **Transactions must be explicit**
- **No SQL in controllers/services** (use ORM/Query Builder)
- **Repository pattern** for data access
- **Custom repositories** for complex queries
- **Connection management** via TypeORM module

### Repository Structure

```typescript
@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private ormRepository: Repository<User>,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.ormRepository.findOne({ where: { email } });
    }

    async create(userData: CreateUserDto): Promise<User> {
        const user = this.ormRepository.create(userData);
        return this.ormRepository.save(user);
    }
}
```

## 9. Dependency Injection

### Rules

- **Use constructor injection only**
- **Do not instantiate services manually** with `new`
- **Use @Injectable()** on all services
- **Provider scopes** must be explicit (Default/Request/Transient)
- **Interface injection** for better testability

```typescript
// ✅ Correct
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private emailService: EmailService,
    ) {}
}

// ❌ Wrong
export class UserService {
    private userRepository = new UserRepository(); // Don't do this!
}
```

## 10. Logging

### Rules

- **Use Nest Logger** or centralized logger
- **No console.log** in production code
- **Structured logging** with context
- **Appropriate log levels** (ERROR, WARN, INFO, DEBUG)
- **Log business events**, not just technical details

```typescript
// ✅ Good
this.logger.log('User created successfully', {
    userId: user.id,
    email: user.email,
    timestamp: new Date().toISOString(),
});

// ❌ Bad - Never in production
console.log('User created');
```

## 11. Config & Secrets

### Rules

- **Use @nestjs/config** with validation schema
- **No hardcoded secrets** or environment checks
- **Typed configuration objects**
- **Environment-specific** configuration files
- **Validation at startup**

```typescript
export const configValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .required(),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
});
```

## 12. Async & Promises

### Rules

- **Always use async/await**
- **No floating promises**
- **Handle expected failures explicitly**
- **Error boundaries** for async operations
- **Type-safe async operations**

```typescript
// ❌ Bad - Floating promise
updateUser(id, updateDto); // No await or error handling
```

## 13. Naming Conventions

### Classes: PascalCase

- `UserService`, `CreateUserDto`, `UserRepository`

### Files: kebab-case

- `user.service.ts`, `create-user.dto.ts`, `user.controller.ts`

### Services: `*.service.ts`

- `user.service.ts`, `auth.service.ts`

### Controllers: `*.controller.ts`

- `user.controller.ts`, `auth.controller.ts`

### DTOs: `*.dto.ts`

- `create-user.dto.ts`, `update-user.dto.ts`

### Entities: `*.entity.ts`

- `user.entity.ts`, `patient.entity.ts`

## 14. Testing

### Unit Tests

- **Services must have unit tests** when business logic exists
- **Test individual methods** with proper mocking
- **Arrange-Act-Assert** pattern
- **Coverage > 90%** for business logic

### E2E Tests

- **Controllers must have e2e tests** for endpoints
- **Test all HTTP status codes**
- **Test validation errors**
- **Test authentication/authorization**

### Test Structure

```typescript
describe('UserService', () => {
    let service: UserService;
    let repository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        // Setup test module
    });

    describe('createUser', () => {
        it('should create user successfully', async () => {
            // Arrange
            // Act
            // Assert
        });
    });
});
```

### Testing Rules

- **No mocking of core Nest framework**
- **Use TestModules** for integration tests
- **Clean test data** after each test
- **Test error scenarios**

## 15. Code Smells (Must Be Flagged)

### ❌ Fat Controllers

- Controllers with more than HTTP handling
- Business logic in controller methods
- Direct database access

### ❌ God Services

- Services doing too many things
- Services with many dependencies
- Static methods that break DI

### ❌ Architecture Violations

- Direct DB calls outside repository layer
- DTOs reused for persistence models
- Logic inside decorators beyond simple validation
- Skipping layers (Controller → Repository)

### ❌ TypeScript Violations

- Use of `any` type
- Missing type annotations
- Implicit any parameters

### ❌ Security Issues

- Unvalidated inputs
- Hardcoded secrets
- Missing authentication/authorization

## 16. Pull Request Expectations

### Code Quality

- **Code must compile** without errors
- **No lint errors** - ESLint + Prettier
- **TypeScript strict mode** compliance
- **No TODOs** without ticket reference
- **Documentation updated** for API changes

### Testing

- **All tests pass**
- **New features have tests**
- **Coverage not decreased**
- **No test regressions**

### Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] No `any` types
- [ ] Proper error handling
- [ ] DTO validation implemented
- [ ] Architecture layers respected
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No hardcoded secrets
- [ ] Logging implemented appropriately
- [ ] No circular dependencies
- [ ] OpenAPI/Swagger documentation complete
- [ ] All responses documented with proper status codes

---

**REMEMBER**: These rules aren't suggestions - they're requirements for maintainable, scalable NestJS applications. Following strict patterns today prevents technical debt tomorrow.

**Code Review Mantra**: "Does this follow the rules, or am I taking a shortcut?"
