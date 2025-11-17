# Quick Start - Database Integration

## 1. Install PostgreSQL

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Linux
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npm run db:migrate
npm run db:seed
npm run dev
```

## 3. Configure Frontend

**Web app:**
```bash
# Create .env file in root
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

**Mobile app:**
```bash
# Create .env file in arqon-mobile
cd arqon-mobile
echo "EXPO_PUBLIC_API_URL=http://localhost:3001/api" > .env
```

## 4. Login

- Email: `admin@arqon.com`
- Password: `admin123`

## Done! 🎉

All devices now sync to the same database. See `DATABASE_INTEGRATION.md` for full details.

