# How Next.js Loads Environment Variables

## 📚 Environment Variable Loading Order

Next.js loads environment variables in a **specific priority order**. Variables in files with **higher priority override** variables in files with lower priority.

### Priority Order (Highest to Lowest):

```
1. .env.local                    ← HIGHEST PRIORITY ⭐
2. .env.development / .env.production  (based on NODE_ENV)
3. .env                          ← LOWEST PRIORITY
```

## 🔄 How It Works

### Example Scenario:

You have these files:

**`.env`** (lowest priority):
```env
DATABASE_URL=postgresql://localhost:5432/db
PORT=3000
API_KEY=default-key
```

**`.env.local`** (highest priority):
```env
DATABASE_URL=postgresql://production:5432/db
API_KEY=secret-key
```

**Result:** Next.js will use:
- `DATABASE_URL` = `postgresql://production:5432/db` (from `.env.local`)
- `PORT` = `3000` (from `.env`, not overridden)
- `API_KEY` = `secret-key` (from `.env.local`)

## 📁 File Types Explained

### 1. `.env.local`
- **Priority:** Highest
- **Purpose:** Local overrides (your personal settings)
- **Git:** ❌ Should be gitignored (contains secrets)
- **When loaded:** Always (all environments)

### 2. `.env.development` / `.env.production`
- **Priority:** Medium
- **Purpose:** Environment-specific settings
- **Git:** ✅ Can be committed (no secrets)
- **When loaded:** 
  - `.env.development` when `NODE_ENV=development`
  - `.env.production` when `NODE_ENV=production`

### 3. `.env`
- **Priority:** Lowest
- **Purpose:** Default values for all environments
- **Git:** ✅ Can be committed (no secrets)
- **When loaded:** Always (all environments)

## 🎯 Real Example

Let's say you have:

**`.env`**:
```env
DATABASE_URL=postgresql://default:5432/db
PORT=3000
```

**`.env.development`**:
```env
DATABASE_URL=postgresql://dev:5432/db
DEBUG=true
```

**`.env.local`**:
```env
DATABASE_URL=postgresql://localhost:5432/db
PORT=4000
```

**When running `npm run dev` (NODE_ENV=development):**

Final values:
- `DATABASE_URL` = `postgresql://localhost:5432/db` ✅ (from `.env.local`)
- `PORT` = `4000` ✅ (from `.env.local`)
- `DEBUG` = `true` ✅ (from `.env.development`)

## 🔍 How to Verify

You can check which variables are loaded:

```typescript
// In any API route or server component
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);
```

## ⚠️ Important Notes

### 1. `.env.local` Always Wins
- `.env.local` overrides everything
- Use it for secrets and personal overrides
- Never commit it to git

### 2. Environment-Specific Files
- `.env.development` only loads when `NODE_ENV=development`
- `.env.production` only loads when `NODE_ENV=production`
- If `NODE_ENV` is not set, neither loads

### 3. Variable Merging
- Variables are **merged**, not replaced
- If a variable exists in multiple files, the highest priority wins
- Missing variables fall back to lower priority files

## 🛠️ Best Practices

### Recommended Setup:

```
.env                    # Default values (committed)
.env.development        # Development defaults (committed)
.env.production         # Production defaults (committed)
.env.local              # Your personal overrides (gitignored)
```

### Example Structure:

**`.env`** (defaults):
```env
NODE_ENV=development
API_TIMEOUT=5000
```

**`.env.development`** (dev defaults):
```env
DATABASE_URL=postgresql://dev-server:5432/db
DEBUG=true
```

**`.env.production`** (prod defaults):
```env
DATABASE_URL=postgresql://prod-server:5432/db
DEBUG=false
```

**`.env.local`** (your overrides):
```env
DATABASE_URL=postgresql://localhost:5432/db
API_KEY=your-secret-key
```

## 🔐 Security

### ✅ Safe to Commit:
- `.env`
- `.env.development`
- `.env.production`
- `.env.example`

### ❌ Never Commit:
- `.env.local`
- Any file with actual secrets

## 📝 Quick Reference

| File | Priority | Git | When Loaded |
|------|----------|-----|-------------|
| `.env.local` | Highest | ❌ No | Always |
| `.env.development` | Medium | ✅ Yes | NODE_ENV=development |
| `.env.production` | Medium | ✅ Yes | NODE_ENV=production |
| `.env` | Lowest | ✅ Yes | Always |

## 🚀 In Your Project

You currently have:
- ✅ `.env.local` - Your actual values (gitignored)
- ✅ `.env.development` - Development values
- ✅ `.env.production` - Production values
- ✅ `.env.example` - Template

When you run `npm run dev`:
1. Next.js loads `.env` (if exists)
2. Then loads `.env.development` (because NODE_ENV=development)
3. Finally loads `.env.local` (overrides everything)

**Result:** Your `.env.local` values take priority! 🎯




