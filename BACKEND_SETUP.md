# Backend Database Setup Guide

This guide will help you set up the backend database for the Arqon app so all devices can sync to one central source.

## Prerequisites

1. **PostgreSQL** installed and running
   - macOS: `brew install postgresql@14 && brew services start postgresql@14`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Download from https://www.postgresql.org/download/windows/

2. **Node.js** (v18 or higher)

## Setup Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE arqon_db;

# Create user (optional)
CREATE USER arqon_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE arqon_db TO arqon_user;

# Exit psql
\q
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and update:
```env
DATABASE_URL=postgresql://arqon_user:your_password@localhost:5432/arqon_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173,http://localhost:8081
```

### 4. Run Migrations

```bash
npm run db:migrate
```

This creates all database tables.

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

This creates:
- Admin user (email: `admin@arqon.com`, password: `admin123`)
- Sample materials
- Sample categories

### 6. Start Backend Server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

### 7. Update Frontend to Use API

The frontend stores need to be updated to use the API. See integration steps below.

## Frontend Integration

### Web App

1. Create `.env` file in root:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

2. Update `src/store.ts` to use API calls (see updated store file)

### Mobile App

1. Create `.env` file in `arqon-mobile`:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3001/api
   ```

   For production, use your server's IP/domain:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.2.189:3001/api
   ```

2. Update `arqon-mobile/src/store.ts` to use API calls

## Testing

1. **Test API**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Test Login**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@arqon.com","password":"admin123"}'
   ```

## Production Deployment

For production:

1. Use a managed PostgreSQL service (AWS RDS, DigitalOcean, etc.)
2. Set strong `JWT_SECRET`
3. Update `CORS_ORIGIN` to your production domains
4. Use environment variables for all sensitive config
5. Enable SSL for database connections
6. Set up proper firewall rules

## API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user
- `GET /api/data/state` - Get all app data
- `POST /api/data/state` - Save app data

All data endpoints require JWT authentication in the `Authorization: Bearer <token>` header.

