# ABN Community — Backend API

Node.js · Express · SQLite (better-sqlite3) · JWT

---

## Quick Start

```bash
# 1 — Go into the backend folder
cd backend

# 2 — Install dependencies
npm install

# 3 — Seed the database with all demo data
npm run seed

# 4 — Start the development server (auto-reload)
npm run dev

# OR start in production mode
npm start
```

The API will be live at **http://localhost:3001/api**

---

## Demo Accounts (seeded by `npm run seed`)

| Email | Password | Role |
|---|---|---|
| `business@shiadirectory.com` | `password123` | Business Owner ($50/mo) |
| `service@shiadirectory.com` | `password123` | Service Provider ($30/mo) |
| `admin@shiadirectory.com` | `admin123` | Admin |

---

## Folder Structure

```
backend/
├── server.js              ← Express entry point
├── db.js                  ← SQLite init + schema + helpers
├── seed.js                ← Seeds all demo data from mockData
├── .env                   ← Environment variables (not committed)
├── .env.example           ← Template — copy to .env
├── data/
│   └── directory.db       ← Auto-created on first run
├── middleware/
│   └── authMiddleware.js  ← JWT verify + requireRole guard
└── routes/
    ├── auth.js            ← POST /register  POST /login  GET /me
    ├── businesses.js      ← Full CRUD for business listings
    ├── categories.js      ← List / create / delete categories
    ├── reviews.js         ← List reviews + add review
    ├── favorites.js       ← User favorites toggle
    ├── payments.js        ← Payment records
    ├── notifications.js   ← App notifications
    ├── jobs.js            ← Job postings CRUD
    └── hiring.js          ← Toggle hiring active per business
```

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in → returns JWT |
| GET | `/api/auth/me` | ✓ | Current user profile |
| PUT | `/api/auth/me` | ✓ | Update name / phone / language |

### Businesses
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/businesses` | — | List all (filter: `?city=&categoryId=&search=`) |
| GET | `/api/businesses/mine` | ✓ | Your own listing |
| GET | `/api/businesses/:id` | — | Single listing |
| POST | `/api/businesses` | ✓ business/sp | Create listing |
| PUT | `/api/businesses/:id` | ✓ owner/admin | Update listing |
| DELETE | `/api/businesses/:id` | ✓ owner/admin | Delete listing |

### Jobs
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/jobs` | — | Public active jobs (filter: `?category=`) |
| GET | `/api/jobs/my` | ✓ business | Your posted jobs |
| GET | `/api/jobs/:id` | — | Single job |
| POST | `/api/jobs` | ✓ business | Post new job |
| PUT | `/api/jobs/:id` | ✓ business | Edit own job |
| DELETE | `/api/jobs/:id` | ✓ business | Delete own job |

### Hiring
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/hiring/:bizId` | — | Hiring active state |
| PUT | `/api/hiring/:bizId` | ✓ business | Toggle hiring on/off |

### Other routes
- `GET/POST /api/reviews` — business reviews
- `GET/POST/DELETE /api/favorites/:bizId` — user favorites
- `GET/POST /api/payments` — payment records
- `GET/POST/PUT/DELETE /api/notifications` — notifications
- `GET/POST/DELETE /api/categories` — directory categories

---

## Environment Variables

| Key | Default | Description |
|-----|---------|-------------|
| `PORT` | `3001` | Server port |
| `FRONTEND_URL` | `http://localhost:5173` | CORS origin |
| `JWT_SECRET` | `dev-secret-...` | **Change in production!** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `DB_PATH` | `./data/directory.db` | SQLite file path |
| `NODE_ENV` | `development` | `production` silences dev logging |

---

## Connecting the React Frontend

Add this to your Vite app's `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

Then replace `localStorage` / context calls with `fetch`:

```ts
// Login example
const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { token, user } = await res.json();
localStorage.setItem('token', token);
```
