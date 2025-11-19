# Environment Files Summary

## 📁 Created Files

All environment files have been created in the **root of the project**:

1. **`.env.local`** - Local development (gitignored)
2. **`.env.development`** - Development/staging environment
3. **`.env.production`** - Production environment
4. **`.env.example`** - Template file (safe to commit)

## 🔐 Environment Variables Included

### Core Configuration
- `CORS` - Comma-separated allowed origins
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)

### JWT Authentication
- `JWT_ACCESS_TOKEN_SECRET` - Access token secret
- `JWT_REFRESH_TOKEN_SECRET` - Refresh token secret
- `JWT_SECRET` - Main JWT secret
- `JWT_ACCESS_TOKEN_EXPIRATION` - Access token expiration (default: 900s)
- `JWT_REFRESH_TOKEN_EXPIRATION` - Refresh token expiration (default: 7d)

### External Services
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SENDGRID_API_KEY` - SendGrid API key for emails

### Web Push Notifications
- `WEB_PUSH_CONTACT_EMAIL` - Contact email for push notifications
- `WEB_PUSH_VAPID_PRIVATE_KEY` - VAPID private key
- `WEB_PUSH_VAPID_PUBLIC_KEY` - VAPID public key

## 🚀 Usage

### Local Development
```bash
# .env.local is automatically loaded
npm run dev
```

### Development Environment
```bash
NODE_ENV=development npm run dev
# Uses .env.development
```

### Production
```bash
NODE_ENV=production npm start
# Uses .env.production
```

## 📝 File Priority

Next.js loads environment variables in this order (higher priority overrides lower):

1. `.env.local` ⭐ (highest priority, gitignored)
2. `.env.development` / `.env.production` (based on NODE_ENV)
3. `.env`

## ⚠️ Security Notes

- `.env.local` is gitignored - never commit it
- `.env.example` is safe to commit (contains no secrets)
- Update production values in `.env.production` before deploying
- Use strong, unique secrets for production

## 🔄 CORS Configuration

CORS is configured via the `CORS` environment variable:
```
CORS=http://localhost:4000,https://bx.artofliving.org
```

The middleware automatically handles CORS for all `/api/*` routes.

## ✅ Next Steps

1. Review `.env.local` and update any values if needed
2. Update `.env.production` with production credentials
3. Ensure all secrets are strong and unique
4. Test the API endpoints
