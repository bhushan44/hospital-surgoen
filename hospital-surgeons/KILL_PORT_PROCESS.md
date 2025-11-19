# How to Kill Processes Using Port 3000

## Quick Reference

### Find Process Using Port 3000
```bash
# Method 1: Using ss (modern, recommended)
ss -tulpn | grep :3000

# Method 2: Using lsof
lsof -i :3000

# Method 3: Using netstat (if installed)
netstat -tulpn | grep :3000
```

### Kill Process by Port
```bash
# Method 1: Find PID and kill
kill $(lsof -t -i:3000)

# Method 2: Force kill
kill -9 $(lsof -t -i:3000)

# Method 3: Using fuser
fuser -k 3000/tcp

# Method 4: Using pkill (if you know it's Next.js)
pkill -f "next dev"
pkill -f "next-server"
```

---

## Detailed Steps (What We Did)

### Step 1: Find What's Using Port 3000

**Command:**
```bash
ss -tulpn | grep :3000
```

**Output:**
```
tcp   LISTEN 0      511                *:3000             *:*    users:(("next-server (v1",pid=13921,fd=19))
```

**What it shows:**
- Process name: `next-server`
- Process ID (PID): `13921`
- Port: `3000` (LISTEN state)

**Alternative command:**
```bash
lsof -i :3000
```

**Output:**
```
COMMAND   PID    USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
next-server 13921 bhushan   19u  IPv6 155994      0t0  TCP *:3000 (LISTEN)
```

---

### Step 2: Get More Details About the Process

**Command:**
```bash
ps aux | grep 13921 | grep -v grep
```

**Output:**
```
bhushan    13921  1.9  6.1 37525740 996880 ?     Sl   11:55   1:16 next-server (v16.0.3)
```

**What it shows:**
- User: `bhushan`
- PID: `13921`
- Process: `next-server (v16.0.3)`
- Memory usage: ~996MB
- CPU: 1.9%

---

### Step 3: Kill the Process

**Method 1: Graceful Kill (Recommended)**
```bash
kill 13921
```
- Sends SIGTERM signal
- Allows process to clean up gracefully
- May take a few seconds

**Method 2: Force Kill (If graceful doesn't work)**
```bash
kill -9 13921
```
- Sends SIGKILL signal
- Immediate termination
- No cleanup (use as last resort)

**Method 3: Kill by Port (One-liner)**
```bash
kill $(lsof -t -i:3000)
# or force kill
kill -9 $(lsof -t -i:3000)
```

---

### Step 4: Remove Lock Files (For Next.js)

**Problem:**
Next.js creates a lock file to prevent multiple instances:
```
⨯ Unable to acquire lock at .next/dev/lock, is another instance of next dev running?
```

**Solution:**
```bash
cd /path/to/your/project
rm -f .next/dev/lock
```

**Full path in our case:**
```bash
cd /home/bhushan/Desktop/personal/hospital-surgoen/hospital-surgeons
rm -f .next/dev/lock
```

---

### Step 5: Verify Port is Free

**Command:**
```bash
ss -tulpn | grep :3000
```

**Expected output:**
```
(empty - no output means port is free)
```

**Or check if process still exists:**
```bash
ps aux | grep 13921 | grep -v grep
```

**Expected output:**
```
(empty - process is gone)
```

---

## Complete Workflow (What We Did)

### 1. Identified the Problem
```bash
# Found process on port 3000
ss -tulpn | grep :3000
# Result: PID 13921 (next-server)
```

### 2. Checked Process Details
```bash
ps aux | grep 13921 | grep -v grep
# Result: next-server (v16.0.3) running
```

### 3. Attempted Graceful Kill
```bash
kill 13921
# Process was already terminated or didn't respond
```

### 4. Force Killed (if needed)
```bash
kill -9 13921
# Result: "No such process" (already dead)
```

### 5. Removed Lock File
```bash
cd /home/bhushan/Desktop/personal/hospital-surgoen/hospital-surgeons
rm -f .next/dev/lock
# Lock file removed
```

### 6. Verified Port is Free
```bash
ss -tulpn | grep :3000
# Result: (empty - port is free)
```

---

## Common Scenarios

### Scenario 1: Next.js Dev Server Won't Start
**Symptoms:**
- Port 3000 already in use
- Lock file error

**Solution:**
```bash
# Kill all Next.js processes
pkill -f "next dev"
pkill -f "next-server"

# Remove lock file
rm -f .next/dev/lock

# Verify
ss -tulpn | grep :3000
```

### Scenario 2: Multiple Node Processes
**Find all Node/Next.js processes:**
```bash
ps aux | grep -E "node|next" | grep -v grep
```

**Kill all:**
```bash
pkill -f "node"
pkill -f "next"
```

### Scenario 3: Permission Denied
**If you get "Permission denied":**
```bash
# Use sudo (be careful!)
sudo kill -9 $(lsof -t -i:3000)
sudo fuser -k 3000/tcp
```

---

## Useful Commands Reference

| Command | Purpose |
|---------|---------|
| `ss -tulpn \| grep :3000` | Find what's using port 3000 |
| `lsof -i :3000` | List open files/processes on port 3000 |
| `kill PID` | Graceful kill (SIGTERM) |
| `kill -9 PID` | Force kill (SIGKILL) |
| `kill $(lsof -t -i:3000)` | Kill by port (one-liner) |
| `fuser -k 3000/tcp` | Kill process using port 3000 |
| `pkill -f "pattern"` | Kill processes matching pattern |
| `ps aux \| grep PID` | Check if process exists |
| `rm -f .next/dev/lock` | Remove Next.js lock file |

---

## Prevention Tips

1. **Always stop dev server properly:**
   ```bash
   # Press Ctrl+C in the terminal running npm run dev
   ```

2. **Use a process manager:**
   ```bash
   # Use PM2 for Node.js apps
   pm2 stop all
   pm2 delete all
   ```

3. **Check before starting:**
   ```bash
   # Quick check
   ss -tulpn | grep :3000 || echo "Port 3000 is free"
   ```

4. **Use different ports:**
   ```bash
   # Start on different port
   PORT=3001 npm run dev
   ```

---

## Troubleshooting

### "No such process" Error
- Process already terminated
- Check with `ps aux | grep PID`

### "Permission denied" Error
- Process owned by different user
- Use `sudo` (with caution)
- Or switch to the user who owns the process

### Port Still in Use After Kill
- Process might be restarting
- Check for process managers (PM2, systemd)
- Check parent processes

### Lock File Persists
- Manually remove: `rm -f .next/dev/lock`
- Or delete entire `.next` folder: `rm -rf .next`

---

## Summary

**Quick kill process on port 3000:**
```bash
# One-liner solution
kill -9 $(lsof -t -i:3000) && rm -f .next/dev/lock
```

**Or step by step:**
```bash
# 1. Find PID
ss -tulpn | grep :3000

# 2. Kill process
kill -9 <PID>

# 3. Remove lock (if Next.js)
rm -f .next/dev/lock

# 4. Verify
ss -tulpn | grep :3000
```

---

## What We Did (Step-by-Step)

1. ✅ Found process: `ss -tulpn | grep :3000` → PID 13921
2. ✅ Checked details: `ps aux | grep 13921` → next-server v16.0.3
3. ✅ Killed process: `kill -9 13921` → Process terminated
4. ✅ Removed lock: `rm -f .next/dev/lock` → Lock file deleted
5. ✅ Verified: `ss -tulpn | grep :3000` → Port 3000 is free

**Result:** Port 3000 is now available for your Next.js dev server! 🎉



