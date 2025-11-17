# Arqon Backend API

RESTful API server for the Arqon app, providing database-backed storage and synchronization for all devices.

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A random secret key for JWT tokens
- `CORS_ORIGIN`: Allowed origins (comma-separated)

### 3. Setup Database

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE arqon_db;
```

Or using psql:
```bash
createdb arqon_db
```

### 4. Run Migrations

```bash
npm run db:migrate
```

This will create all necessary tables.

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

This creates an admin user and sample data.

### 6. Start Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Server will run on `http://localhost:3001` (or the PORT you configured).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Data

- `GET /api/data/state` - Get all app state (requires auth)
- `POST /api/data/state` - Save app state (requires auth)

All data endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

The database includes tables for:
- Users (authentication)
- Materials
- Recipes & Recipe Lines
- Products & Product Variants
- Categories
- Lab Entries
- Proposals
- Pages (CMS)
- Settings

All user data is isolated by `user_id` for multi-user support.

## Frontend Integration

The frontend stores (`src/store.ts` and `arqon-mobile/src/store.ts`) need to be updated to call these API endpoints instead of using local storage.

See the frontend integration guide for details.

