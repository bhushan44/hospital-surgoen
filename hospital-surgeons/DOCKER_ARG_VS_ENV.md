# Docker ARG vs ENV - Simple Explanation

## 🎯 The Problem

Next.js tries to **build** your app and checks environment variables **during the build process**. But you don't have a real database connection during build - you only need it when the app **runs**.

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER BUILD STAGE                        │
│                    (Stage 1: builder)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ARG DATABASE_URL  ← You can pass this, or use dummy        │
│  ENV DATABASE_URL=$DATABASE_URL  ← Available during build  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  npm run build                                       │  │
│  │  ↓                                                    │  │
│  │  Next.js checks: process.env.DATABASE_URL            │  │
│  │  ↓                                                    │  │
│  │  ✅ Found! (even if dummy) → Build succeeds          │  │
│  │  ❌ Not found → Build fails                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Result: .next folder created (compiled app)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (Copy .next folder)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DOCKER RUNTIME STAGE                       │
│                  (Stage 2: Production)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ENV DATABASE_URL=...  ← From .env.production or docker     │
│                          (REAL VALUES HERE!)                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  npm start                                            │  │
│  │  ↓                                                    │  │
│  │  Your app runs                                        │  │
│  │  ↓                                                    │  │
│  │  getDb() checks: process.env.DATABASE_URL            │  │
│  │  ↓                                                    │  │
│  │  ✅ Uses REAL database URL → Connects to database    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Differences

### ARG (Build-Time Arguments)
- **When**: Only during `docker build`
- **Purpose**: Satisfy Next.js build requirements
- **Example**: `ARG DATABASE_URL="dummy"`
- **Life**: Dies after build completes
- **Use**: Just to make build pass

### ENV (Runtime Environment Variables)
- **When**: When container is **running**
- **Purpose**: Real values your app actually uses
- **Example**: `ENV DATABASE_URL="postgres://real:pass@db:5432/app"`
- **Life**: Available throughout container lifetime
- **Use**: Real database connections, API keys, secrets

---

## 📝 Your Dockerfile Explained

### Stage 1: Build (Lines 1-34)

```dockerfile
# Step 1: Accept build arguments
ARG DATABASE_URL                    # ← Can pass real or dummy
ARG JWT_SECRET                      # ← Can pass real or dummy
ARG CRON_SECRET                     # ← Can pass real or dummy

# Step 2: Convert to ENV for build process
ENV DATABASE_URL=${DATABASE_URL:-postgresql://dummy:dummy@localhost:5432/dummy}
#      ↑                                    ↑
#   Real value if provided          Dummy fallback if not provided

# Step 3: Build Next.js
RUN npm run build
#     ↑
#  Next.js checks process.env.DATABASE_URL
#  Finds it (even if dummy) → Build succeeds ✅
```

**What happens:**
- If you pass `--build-arg DATABASE_URL="real_url"` → Uses real URL during build
- If you don't pass anything → Uses dummy URL during build
- **Both work!** Dummy is fine because we're just building, not connecting

### Stage 2: Runtime (Lines 36-65)

```dockerfile
# No ARG here! ARG doesn't exist in runtime stage

# Only ENV (or values from docker-compose/.env.production)
ENV NODE_ENV=production

CMD ["npm", "start"]
#     ↑
#  App runs and uses REAL environment variables
#  from docker-compose.yml or .env.production
```

**What happens:**
- Container gets real values from `docker-compose.yml` → `environment:` section
- Or from `.env.production` file → `env_file:` section
- **These are the REAL values your app uses!**

---

## 🔄 Complete Example Flow

### Step 1: Build the Image

```bash
docker build -t hospital-surgeons:latest .
```

**What happens inside:**
```
1. ARG DATABASE_URL is empty (not passed)
2. ENV DATABASE_URL gets dummy value: "postgresql://dummy:dummy@localhost:5432/dummy"
3. npm run build runs
4. Next.js checks process.env.DATABASE_URL → ✅ Found (dummy, but that's OK)
5. Build succeeds!
6. .next folder created
```

### Step 2: Run the Container

```bash
docker run -d \
  --name hospital-surgeons-app \
  -p 3000:3000 \
  --env-file .env.production \
  hospital-surgeons:latest
```

**What happens inside:**
```
1. Container starts
2. Reads .env.production file
3. Sets REAL DATABASE_URL="postgres://realuser:realpass@db:5432/mydb"
4. npm start runs
5. Your app uses REAL database URL → ✅ Connects to real database
```

---

## 🎯 Why This Design?

### Problem:
Next.js tries to **statically analyze** your code during build. It sees:
```typescript
// lib/db/index.ts
export function getDb() {
  const connectionString = process.env.DATABASE_URL;  // ← Next.js checks this!
  if (!connectionString) {
    throw new Error('DATABASE_URL must be set');
  }
  // ...
}
```

Next.js says: "I need DATABASE_URL to build this!" → **Build fails if not found**

### Solution:
1. **During build**: Give it a dummy value → Build succeeds ✅
2. **During runtime**: Give it real value → App works ✅

---

## 📋 Your docker-compose.yml Explained

```yaml
services:
  app:
    build:
      args:
        # These are for BUILD-TIME only
        DATABASE_URL: ${DATABASE_URL:-postgresql://dummy:dummy@localhost:5432/dummy}
        # ↑ If .env.production has DATABASE_URL, use it
        #   Otherwise, use dummy value
        #   This is ONLY for the build step!
    
    environment:
      # These are for RUNTIME (when container runs)
      - DATABASE_URL=${DATABASE_URL}
      # ↑ Gets REAL value from .env.production
      #   This is what your app actually uses!
    
    env_file:
      - .env.production
      # ↑ Loads all variables from this file at runtime
```

---

## ✅ Summary Table

| Stage | Variable Type | Source | Purpose | Example |
|-------|--------------|--------|---------|---------|
| **Build** | `ARG` | `--build-arg` or default | Satisfy Next.js build | `ARG DATABASE_URL="dummy"` |
| **Build** | `ENV` (from ARG) | Converted from ARG | Available during `npm run build` | `ENV DATABASE_URL=$DATABASE_URL` |
| **Runtime** | `ENV` | `.env.production` or `docker-compose` | Real values app uses | `ENV DATABASE_URL="real_db_url"` |

---

## 🧪 Test It Yourself

### Test 1: Build with dummy values
```bash
docker build -t hospital-surgeons:latest .
# ✅ Works! Uses dummy values during build
```

### Test 2: Build with real values
```bash
docker build \
  --build-arg DATABASE_URL="postgres://real:pass@db:5432/app" \
  -t hospital-surgeons:latest .
# ✅ Also works! Uses real values during build
```

### Test 3: Run container
```bash
docker run -d \
  --name test \
  -p 3000:3000 \
  -e DATABASE_URL="postgres://real:pass@db:5432/app" \
  hospital-surgeons:latest

# Check what DATABASE_URL the running container sees:
docker exec test env | grep DATABASE_URL
# Output: DATABASE_URL=postgres://real:pass@db:5432/app
# ✅ Real value! (Not the dummy from build)
```

---

## 💡 Key Takeaway

**Build-time (ARG)**: "Just make the build pass, dummy values are fine"
**Runtime (ENV)**: "Use real values, this is when the app actually runs"

Think of it like:
- **Building a house** (build-time): You might use placeholder measurements
- **Living in the house** (runtime): You need real measurements

The dummy values during build don't affect your running app at all!

