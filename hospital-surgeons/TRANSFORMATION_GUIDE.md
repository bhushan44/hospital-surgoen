# NestJS to Next.js Transformation Guide

This document outlines how the medi-link NestJS backend was transformed to Next.js.

## Architecture Mapping

### NestJS → Next.js

| NestJS | Next.js |
|--------|---------|
| `@Controller('users')` | `app/api/users/route.ts` |
| `@Get()`, `@Post()`, etc. | `export async function GET()`, `POST()`, etc. |
| `@UseGuards(JwtAuthGuard)` | `withAuth(handler, ['role'])` |
| `@Injectable()` Services | Service classes (direct instantiation) |
| `@Module()` | File-based organization |
| `@Body()`, `@Param()`, `@Query()` | `req.json()`, `params`, `req.nextUrl.searchParams` |
| `ConfigService` | `process.env` |
| Dependency Injection | Direct instantiation |

## Code Transformation Examples

### Controller → API Route

**NestJS:**
```typescript
@Controller('users')
export class UsersController {
  @Post('login')
  login(@Body() body: LoginUserDto) {
    return this.usersService.login(body);
  }
}
```

**Next.js:**
```typescript
// app/api/users/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from '@/lib/services/users.service';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const usersService = new UsersService();
  const result = await usersService.login(body);
  return NextResponse.json(result);
}
```

### Guards → Middleware

**NestJS:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get()
findAll() {
  return this.usersService.findAll();
}
```

**Next.js:**
```typescript
import { withAuth } from '@/lib/auth/middleware';

async function handler(req: NextRequest) {
  const usersService = new UsersService();
  const users = await usersService.findAll();
  return NextResponse.json({ success: true, data: users });
}

export const GET = withAuth(handler, ['admin']);
```

### Services

Services remain largely the same, but without `@Injectable()` decorator:

**NestJS:**
```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}
}
```

**Next.js:**
```typescript
export class UsersService {
  private userRepository = new UsersRepository();
  
  // Methods remain the same
}
```

### Repositories

Repositories also remain similar:

**NestJS:**
```typescript
@Injectable()
export class UsersRepository {
  constructor(private readonly drizzleService: DrizzleService) {
    this.db = this.drizzleService.getDrizzleClient();
  }
}
```

**Next.js:**
```typescript
export class UsersRepository {
  private db = getDb(); // Direct function call
  
  // Methods remain the same
}
```

## Environment Variables

NestJS uses `ConfigService`, Next.js uses `process.env` directly:

**NestJS:**
```typescript
const port = this.configService.get<number>('PORT');
```

**Next.js:**
```typescript
const port = process.env.PORT;
```

## Request/Response Handling

### Getting Request Body

**NestJS:**
```typescript
@Post()
create(@Body() createDto: CreateDto) {
  // createDto is automatically parsed
}
```

**Next.js:**
```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  // Use body
}
```

### Getting URL Parameters

**NestJS:**
```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  // id is available
}
```

**Next.js:**
```typescript
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
}
```

### Getting Query Parameters

**NestJS:**
```typescript
@Get()
findAll(@Query() query: QueryDto) {
  // query is available
}
```

**Next.js:**
```typescript
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get('page');
}
```

## File Upload

**NestJS:**
```typescript
@UseInterceptors(FileInterceptor('file'))
@Post('upload')
uploadFile(@UploadedFile() file: Express.Multer.File) {
  // file is available
}
```

**Next.js:**
```typescript
import { writeFile } from 'fs/promises';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  // Process file
}
```

## Error Handling

**NestJS:**
```typescript
throw new NotFoundException('User not found');
```

**Next.js:**
```typescript
return NextResponse.json(
  { success: false, message: 'User not found' },
  { status: 404 }
);
```

## CORS

**NestJS:**
```typescript
app.enableCors();
```

**Next.js:**
```typescript
// In route handler or middleware
export async function GET(req: NextRequest) {
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    },
  });
}
```

## Next Steps

To complete the transformation:

1. Transform remaining modules (doctors, hospitals, bookings, etc.)
2. Add file upload handling
3. Set up proper error handling middleware
4. Add request validation
5. Set up API documentation (Swagger alternative)
6. Add rate limiting
7. Add logging




