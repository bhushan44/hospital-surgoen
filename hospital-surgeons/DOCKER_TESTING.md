# Docker Testing Guide

## Quick Test Steps

### Step 1: Build the Docker Image
```bash
cd /home/bhushan/Desktop/personal/hospital-surgoen/hospital-surgeons
docker build -t hospital-surgeons:latest .
```

**Expected:** Should complete without errors, showing "Successfully built" message.

---

### Step 2: Run the Container
```bash
docker run -d \
  --name hospital-surgeons-app \
  -p 3000:3000 \
  --env-file .env.production \
  hospital-surgeons:latest
```

**Or using Docker Compose:**
```bash
docker-compose up -d
```

---

### Step 3: Check Container Status
```bash
# Check if container is running
docker ps

# Should show something like:
# CONTAINER ID   IMAGE                      STATUS         PORTS                    NAMES
# abc123def456   hospital-surgeons:latest   Up 2 minutes   0.0.0.0:3000->3000/tcp   hospital-surgeons-app
```

---

### Step 4: Check Container Logs
```bash
# View logs
docker logs hospital-surgeons-app

# Or follow logs in real-time
docker logs -f hospital-surgeons-app

# Using docker-compose
docker-compose logs -f
```

**Expected Output:**
```
> hospital-surgeons@0.1.0 start
> next start

   ▲ Next.js 16.0.3
   - Local:        http://localhost:3000
   - Environments: production

 ✓ Ready in 2.5s
```

---

### Step 5: Test the Application

#### Test 1: Check if Server is Running
```bash
# Using curl
curl http://localhost:3000

# Or using wget
wget -O- http://localhost:3000

# Expected: Should return HTML content (status 200)
```

#### Test 2: Test in Browser
Open your browser and go to:
```
http://localhost:3000
```

**Expected:** Should see your Next.js app homepage.

#### Test 3: Test API Endpoints
```bash
# Test health endpoint (if you have one)
curl http://localhost:3000/api/health

# Test a specific API endpoint
curl http://localhost:3000/api/users/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

#### Test 4: Check Container Health
```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' hospital-surgeons-app

# Or using docker-compose
docker-compose ps
```

---

## Comprehensive Testing Checklist

### ✅ Container Build Test
- [ ] Docker image builds successfully
- [ ] No build errors or warnings
- [ ] Image size is reasonable (check with `docker images`)

### ✅ Container Run Test
- [ ] Container starts without errors
- [ ] Container stays running (check with `docker ps`)
- [ ] Port 3000 is accessible

### ✅ Application Test
- [ ] Homepage loads in browser
- [ ] No console errors in browser
- [ ] API endpoints respond correctly
- [ ] Database connections work (if applicable)
- [ ] Environment variables are loaded correctly

### ✅ Logs Test
- [ ] No error messages in logs
- [ ] Application starts successfully
- [ ] No missing environment variable warnings

### ✅ Performance Test
- [ ] Container uses reasonable memory (check with `docker stats`)
- [ ] Response times are acceptable
- [ ] No memory leaks (monitor over time)

---

## Testing Commands Reference

### Basic Tests
```bash
# 1. Build test
docker build -t hospital-surgeons:latest .

# 2. Run test
docker run -d --name hospital-surgeons-app -p 3000:3000 --env-file .env.production hospital-surgeons:latest

# 3. Status test
docker ps | grep hospital-surgeons

# 4. Logs test
docker logs hospital-surgeons-app

# 5. HTTP test
curl -I http://localhost:3000

# 6. Stop test
docker stop hospital-surgeons-app

# 7. Remove test
docker rm hospital-surgeons-app
```

### Advanced Tests
```bash
# Test container restart
docker restart hospital-surgeons-app
sleep 5
curl http://localhost:3000

# Test environment variables
docker exec hospital-surgeons-app env | grep DATABASE_URL

# Test file system
docker exec hospital-surgeons-app ls -la /app/.next

# Test network connectivity
docker exec hospital-surgeons-app ping -c 3 google.com

# Test resource usage
docker stats hospital-surgeons-app --no-stream
```

---

## Common Test Scenarios

### Scenario 1: Fresh Build Test
```bash
# Remove old container and image
docker stop hospital-surgeons-app
docker rm hospital-surgeons-app
docker rmi hospital-surgeons:latest

# Build fresh
docker build -t hospital-surgeons:latest .

# Run
docker run -d --name hospital-surgeons-app -p 3000:3000 --env-file .env.production hospital-surgeons:latest

# Test
curl http://localhost:3000
```

### Scenario 2: Code Change Test
```bash
# Make a code change
# Then rebuild
docker build -t hospital-surgeons:latest .

# Restart container
docker stop hospital-surgeons-app
docker rm hospital-surgeons-app
docker run -d --name hospital-surgeons-app -p 3000:3000 --env-file .env.production hospital-surgeons:latest

# Test changes
curl http://localhost:3000
```

### Scenario 3: Environment Variable Test
```bash
# Run with specific env vars
docker run -d \
  --name hospital-surgeons-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=test_url \
  hospital-surgeons:latest

# Verify env vars are set
docker exec hospital-surgeons-app env | grep DATABASE_URL
```

### Scenario 4: Port Conflict Test
```bash
# Test with different port
docker run -d \
  --name hospital-surgeons-app \
  -p 3001:3000 \
  --env-file .env.production \
  hospital-surgeons:latest

# Test on new port
curl http://localhost:3001
```

---

## Automated Testing Script

Create a test script `test-docker.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Docker Setup..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Build
echo "1️⃣ Testing build..."
docker build -t hospital-surgeons:latest . > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Test 2: Run
echo "2️⃣ Testing container start..."
docker run -d --name hospital-surgeons-test -p 3000:3000 --env-file .env.production hospital-surgeons:latest > /dev/null 2>&1
sleep 5

if docker ps | grep -q hospital-surgeons-test; then
    echo -e "${GREEN}✅ Container running${NC}"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    docker logs hospital-surgeons-test
    exit 1
fi

# Test 3: HTTP Response
echo "3️⃣ Testing HTTP response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
else
    echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
fi

# Test 4: Logs
echo "4️⃣ Checking logs..."
if docker logs hospital-surgeons-test 2>&1 | grep -q "Ready"; then
    echo -e "${GREEN}✅ Application ready${NC}"
else
    echo -e "${RED}❌ Application not ready${NC}"
    docker logs hospital-surgeons-test
fi

# Cleanup
echo "5️⃣ Cleaning up..."
docker stop hospital-surgeons-test > /dev/null 2>&1
docker rm hospital-surgeons-test > /dev/null 2>&1
echo -e "${GREEN}✅ Cleanup complete${NC}"

echo ""
echo -e "${GREEN}🎉 All tests passed!${NC}"
```

**Make it executable and run:**
```bash
chmod +x test-docker.sh
./test-docker.sh
```

---

## Troubleshooting Tests

### Test Fails: Build Error
```bash
# Check Dockerfile syntax
docker build --no-cache -t hospital-surgeons:latest .

# Check for missing files
ls -la package.json
ls -la next.config.js
```

### Test Fails: Container Won't Start
```bash
# Check logs
docker logs hospital-surgeons-app

# Check if port is in use
sudo lsof -i :3000

# Try different port
docker run -d --name hospital-surgeons-app -p 3001:3000 --env-file .env.production hospital-surgeons:latest
```

### Test Fails: Application Not Responding
```bash
# Check if container is running
docker ps

# Check logs for errors
docker logs -f hospital-surgeons-app

# Check environment variables
docker exec hospital-surgeons-app env

# Test from inside container
docker exec hospital-surgeons-app wget -O- http://localhost:3000
```

---

## Quick Test Commands (Copy & Paste)

```bash
# Complete test in one go
docker build -t hospital-surgeons:latest . && \
docker run -d --name hospital-surgeons-test -p 3000:3000 --env-file .env.production hospital-surgeons:latest && \
sleep 5 && \
curl -I http://localhost:3000 && \
docker logs hospital-surgeons-test && \
docker stop hospital-surgeons-test && \
docker rm hospital-surgeons-test
```

---

## Using Docker Compose for Testing

```bash
# Build and start
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test
curl http://localhost:3000

# Stop
docker-compose down
```

---

## Expected Test Results

### ✅ Successful Test Output:
```
✅ Build successful
✅ Container running
✅ HTTP 200 OK
✅ Application ready
✅ All tests passed!
```

### ❌ Failed Test Output:
```
❌ Build failed
❌ Container failed to start
❌ HTTP 500
❌ Application not ready
```

---

## Next Steps After Testing

1. ✅ All tests pass → Ready for deployment
2. ❌ Tests fail → Check logs and fix issues
3. ⚠️  Partial failures → Investigate specific issues

---

## Need Help?

If tests fail:
1. Check `docker logs hospital-surgeons-app`
2. Verify environment variables in `.env.production`
3. Ensure port 3000 is not in use
4. Check Docker daemon is running: `docker ps`

