# Environment Variables Setup Guide

This guide will help you set up all the required environment variables for the Hospital Surgeons backend.

## 📍 Where to Create .env Files

**Create `.env.local` in the root of your project** (same level as `package.json`):

```
hospital-surgeons/
├── .env.local          ← Create this file here
├── .env.example        ← Template (already exists)
├── package.json
└── ...
```

## 🔐 Client-Side vs Server-Side Variables

### Server-Side Variables (Your Backend API)
- **Location:** Root of project (`.env.local`)
- **Available in:** API routes, Server Components, Server Actions
- **NOT available in:** Client Components, Browser
- **Security:** ✅ Safe for secrets
- **No prefix needed** (default behavior)

### Client-Side Variables (If You Add Frontend)
- **Prefix:** Must start with `NEXT_PUBLIC_`
- **Available in:** Browser, Client Components
- **Security:** ⚠️ Exposed to browser - NEVER put secrets here!

**For your backend API project, all variables should be server-side (no `NEXT_PUBLIC_` prefix needed).**

## Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all the required values in `.env.local`

3. Restart your development server

## Required Environment Variables

### 1. Database Configuration

#### `DATABASE_URL`
PostgreSQL connection string for your database.

**Format:**
```
postgresql://username:password@host:port/database
```

**Examples:**

- **Local PostgreSQL:**
  ```
  DATABASE_URL=postgresql://postgres:password@localhost:5432/hospital_surgeons
  ```

- **Supabase:**
  ```
  DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
  ```
  - Replace `[YOUR-PASSWORD]` with your Supabase database password
  - Replace `[YOUR-PROJECT-REF]` with your Supabase project reference

- **Other Cloud Providers (Railway, Render, etc.):**
  ```
  DATABASE_URL=postgresql://user:password@host.railway.app:5432/railway
  ```

**How to get:**
- **Local:** Set up PostgreSQL locally or use Docker
- **Supabase:** Project Settings → Database → Connection String
- **Cloud Providers:** Usually provided in your dashboard

---

### 2. JWT Authentication

#### `JWT_ACCESS_TOKEN_SECRET`
Secret key for signing access tokens. **Must be a strong, random string.**

**Generate a secure key:**
```bash
openssl rand -base64 32
```

**Example:**
```
JWT_ACCESS_TOKEN_SECRET=K8xP2mN9qR5vT7wY3zA6bC1dE4fG8hJ0kL2mN5pQ8rS1tU4vW7xY0zA3bC6dE9f
```

#### `JWT_REFRESH_TOKEN_SECRET`
Secret key for signing refresh tokens. **Should be different from access token secret.**

**Generate a secure key:**
```bash
openssl rand -base64 32
```

**Example:**
```
JWT_REFRESH_TOKEN_SECRET=M9yQ3nO0rS6wT8xZ4aB7cD2eF5gH9iJ1kM3nP6qR9sT2uV5wX8yZ1aB4cD7eF0g
```

#### `JWT_ACCESS_TOKEN_EXPIRATION` (Optional)
Access token expiration time. Default: `900s` (15 minutes)

**Format:** Number followed by unit
- `s` = seconds
- `m` = minutes
- `h` = hours
- `d` = days

**Examples:**
```
JWT_ACCESS_TOKEN_EXPIRATION=900s    # 15 minutes
JWT_ACCESS_TOKEN_EXPIRATION=30m     # 30 minutes
JWT_ACCESS_TOKEN_EXPIRATION=1h      # 1 hour
```

#### `JWT_REFRESH_TOKEN_EXPIRATION` (Optional)
Refresh token expiration time. Default: `7d` (7 days)

**Examples:**
```
JWT_REFRESH_TOKEN_EXPIRATION=7d     # 7 days
JWT_REFRESH_TOKEN_EXPIRATION=30d   # 30 days
```

---

### 3. Supabase Configuration

#### `SUPABASE_URL`
Your Supabase project URL.

**Format:**
```
https://[YOUR-PROJECT-REF].supabase.co
```

**Example:**
```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

**How to get:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "Project URL"

#### `SUPABASE_ANON_KEY`
Your Supabase anonymous/public key.

**Example:**
```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

**How to get:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "anon public" key

**Note:** This is a public key and can be exposed in client-side code. It's safe to use in the backend.

---

### 4. SendGrid Email Configuration

#### `SENDGRID_API_KEY`
SendGrid API key for sending transactional emails.

**Example:**
```
SENDGRID_API_KEY=SG.abcdefghijklmnopqrstuvwxyz.1234567890abcdefghijklmnopqrstuvwxyz1234567890
```

**How to get:**
1. Sign up for a SendGrid account at https://sendgrid.com
2. Navigate to Settings → API Keys
3. Click "Create API Key"
4. Give it a name (e.g., "Hospital Surgeons Backend")
5. Select "Full Access" or "Restricted Access" with Mail Send permissions
6. Copy the API key (you'll only see it once!)

**Note:** 
- SendGrid offers a free tier (100 emails/day)
- The API key is only shown once, so save it securely
- If you lose it, you'll need to create a new one

---

### 5. Next.js Configuration (Optional)

#### `NODE_ENV`
Node environment. Usually `development` or `production`.

**Example:**
```
NODE_ENV=development
```

#### `PORT` (Optional)
Port for the Next.js server. Default: `3000`

**Example:**
```
PORT=3000
```

---

## Complete Example

Here's a complete `.env.local` example with all variables:

```env
# Database
DATABASE_URL=postgresql://postgres:mySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres

# JWT
JWT_ACCESS_TOKEN_SECRET=K8xP2mN9qR5vT7wY3zA6bC1dE4fG8hJ0kL2mN5pQ8rS1tU4vW7xY0zA3bC6dE9f
JWT_REFRESH_TOKEN_SECRET=M9yQ3nO0rS6wT8xZ4aB7cD2eF5gH9iJ1kM3nP6qR9sT2uV5wX8yZ1aB4cD7eF0g
JWT_ACCESS_TOKEN_EXPIRATION=900s
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Supabase
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example

# SendGrid
SENDGRID_API_KEY=SG.abcdefghijklmnopqrstuvwxyz.1234567890abcdefghijklmnopqrstuvwxyz1234567890

# Next.js
NODE_ENV=development
PORT=3000
```

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use strong secrets** - Generate JWT secrets with `openssl rand -base64 32`
3. **Rotate secrets regularly** - Especially in production
4. **Use different secrets for different environments** - Dev, staging, production
5. **Keep secrets secure** - Use a secrets manager in production (AWS Secrets Manager, etc.)

## Verification

After setting up your environment variables, verify they're loaded correctly:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the console for initialization messages:
   - "Drizzle client initialized with SSL"
   - "Supabase client initialized"

3. Test an API endpoint to ensure everything works

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database server is running
- Verify network/firewall settings
- For Supabase, ensure SSL is enabled

### JWT Token Issues
- Ensure secrets are set and not empty
- Verify secrets are different for access and refresh tokens
- Check token expiration format is correct

### Supabase Issues
- Verify URL and key are correct
- Check Supabase project is active
- Ensure API keys have correct permissions

### SendGrid Issues
- Verify API key is correct
- Check SendGrid account is verified
- Ensure API key has "Mail Send" permissions
- Check SendGrid account limits/quota

## Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all required variables are set
3. Ensure no typos in variable names
4. Check that values don't have extra spaces or quotes

