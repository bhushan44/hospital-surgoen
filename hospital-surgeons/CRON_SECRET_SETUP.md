# CRON_SECRET Setup Guide

## Generated Secret

Your secure CRON_SECRET has been generated:
```
d9bb2dba68e206c46408944f610932c391b67be4e27268f6ae2c0782bfe9930f
```

## Setup Instructions

### 1. GitHub Secrets (for GitHub Actions)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

   **Secret 1: CRON_SECRET**
   - Name: `CRON_SECRET`
   - Value: `d9bb2dba68e206c46408944f610932c391b67be4e27268f6ae2c0782bfe9930f`

   **Secret 2: APP_URL**
   - Name: `APP_URL`
   - Value: `https://your-actual-app-url.com` (replace with your deployed app URL)

### 2. Production Environment Variables

Add `CRON_SECRET` to your production environment:

#### For Render:
1. Go to your Render dashboard
2. Select your service
3. Go to **Environment** tab
4. Add environment variable:
   - Key: `CRON_SECRET`
   - Value: `d9bb2dba68e206c46408944f610932c391b67be4e27268f6ae2c0782bfe9930f`

#### For Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - Key: `CRON_SECRET`
   - Value: `d9bb2dba68e206c46408944f610932c391b67be4e27268f6ae2c0782bfe9930f`
   - Environment: Production (and Preview if needed)

#### For Other Platforms:
Add `CRON_SECRET` as an environment variable with the same value.

### 3. Local Development (Optional)

If you want to test the cron endpoint locally, add to your `.env.local`:

```bash
CRON_SECRET=d9bb2dba68e206c46408944f610932c391b67be4e27268f6ae2c0782bfe9930f
```

**⚠️ Important:** Never commit `.env.local` to git (it's already in `.gitignore`)

## Testing

### Test the Endpoint Manually:

```bash
curl -X GET \
  -H "x-cron-secret: d9bb2dba68e206c46408944f610932c391b67be4e27268f6ae2c0782bfe9930f" \
  "https://your-app-url.com/api/cron/expire-assignments"
```

### Test with Wrong Secret (should return 401):

```bash
curl -X GET \
  -H "x-cron-secret: wrong-secret" \
  "https://your-app-url.com/api/cron/expire-assignments"
```

## Security Notes

- ✅ The secret is 64 characters long (32 bytes in hex)
- ✅ It's cryptographically secure (generated with OpenSSL)
- ✅ Never share this secret publicly
- ✅ Use the same secret in both GitHub Secrets and your production environment
- ✅ If compromised, generate a new one: `openssl rand -hex 32`

## Generate New Secret (if needed)

If you need to generate a new secret:

```bash
openssl rand -hex 32
```

Then update both GitHub Secrets and your production environment variables.

