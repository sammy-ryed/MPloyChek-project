# Mpoly – Unified Business Management Portal

A full-stack **Angular 14 + Node.js** Single Page Application featuring:

- **Role-based access control** (Admin / General User)
- **JWT authentication** with session storage
- **XML-backed REST API** (Node/Express + xml2js)
- **Async API simulation** via configurable `?delay=<ms>` parameter
- **Lazy-loaded feature modules** (Auth, Dashboard, Admin)
- **Angular Material** UI with custom SCSS design system

---

## Architecture

```
Mpoly/
├── backend/              # Node.js Express API
│   ├── data/             # XML storage (users.xml, records.xml)
│   ├── middleware/       # JWT auth + delay simulation
│   ├── routes/           # auth, users, records
│   ├── utils/            # xmlHelper (read/write XML)
│   └── server.js
└── frontend/             # Angular 14 SPA
    └── src/app/
        ├── core/         # Services, Guards, Interceptors, Models
        ├── modules/
        │   ├── auth/     # Login page (lazy)
        │   ├── dashboard/ # Records table + user profile (lazy)
        │   └── admin/    # User CRUD management (Admin only, lazy)
        └── app.module.ts
```

---

## Quick Start

### 1. Start the API

```bash
cd backend
npm install
npm start
# API running at http://localhost:3000
```

### 2. Start the Angular app

```bash
cd frontend
npm install
npm start
# App running at http://localhost:4200
```

---

## Demo Credentials

| User ID | Password    | Role         |
|---------|-------------|--------------|
| `admin` | `password123` | Admin        |
| `jdoe`  | `password123` | General User |
| `msmith`| `password123` | General User |

---

## Key Features

### Login Page
- User ID, Password, Role selector
- **Async delay slider** – set 0–5000ms to showcase async/loading states
- Quick-fill demo credential buttons

### Dashboard (All users)
- Personal profile card with live data from JWT
- Real-time **async progress bar** during API fetch
- Records table filtered by role (Admin sees all; users see own)
- Sorting, pagination, full-text search

### Admin Panel (Admin only)
- Full CRUD for all users
- Activate / Deactivate accounts
- Create user dialog with validation
- Async reload with delay simulation

### Technical highlights
- `JwtInterceptor` auto-attaches `Authorization: Bearer <token>` to every HTTP request
- `AuthGuard` / `AdminGuard` protect routes declaratively
- `CoreModule` singleton pattern (throws if double-imported)
- `forkJoin` + `finalize` RxJS operators for clean async handling
- XML file acts as a portable "database" with full read/write via `xml2js`

---

## API Endpoints

| Method | Endpoint             | Auth    | Description              |
|--------|----------------------|---------|--------------------------|
| POST   | `/api/auth/login`    | Public  | Authenticate user        |
| GET    | `/api/auth/me`       | Bearer  | Get current user         |
| GET    | `/api/records`       | Bearer  | Get records (role-scoped)|
| GET    | `/api/users`         | Admin   | List all users           |
| POST   | `/api/users`         | Admin   | Create user              |
| PUT    | `/api/users/:id`     | Admin   | Update user              |
| DELETE | `/api/users/:id`     | Admin   | Delete user              |

> Append `?delay=<ms>` to any request to simulate network latency.
