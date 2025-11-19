# Swagger Auto-Update Guide

## How Swagger Docs Auto-Update

Swagger documentation in this project **automatically updates** when you add `@swagger` JSDoc comments to your API route files. Here's how it works:

### 1. **Configuration** (`lib/swagger/config.ts`)

The Swagger configuration uses `swagger-jsdoc` which:
- Scans all files matching the pattern: `app/api/**/route.ts`
- Extracts `@swagger` JSDoc comments from those files
- Generates OpenAPI 3.0 specification on-the-fly

```typescript
apis: [
  resolve(process.cwd(), 'app/api/**/route.ts'), // Automatically scans all route files
]
```

### 2. **How It Works**

1. **You add `@swagger` comments** to your route files:
   ```typescript
   /**
    * @swagger
    * /api/users/signup:
    *   post:
    *     summary: Register a new user
    *     tags: [Users]
    */
   export async function POST(req: NextRequest) {
     // Your code
   }
   ```

2. **When `/api/docs` is called**, `swagger-jsdoc`:
   - Scans all `app/api/**/route.ts` files
   - Extracts all `@swagger` comments
   - Generates a fresh OpenAPI spec
   - Returns the JSON

3. **Swagger UI** (`/api-docs`) displays the generated spec

### 3. **Why It's Automatic**

- ✅ **No manual updates needed** - Just add JSDoc comments
- ✅ **Always in sync** - Spec is generated from your code
- ✅ **Type-safe** - Comments are in the same file as the code
- ✅ **Version controlled** - Docs live with your code

### 4. **Adding Documentation**

To document an endpoint, add a `@swagger` JSDoc comment above the handler:

```typescript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: Brief description
 *     tags: [TagName]
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
export async function GET(req: NextRequest) {
  // Handler code
}
```

### 5. **Viewing Documentation**

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api/docs`

### 6. **Best Practices**

1. **Always add `@swagger` comments** when creating new endpoints
2. **Update comments** when endpoints change
3. **Use consistent tags** (see `lib/swagger/config.ts` for available tags)
4. **Include request/response schemas** for better documentation
5. **Add security requirements** for protected endpoints

### 7. **Available Tags**

- Users
- Doctors
- Hospitals
- Specialties
- Bookings
- Payments
- Reviews
- Notifications
- Support
- Analytics
- Subscriptions

### 8. **Example: Complete Endpoint Documentation**

```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: User not found
 */
```

---

**Note**: The Swagger spec is generated **dynamically** on each request to `/api/docs`, so it always reflects the current state of your code comments.



