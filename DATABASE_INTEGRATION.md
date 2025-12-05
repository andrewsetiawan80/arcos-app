# Database Integration Complete ✅

The app now uses a PostgreSQL database backend instead of local storage. All devices (web and mobile) sync to one central database source.

## What Was Changed

### Backend (`/backend`)
- ✅ Node.js + Express + TypeScript server
- ✅ PostgreSQL database with migrations
- ✅ JWT authentication
- ✅ REST API endpoints for all data operations
- ✅ User isolation (each user has their own data)

### Frontend Stores
- ✅ **Web app** (`src/store.ts`): Now uses API calls instead of localStorage
- ✅ **Mobile app** (`arcos-mobile/src/store.ts`): Now uses API calls instead of AsyncStorage
- ✅ **Web auth** (`src/state/auth.ts`): Now uses API authentication
- ✅ **Mobile auth** (`arcos-mobile/src/store/auth.ts`): Now uses API authentication
- ✅ **Login screens**: Updated to use email/password authentication

### API Clients
- ✅ `src/lib/api.ts` - Web app API client
- ✅ `arcos-mobile/src/lib/api.ts` - Mobile app API client

## Setup Instructions

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:** Download from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE arcos_db;

# Exit
\q
```

### 3. Configure Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://your_username@localhost:5432/arcos_db
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGIN=http://localhost:5173,http://localhost:8081
```

### 4. Run Migrations & Seed

```bash
cd backend
npm run db:migrate
npm run db:seed
```

This creates:
- All database tables
- Admin user: `admin@arcos.com` / `admin123`

### 5. Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:3001`

### 6. Configure Frontend

**Web app:**
Create `.env` file in root:
```env
VITE_API_URL=http://localhost:3001/api
```

**Mobile app:**
Create `.env` file in `arcos-mobile`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

For mobile devices on same network, use your computer's IP:
```env
EXPO_PUBLIC_API_URL=http://192.168.2.189:3001/api
```

## Usage

### Login
- **Email**: `admin@arcos.com`
- **Password**: `admin123`

### Data Sync
- All data is automatically synced to the database
- Changes on one device will appear on all other devices
- No more local-only storage

## API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user
- `GET /api/data/state` - Get all app data
- `POST /api/data/state` - Save app data

All data endpoints require JWT authentication.

## Production Deployment

For production:
1. Use a managed PostgreSQL service (AWS RDS, DigitalOcean, etc.)
2. Set strong `JWT_SECRET`
3. Update `CORS_ORIGIN` to production domains
4. Use environment variables for all config
5. Enable SSL for database connections

## Troubleshooting

**Database connection failed:**
- Check PostgreSQL is running: `psql -l`
- Verify DATABASE_URL in `.env`
- Check database exists: `psql -l | grep arcos_db`

**API not working:**
- Check backend server is running: `curl http://localhost:3001/health`
- Verify CORS_ORIGIN includes your frontend URL
- Check browser console for CORS errors

**Authentication fails:**
- Verify JWT_SECRET is set
- Check token is being sent in Authorization header
- Verify user exists in database

