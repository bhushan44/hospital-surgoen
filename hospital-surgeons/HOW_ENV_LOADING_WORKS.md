# How Next.js Loads Environment Variables

## 🔄 Loading Process (Step by Step)

When Next.js starts, it loads environment variables in this **exact order**:

```
Step 1: Load .env                    (lowest priority)
Step 2: Load .env.development        (if NODE_ENV=development)
   OR
Step 2: Load .env.production         (if NODE_ENV=production)
Step 3: Load .env.local              (highest priority - OVERRIDES ALL)
```

## 📊 Visual Example

### Your Files:

**`.env`** (if exists):
```env
DATABASE_URL=default-database
PORT=3000
```

**`.env.development`**:
```env
DATABASE_URL=dev-database
DEBUG=true
```

**`.env.local`**:
```env
DATABASE_URL=your-actual-database
PORT=21867
API_KEY=your-secret
```

### Loading Process:

```
┌─────────────────────────────────────┐
│ Step 1: Load .env                  │
│ DATABASE_URL = "default-database"  │
│ PORT = "3000"                      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Step 2: Load .env.development      │
│ DATABASE_URL = "dev-database"      │ ← Overwrites
│ PORT = "3000"                      │ ← Keeps from .env
│ DEBUG = "true"                      │ ← New variable
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Step 3: Load .env.local            │
│ DATABASE_URL = "your-actual-db"    │ ← Overwrites
│ PORT = "21867"                      │ ← Overwrites
│ DEBUG = "true"                      │ ← Keeps from .env.development
│ API_KEY = "your-secret"             │ ← New variable
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ FINAL RESULT (process.env):        │
│ DATABASE_URL = "your-actual-db"    │
│ PORT = "21867"                      │
│ DEBUG = "true"                      │
│ API_KEY = "your-secret"             │
└─────────────────────────────────────┘
```

## 🎯 Key Points

### 1. **Priority Order**
```
.env.local > .env.development/.env.production > .env
```

### 2. **Merging, Not Replacing**
- Variables are **merged** together
- Higher priority files **override** lower priority files
- Variables that don't exist in higher priority files are **kept** from lower priority files

### 3. **Environment-Specific Files**
- `.env.development` only loads when `NODE_ENV=development`
- `.env.production` only loads when `NODE_ENV=production`
- `.env.local` **always loads** (highest priority)

## 🔍 Real Example from Your Project

### Your Current Files:

**`.env.development`**:
```env
CORS=http://localhost:4000,https://bx.artofliving.org
DATABASE_URL=postgresql://postgres.xkpjlcbrmvkkqwdnhkkx:...
PORT=21867
```

**`.env.local`**:
```env
CORS=http://localhost:4000,https://bx.artofliving.org
DATABASE_URL=postgresql://postgres.xkpjlcbrmvkkqwdnhkkx:...
PORT=21867
```

### What Happens:

1. Next.js loads `.env.development` (if NODE_ENV=development)
2. Then loads `.env.local` (overrides everything)
3. Since both have same values, final result = values from `.env.local`

## 💡 Best Practice Pattern

### Recommended File Structure:

```
.env                    # Defaults (committed to git)
├── Common defaults
└── Safe to share

.env.development         # Dev defaults (committed to git)
├── Development-specific
└── No secrets

.env.production          # Prod defaults (committed to git)
├── Production-specific
└── No secrets

.env.local               # Your overrides (gitignored)
├── Your actual secrets
└── Personal settings
```

## 🛠️ How to Use in Code

### In API Routes:

```typescript
// app/api/users/route.ts
export async function GET() {
  // Next.js automatically loads all .env files
  // and merges them according to priority
  
  const dbUrl = process.env.DATABASE_URL;  // From .env.local
  const port = process.env.PORT;            // From .env.local
  const cors = process.env.CORS;            // From .env.local
  
  console.log('Database:', dbUrl);
  console.log('Port:', port);
  console.log('CORS:', cors);
}
```

### Accessing Variables:

```typescript
// ✅ Works in API routes (server-side)
const secret = process.env.JWT_SECRET;

// ✅ Works in Server Components
export default function ServerComponent() {
  const apiKey = process.env.SENDGRID_API_KEY;
  return <div>API Key: {apiKey}</div>;
}

// ❌ Won't work in Client Components (unless NEXT_PUBLIC_)
'use client';
export default function ClientComponent() {
  const secret = process.env.JWT_SECRET; // undefined!
  // Use NEXT_PUBLIC_ prefix for client-side
}
```

## ⚠️ Important Notes

### 1. `.env.local` Always Wins
- Highest priority
- Use for secrets and personal overrides
- Never commit to git

### 2. Variable Merging
- If variable exists in multiple files, highest priority wins
- Missing variables are kept from lower priority files

### 3. No Need to Import
- Variables are automatically available in `process.env`
- No need to import or configure anything
- Just use `process.env.VARIABLE_NAME`

## 🔐 Security Reminder

Your `.gitignore` has:
```
.env*
```

This means **ALL** `.env*` files are gitignored. But you can:

1. **Commit `.env.example`** - It's a template
2. **Never commit `.env.local`** - Contains secrets
3. **Optionally commit `.env.development` and `.env.production`** - If they don't contain secrets

To commit `.env.example`, you can:
```bash
git add -f .env.example
```

## 📝 Summary

**Loading Order:**
1. `.env` (lowest)
2. `.env.development` or `.env.production` (medium)
3. `.env.local` (highest - wins everything)

**In Your Project:**
- `.env.local` contains your actual values
- It overrides everything else
- It's gitignored (safe)
- Just use `process.env.VARIABLE_NAME` in your code!




