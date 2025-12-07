# Docker Setup Guide for Hospital Surgeons App

## Prerequisites

1. **Install Docker**: 
   - Download from [https://www.docker.com/get-started](https://www.docker.com/get-started)
   - Or install via package manager:
     ```bash
     # Ubuntu/Debian
     sudo apt-get update
     sudo apt-get install docker.io docker-compose
     
     # macOS (using Homebrew)
     brew install docker docker-compose
     ```

2. **Verify Docker Installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

---

## Step-by-Step Instructions

### Method 1: Using Docker Commands (Manual)

#### Step 1: Navigate to Project Directory
```bash
cd /home/bhushan/Desktop/personal/hospital-surgoen/hospital-surgeons
```

#### Step 2: Create Environment File (if not exists)
```bash
# Copy your .env file to .env.production
cp .env.local .env.production
# Or create a new one with production values
```

#### Step 3: Build the Docker Image

**Option A: Build with dummy values (for build-time only)**
```bash
docker build -t hospital-surgeons:latest .
```
This will use dummy environment variables during build (which is fine - real values are used at runtime).

**Option B: Build with real environment variables (recommended)**
```bash
docker build \
  --build-arg DATABASE_URL="${DATABASE_URL}" \
  --build-arg SUPABASE_URL="${SUPABASE_URL}" \
  --build-arg SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}" \
  --build-arg JWT_SECRET="${JWT_SECRET}" \
  --build-arg CRON_SECRET="${CRON_SECRET}" \
  --build-arg APP_URL="${APP_URL}" \
  -t hospital-surgeons:latest .
```

**Or load from .env.production file:**
```bash
export $(cat .env.production | xargs) && \
docker build \
  --build-arg DATABASE_URL="${DATABASE_URL}" \
  --build-arg SUPABASE_URL="${SUPABASE_URL}" \
  --build-arg SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}" \
  --build-arg JWT_SECRET="${JWT_SECRET}" \
  --build-arg CRON_SECRET="${CRON_SECRET}" \
  --build-arg APP_URL="${APP_URL}" \
  -t hospital-surgeons:latest .
```

**What this does:**
- Creates a Docker image named `hospital-surgeons` with tag `latest`
- Builds your Next.js app inside the container
- Installs all dependencies
- Uses environment variables during build (dummy values are fine - real values used at runtime)

**Expected output:**
```
[+] Building 45.2s (15/15) FINISHED
 => [builder 1/6] FROM docker.io/library/node:20-alpine
 => [builder 2/6] WORKDIR /app
 => [builder 3/6] COPY package*.json ./
 => [builder 4/6] RUN npm install --legacy-peer-deps
 => [builder 5/6] COPY . .
 => [builder 6/6] RUN npm run build
 => [stage-1 1/7] FROM docker.io/library/node:20-alpine
 => [stage-1 2/7] WORKDIR /app
 => [stage-1 3/7] COPY --from=builder /app/.next ./.next
 => [stage-1 4/7] COPY --from=builder /app/public ./public
 => [stage-1 5/7] COPY --from=builder /app/node_modules ./node_modules
 => [stage-1 6/7] COPY --from=builder /app/package*.json ./
 => [stage-1 7/7] COPY --from=builder /app/next.config.js ./next.config.js
 => exporting to image
 => => exporting layers
 => => writing image sha256:...
 => => naming to docker.io/library/hospital-surgeons:latest
```

#### Step 4: Run the Docker Container
```bash
docker run -d \
  --name hospital-surgeons-app \
  -p 3000:3000 \
  --env-file .env.production \
  hospital-surgeons:latest
```

**What this does:**
- `-d`: Runs container in detached mode (background)
- `--name`: Names the container `hospital-surgeons-app`
- `-p 3000:3000`: Maps port 3000 from container to host
- `--env-file`: Loads environment variables from `.env.production`
- `hospital-surgeons:latest`: Uses the image we built

#### Step 5: Verify Container is Running
```bash
# Check running containers
docker ps

# Check logs
docker logs hospital-surgeons-app

# Check if app is accessible
curl http://localhost:3000
```

#### Step 6: Access Your App
Open your browser and go to:
```
http://localhost:3000
```

---

### Method 2: Using Docker Compose (Recommended)

#### Step 1: Navigate to Project Directory
```bash
cd /home/bhushan/Desktop/personal/hospital-surgoen/hospital-surgeons
```

#### Step 2: Create `.env.production` File
```bash
# Create or edit .env.production with your production environment variables
nano .env.production
```

Add your environment variables:
```env
NODE_ENV=production
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
CRON_SECRET=your_cron_secret
APP_URL=http://localhost:3000
# Add all other required environment variables
```

#### Step 3: Build and Run with Docker Compose
```bash
# Build and start the container
docker-compose up -d

# Or build first, then start
docker-compose build
docker-compose up -d
```

**What this does:**
- Builds the Docker image
- Creates and starts the container
- `-d` flag runs in detached mode

#### Step 4: Check Status
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
```

#### Step 5: Access Your App
Open your browser:
```
http://localhost:3000
```

---

## Useful Docker Commands

### View Logs
```bash
# Using docker command
docker logs hospital-surgeons-app
docker logs -f hospital-surgeons-app  # Follow logs in real-time

# Using docker-compose
docker-compose logs
docker-compose logs -f  # Follow logs
```

### Stop Container
```bash
# Using docker command
docker stop hospital-surgeons-app

# Using docker-compose
docker-compose down
```

### Start Container
```bash
# Using docker command
docker start hospital-surgeons-app

# Using docker-compose
docker-compose up -d
```

### Restart Container
```bash
# Using docker command
docker restart hospital-surgeons-app

# Using docker-compose
docker-compose restart
```

### Remove Container
```bash
# Using docker command
docker stop hospital-surgeons-app
docker rm hospital-surgeons-app

# Using docker-compose
docker-compose down
```

### Remove Image
```bash
docker rmi hospital-surgeons:latest
```

### Rebuild After Code Changes
```bash
# Using docker command
docker build -t hospital-surgeons:latest .
docker stop hospital-surgeons-app
docker rm hospital-surgeons-app
docker run -d --name hospital-surgeons-app -p 3000:3000 --env-file .env.production hospital-surgeons:latest

# Using docker-compose (easier!)
docker-compose up -d --build
```

### Execute Commands Inside Container
```bash
# Open shell inside container
docker exec -it hospital-surgeons-app sh

# Run a specific command
docker exec hospital-surgeons-app npm run db:seed
```

### View Container Resource Usage
```bash
docker stats hospital-surgeons-app
```

---

## Troubleshooting

### Issue: Port 3000 Already in Use
**Solution:**
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process or use a different port
docker run -d --name hospital-surgeons-app -p 3001:3000 --env-file .env.production hospital-surgeons:latest
```

### Issue: Build Fails with "npm install" Error
**Solution:**
- Make sure `package.json` exists
- Check if you have internet connection
- Try clearing Docker cache:
  ```bash
  docker build --no-cache -t hospital-surgeons:latest .
  ```

### Issue: Container Starts but App Doesn't Work
**Solution:**
```bash
# Check logs for errors
docker logs hospital-surgeons-app

# Check if environment variables are loaded
docker exec hospital-surgeons-app env

# Verify the build was successful
docker exec hospital-surgeons-app ls -la /app/.next
```

### Issue: Environment Variables Not Loading
**Solution:**
- Make sure `.env.production` exists
- Check file format (no spaces around `=`)
- Verify you're using `--env-file` flag
- For docker-compose, check `env_file` section in `docker-compose.yml`

### Issue: Out of Memory During Build
**Solution:**
- Increase Docker memory limit in Docker Desktop settings
- Or use a smaller base image
- Or build on a machine with more RAM

---

## Production Deployment Tips

### 1. Use Environment Variables
Never hardcode secrets. Always use environment variables:
```bash
docker run -d \
  --name hospital-surgeons-app \
  -p 3000:3000 \
  -e DATABASE_URL=your_db_url \
  -e JWT_SECRET=your_secret \
  --env-file .env.production \
  hospital-surgeons:latest
```

### 2. Use Docker Secrets (for sensitive data)
For production, consider using Docker secrets or a secrets manager.

### 3. Set Up Health Checks
The `docker-compose.yml` includes a health check. Monitor it:
```bash
docker inspect --format='{{.State.Health.Status}}' hospital-surgeons-app
```

### 4. Use Reverse Proxy (Nginx)
For production, use Nginx as a reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Use Docker Networks
For connecting to databases or other services:
```bash
docker network create hospital-network
docker run -d --name hospital-surgeons-app --network hospital-network -p 3000:3000 hospital-surgeons:latest
```

---

## Quick Reference

### Build and Run (One Command)
```bash
docker build -t hospital-surgeons:latest . && docker run -d --name hospital-surgeons-app -p 3000:3000 --env-file .env.production hospital-surgeons:latest
```

### Using Docker Compose (Easiest)
```bash
docker-compose up -d --build
```

### View Logs
```bash
docker-compose logs -f
```

### Stop and Remove
```bash
docker-compose down
```

---

## Next Steps

1. ✅ Build the Docker image
2. ✅ Run the container
3. ✅ Test the application
4. ✅ Set up environment variables
5. ✅ Configure reverse proxy (if needed)
6. ✅ Set up monitoring and logging
7. ✅ Deploy to production server

---

## Support

If you encounter issues:
1. Check Docker logs: `docker logs hospital-surgeons-app`
2. Verify environment variables are set correctly
3. Ensure all required ports are accessible
4. Check Docker daemon is running: `docker ps`

