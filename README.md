# ARCOS — Architectural Concrete Solutions

Full-stack web application for managing an architectural concrete business: public marketing site, internal admin dashboard, and React Native mobile app.

## Architecture

```
Browser / Mobile
    │
    ├── Public site (React, Vite)  → /
    ├── Admin dashboard            → /app/*
    └── Mobile app (Expo)          → arcos-mobile/
         │
         ▼
    Nginx (port 80)
    ├── Static files (dist/)
    └── /api → Express backend (port 3001)
                  │
                  ▼
             PostgreSQL
```

**Frontend:** React 19, Vite, Tailwind CSS, Zustand, React Router, `@react-pdf/renderer`
**Backend:** Express, PostgreSQL (`pg`), JWT auth, Nodemailer, Zod validation
**Mobile:** Expo 54, React Navigation, Zustand

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm

### Setup

```bash
# Install frontend deps
npm install

# Install backend deps
cd backend && npm install && cd ..

# Configure environment
cp .env.production .env
# Edit .env with your database credentials

# Run migrations
cd backend && npx ts-node src/db/migrate.ts && cd ..

# Start dev servers (two terminals)
npm run dev              # Frontend on :5173
cd backend && npm run dev  # Backend on :3001
```

### Mobile App

```bash
cd arcos-mobile
npm install
npx expo start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | — |
| `JWT_SECRET` | JWT signing secret | — |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | `http://localhost:5173` |
| `VITE_API_URL` | Frontend API base URL | `/api` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password (app password for Gmail) | — |
| `CONTACT_EMAIL` | Contact form recipient | `info@arcosworks.com` |

SMTP settings can also be configured at runtime via **Settings > Mail Settings** in the admin UI.

## Deployment

Deploy to a Proxmox LXC (or any Docker host):

```bash
./deploy-fullstack-now.sh
```

This script:
1. Builds frontend (`npm run build`)
2. Bundles frontend + backend into a tarball
3. Uploads to the server via SCP
4. Runs `docker compose up` (PostgreSQL, backend, nginx)

Default admin credentials after deploy: `admin@arcos.com` / `admin123`

## Project Structure

```
src/                      # Frontend (React + Vite)
├── components/           # Shared UI components
├── pages/                # Internal admin pages
├── public/               # Public-facing pages
├── lib/api.ts            # API client
├── state/                # Zustand stores (auth, ui)
├── i18n/                 # Internationalization
└── App.tsx               # Routes

backend/                  # Express API
├── src/
│   ├── routes/           # API route handlers
│   ├── middleware/        # Auth, RBAC
│   ├── db/               # Migrations, seeds, client
│   └── index.ts          # Server entry
└── package.json

arcos-mobile/             # React Native (Expo)
├── src/
│   ├── screens/          # App screens
│   ├── components/       # Shared components
│   ├── navigation/       # React Navigation config
│   ├── lib/api.ts        # API client
│   └── store/            # Zustand stores
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Current user

### Data (authenticated)
- `GET /api/data/state` — Full app state
- `POST /api/data/state` — Save app state

### Clients (admin, sales)
- `GET /api/clients` — List
- `POST /api/clients` — Create
- `PUT /api/clients/:id` — Update
- `DELETE /api/clients/:id` — Delete

### Quotes (admin, sales)
- `GET /api/quotes` — List
- `POST /api/quotes` — Create
- `PUT /api/quotes/:id` — Update
- `DELETE /api/quotes/:id` — Delete
- `GET /api/quotes/share/:token` — Public quote view
- `POST /api/quotes/share/:token/respond` — Approve/reject

### Notifications (authenticated)
- `GET /api/notifications` — List
- `GET /api/notifications/unread-count` — Unread count
- `POST /api/notifications/:id/read` — Mark read
- `POST /api/notifications/read-all` — Mark all read

### Webhooks (admin)
- `GET /api/webhooks` — List
- `POST /api/webhooks` — Create
- `PUT /api/webhooks/:id` — Update
- `DELETE /api/webhooks/:id` — Delete

### Public (no auth)
- `GET /api/data/public/products` — Public product catalog
- `GET /api/data/public/settings` — Public site settings
- `GET /api/inspiration/categories` — Inspiration categories
- `GET /api/inspiration/images` — Inspiration images
- `GET /api/faq/categories` — FAQ categories
- `GET /api/faq/items` — FAQ items
- `GET /api/featured-projects` — Featured projects
- `GET /api/services` — Services
- `GET /api/about/milestones` — About milestones
- `GET /api/about/highlights` — About highlights
- `POST /api/contact` — Submit contact form

### System (admin)
- `GET/POST /api/backups` — Backup management
- `GET/PUT /api/settings/mail` — SMTP configuration
- `POST /api/projects/:id/share` — Generate share token
- `GET /api/projects/share/:token` — Public project view

## RBAC Roles

| Role | Access |
|------|--------|
| `admin` | Full access |
| `sales` | Clients, Quotes, Proposals |
| `engineer` | Recipes, Lab, Studio |
| `production` | Production planner, recipes (read-only) |

## License

Proprietary.
