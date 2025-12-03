# Environment Configuration Guide

This project uses a centralized environment configuration system to separate development and production environments.

## Environment Files

### Development Environment

Create a `.env.local` file in the root directory for local development:

```env
# Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/koya_dev

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Base URL (public)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# UploadThing
NEXT_PUBLIC_UPLOADTHING_APP_ID=your_uploadthing_app_id
UPLOADTHING_SECRET=your_uploadthing_secret

# Cron Secret (optional for dev)
CRON_SECRET=dev-secret-change-in-production
```

### Production Environment

For production deployments (e.g., Vercel, Railway, etc.), set these environment variables in your hosting platform:

```env
# Environment
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/koya_prod

# Google OAuth
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# Base URL (public) - Use your production domain
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# UploadThing
NEXT_PUBLIC_UPLOADTHING_APP_ID=your_production_uploadthing_app_id
UPLOADTHING_SECRET=your_production_uploadthing_secret

# Cron Secret - Use a strong random secret in production
CRON_SECRET=your_strong_random_secret_here
```

## Environment Configuration System

All environment variables are validated and accessed through the centralized configuration file at `src/lib/env.ts`. This provides:

- **Type Safety**: Environment variables are validated using Zod schemas
- **Single Source of Truth**: All environment access goes through one place
- **Better Error Messages**: Missing or invalid environment variables are caught at startup
- **Environment Detection**: Helper flags like `config.isDevelopment` and `config.isProduction`

## Usage in Code

Instead of directly accessing `process.env`, use the centralized config:

```typescript
import config from "@/lib/env";

// Check environment
if (config.isProduction) {
  // Production-specific code
}

// Access environment variables
const dbUrl = config.database.url;
const googleClientId = config.google.clientId;
```

## Required Environment Variables

All variables listed in the `.env.local` example above are required except:

- `CRON_SECRET`: Optional, defaults to `"dev-secret-change-in-production"` in development

## Security Notes

1. **Never commit `.env.local` or `.env` files** - They are already in `.gitignore`
2. **Use different credentials** for development and production
3. **Generate strong secrets** for production (especially `CRON_SECRET`)
4. **Use HTTPS** in production - The app automatically enables secure cookies when `NODE_ENV=production`

## Deployment

When deploying to production:

1. Set all environment variables in your hosting platform's dashboard
2. Ensure `NODE_ENV=production` is set
3. Use production URLs for `NEXT_PUBLIC_BASE_URL`
4. Use production credentials for all services (Google OAuth, UploadThing, Database)
