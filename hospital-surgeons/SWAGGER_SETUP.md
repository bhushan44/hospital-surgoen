# Swagger/OpenAPI Documentation Setup

## ✅ Swagger is Now Implemented!

Swagger/OpenAPI documentation has been set up for your Next.js API.

## 📍 Access Points

### 1. Swagger UI (Interactive Documentation)
**URL:** `http://localhost:3000/api-docs`

This provides an interactive Swagger UI where you can:
- Browse all API endpoints
- See request/response schemas
- Test endpoints directly from the browser
- Authenticate with JWT tokens

### 2. OpenAPI JSON Spec
**URL:** `http://localhost:3000/api/docs`

Returns the raw OpenAPI 3.0 JSON specification that can be:
- Imported into Postman
- Used with other API tools
- Shared with frontend developers

## 📦 Installed Packages

- `swagger-ui-react` - Swagger UI React component
- `swagger-jsdoc` - Generates OpenAPI spec from JSDoc comments
- `@types/swagger-jsdoc` - TypeScript types
- `@types/swagger-ui-react` - TypeScript types

## 📝 How to Document Endpoints

Add JSDoc comments with `@swagger` annotations to your API routes:

```typescript
/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
export async function POST(req: NextRequest) {
  // Your route handler
}
```

## 🔐 Authentication

Swagger is configured to support JWT Bearer authentication:

1. Click the "Authorize" button in Swagger UI
2. Enter your JWT token (without "Bearer" prefix)
3. All authenticated requests will include the token

## 📚 Available Tags

The following tags are configured:
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

## 🚀 Usage

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:3000/api-docs
   ```

3. **Browse and test your API endpoints!**

## 📖 Example Documentation

See `app/api/users/signup/route.ts` for an example of how to document endpoints.

## 🔄 Adding More Documentation

To document more endpoints:

1. Add `@swagger` JSDoc comments to your route handlers
2. The documentation will automatically appear in Swagger UI
3. No need to restart the server (in development)

## ⚙️ Configuration

Swagger configuration is in `lib/swagger/config.ts`:
- API title and description
- Server URLs
- Authentication setup
- Tags and categories

## 🎯 Next Steps

1. Document all your API endpoints with `@swagger` annotations
2. Test endpoints using Swagger UI
3. Share the `/api/docs` JSON with your frontend team
4. Use the OpenAPI spec for API client generation

## 📚 Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI React](https://github.com/swagger-api/swagger-ui)




