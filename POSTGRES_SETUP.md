# Local PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for local development on Windows.

## Quick Start: Create .env.local

First, create a `.env.local` file in the root directory with this content:

```env
# Environment
NODE_ENV=development

# Database - Update with your local PostgreSQL credentials
# Format: postgresql://username:password@localhost:5432/database_name
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/koya_dev

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

**Important:** Update the `DATABASE_URL` with your actual PostgreSQL password after installation.

## Step 1: Install PostgreSQL

### Option A: Using PostgreSQL Installer (Recommended for Windows)

1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. **Remember the password** you set for the `postgres` superuser account
4. Make sure PostgreSQL service is running (it should start automatically)

### Option B: Using Chocolatey (If you have it installed)

```bash
choco install postgresql
```

### Option C: Using Docker (If you have Docker Desktop)

```bash
docker run --name koya-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=koya_dev -p 5432:5432 -d postgres:16
```

## Step 2: Create the Database

### Using psql (Command Line)

1. Open PowerShell or Command Prompt
2. Connect to PostgreSQL (use the password you set during installation):

```bash
psql -U postgres
```

3. Create the database:

```sql
CREATE DATABASE koya_dev;
```

4. Exit psql:

```sql
\q
```

### Using pgAdmin (GUI)

1. Open pgAdmin (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name it `koya_dev`
5. Click "Save"

## Step 3: Update .env.local

Update the `DATABASE_URL` in `.env.local` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/koya_dev
```

**Default values:**
- Username: `postgres`
- Password: (the one you set during installation)
- Host: `localhost`
- Port: `5432`
- Database: `koya_dev`

**Example:**
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/koya_dev
```

## Step 4: Run Prisma Migrations

After setting up the database, run the migrations to create all tables:

```bash
bun run prisma migrate dev
```

This will:
- Apply all pending migrations
- Generate the Prisma Client
- Set up your database schema

## Step 5: (Optional) Seed the Database

If you want to populate the database with sample data:

```bash
bun run seed
```

## Verify Installation

To verify everything is working:

1. Check if PostgreSQL is running:
   - Open Services (Win + R → `services.msc`)
   - Look for "postgresql-x64-XX" service (should be Running)

2. Test the connection:
```bash
bun run prisma studio
```
This will open Prisma Studio in your browser where you can view and edit your database.

## Troubleshooting

### "Connection refused" or "Cannot connect to database"

- Make sure PostgreSQL service is running
- Check if the port 5432 is correct
- Verify your username and password in `DATABASE_URL`

### "Database does not exist"

- Make sure you created the `koya_dev` database (see Step 2)

### "Password authentication failed"

- Double-check your password in `DATABASE_URL`
- Try resetting the postgres password:
  1. Open `pg_hba.conf` (usually in `C:\Program Files\PostgreSQL\XX\data\`)
  2. Change `md5` to `trust` temporarily
  3. Restart PostgreSQL service
  4. Connect and change password: `ALTER USER postgres PASSWORD 'newpassword';`
  5. Change `pg_hba.conf` back to `md5`
  6. Restart PostgreSQL service again

### Port 5432 already in use

- Another PostgreSQL instance might be running
- Check what's using the port: `netstat -ano | findstr :5432`
- Stop the conflicting service or change PostgreSQL port

## Useful Commands

```bash
# Generate Prisma Client (after schema changes)
bun run prisma generate

# Create a new migration
bun run prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
bun run prisma migrate reset

# Open Prisma Studio (database GUI)
bun run prisma studio

# View database status
bun run prisma migrate status
```

