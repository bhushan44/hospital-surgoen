# Environment Variables Guide for Next.js

## 📍 Where to Create .env Files

**Location: Root of your Next.js project** (same level as `package.json`)

```
hospital-surgeons/
├── .env                    # Default (all environments)
├── .env.local              # Local overrides (gitignored) ⭐ USE THIS
├── .env.development        # Development only
├── .env.production         # Production only
├── .env.example            # Template (safe to commit)
└── package.json
```

## 🔐 Client-Side vs Server-Side Variables

### Server-Side Variables (Default)
- **Available in:** API routes, Server Components, Server Actions, Middleware
- **NOT available in:** Client Components, Browser
- **Security:** ✅ Safe for secrets (database URLs, API keys, JWT secrets)

### Client-Side Variables (NEXT_PUBLIC_*)
- **Available in:** Browser, Client Components, API routes
- **Security:** ⚠️ Exposed to browser - NEVER put secrets here!
- **Prefix:** Must start with `NEXT_PUBLIC_`

## 📋 Variable Categories

### 🔒 Server-Side Only (Current Backend API)

These are **SECRET** and should **NEVER** be exposed to the client:

```env
# Database (Server-Side Only)
DATABASE_URL=postgresql://user:password@localhost:5432/hospital_surgeons

# JWT Secrets (Server-Side Only)
JWT_ACCESS_TOKEN_SECRET=your-secret-key
JWT_REFRESH_TOKEN_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRATION=900s
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Supabase (Server-Side Only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# SendGrid (Server-Side Only)
SENDGRID_API_KEY=your-sendgrid-key
```

### 🌐 Client-Side Variables (If You Add Frontend Later)

If you build a frontend that needs to access these from the browser:

```env
# Client-Side (Exposed to Browser)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Hospital Surgeons
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ Important:** 
- `SUPABASE_ANON_KEY` can be public (it's designed to be safe)
- But `DATABASE_URL`, `JWT_SECRET`, `SENDGRID_API_KEY` should **NEVER** be `NEXT_PUBLIC_*`

## 🎯 For Your Current Backend API Project

Since you're building a **backend API only**, all your variables should be **server-side**:

```env
# ✅ All Server-Side (No NEXT_PUBLIC_ prefix needed)
DATABASE_URL=...
JWT_ACCESS_TOKEN_SECRET=...
JWT_REFRESH_TOKEN_SECRET=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SENDGRID_API_KEY=...
```

## 📝 Next.js .env File Priority

Next.js loads environment variables in this order (higher priority overrides lower):

1. `.env.local` ⭐ **Use this for local development**
2. `.env.development` / `.env.production` (based on NODE_ENV)
3. `.env`

**Best Practice:** 
- Use `.env.local` for your actual secrets (gitignored)
- Use `.env.example` as a template (committed to git)

## 🔄 Migration from NestJS

In **NestJS**, you typically had:
```env
DATABASE_URL=...
JWT_SECRET=...
```

In **Next.js**, it's the same, but:
- Variables are automatically available in API routes (server-side)
- No need for `ConfigService` - just use `process.env.VARIABLE_NAME`
- If you need client-side access, add `NEXT_PUBLIC_` prefix

## 🛡️ Security Best Practices

### ✅ DO:
- Keep all secrets in `.env.local` (gitignored)
- Use server-side variables for sensitive data
- Use `NEXT_PUBLIC_*` only for non-sensitive, public data
- Never commit `.env.local` to git

### ❌ DON'T:
- Never use `NEXT_PUBLIC_` for secrets
- Never commit `.env.local` to git
- Never expose database URLs to client
- Never expose JWT secrets to client

## 📖 Example Usage

### In API Routes (Server-Side)
```typescript
// app/api/users/route.ts
export async function GET() {
  // ✅ Works - Server-side only
  const dbUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
  
  // ✅ Works - Can access both server and client vars
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
}
```

### In Client Components (Browser)
```typescript
// app/components/MyComponent.tsx (Client Component)
'use client';

export function MyComponent() {
  // ❌ Won't work - Server-side only
  const dbUrl = process.env.DATABASE_URL; // undefined
  
  // ✅ Works - Has NEXT_PUBLIC_ prefix
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
}
```

## 🚀 Quick Setup

1. **Create `.env.local` in project root:**
   ```bash
   cd hospital-surgeons
   cp .env.example .env.local
   ```

2. **Fill in your values** (all server-side for backend API)

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

## 📚 Next.js Documentation

- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Loading Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#loading-environment-variables)




