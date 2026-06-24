# Abdulmalik Nure Jemal — Full Stack Portfolio

A production-ready full-stack portfolio website with a React frontend, Node.js/Express backend, PostgreSQL database, and a complete Admin Dashboard.

---

## Project Structure

```
abdee-main/
├── src/                  # Frontend (React + Vite + TypeScript) — UI unchanged
│   └── lib/api.ts        # API client connecting frontend to backend
├── backend/              # Node.js + Express + PostgreSQL API
│   ├── config/           # Database connection
│   ├── controllers/      # Business logic (MVC)
│   ├── middleware/        # Auth, validation, upload, security
│   ├── models/           # (query layer in controllers/config)
│   ├── routes/           # public.js + admin.js + auth.js
│   ├── services/         # Email (Nodemailer), JWT tokens
│   ├── database/         # schema.sql + setup.js + seed.js
│   ├── uploads/          # Uploaded files (gitignored)
│   ├── utils/            # Winston logger
│   └── server.js         # Express app entry point
└── admin/                # Admin Dashboard (React + Vite + TypeScript)
    └── src/
        ├── pages/        # All 16 admin pages
        ├── components/   # Layout (sidebar + topbar)
        ├── context/      # AuthContext
        └── lib/api.ts    # Axios client for admin API
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 2. Database Setup

```sql
-- In psql:
CREATE DATABASE portfolio_db;
```

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — fill in DB_PASSWORD, JWT secrets, SMTP credentials
npm install
node database/setup.js   # Creates all tables
node database/seed.js    # Seeds admin user + default content
npm run dev              # Starts on port 5000
```

### 4. Frontend (Portfolio)

```bash
# In project root
npm install
npm run dev              # Starts on port 8080
```

### 5. Admin Dashboard

```bash
cd admin
npm install
npm run dev              # Starts on port 5174
```

---

## Environment Variables (backend/.env)

| Variable | Description |
|---|---|
| `DB_*` | PostgreSQL connection details |
| `JWT_SECRET` | Min 32-char secret for access tokens |
| `JWT_REFRESH_SECRET` | Min 32-char secret for refresh tokens |
| `ADMIN_EMAIL` | Initial admin login email |
| `ADMIN_PASSWORD` | Initial admin login password |
| `SMTP_*` | Gmail SMTP credentials for email |
| `FRONTEND_URL` | Portfolio URL (for CORS) |
| `ADMIN_URL` | Admin dashboard URL (for CORS) |

---

## Admin Dashboard

Access: `http://localhost:5174/login`

Default credentials (from seed):
- Email: `admin@portfolio.com`
- Password: `Admin@12345`

**Change these immediately after first login.**

### Admin Features

| Section | Capabilities |
|---|---|
| Dashboard | Stats overview, visitor chart, recent messages/projects |
| Profile | Name, email, avatar, password change |
| Settings | Site identity, SEO, hero section, about section, contact info |
| Skills | CRUD with categories (core/frontend/backend), progress bars |
| Services | CRUD with icon and gradient |
| Projects | CRUD with thumbnail upload, screenshots, search, pagination |
| Education | CRUD with dates |
| Experience | CRUD with current job flag |
| Certificates | CRUD with image upload |
| Gallery | Upload images/videos, categorize |
| Blog | CRUD with cover image, tags, publish/draft |
| Testimonials | CRUD with photo, star rating |
| Messages | View, mark read, reply via email, delete, search |
| Social Links | Manage all platforms with one click |
| Resume | Upload PDF, auto-sets as active Download CV |
| Analytics | Visitor trends, event breakdown, top projects |

---

## REST API Reference

### Public Endpoints

```
GET    /api/settings
GET    /api/skills
GET    /api/services
GET    /api/projects         ?page=1&limit=10&category=&search=&featured=true
GET    /api/projects/:id
GET    /api/certificates
GET    /api/gallery          ?category=
GET    /api/blog             ?page=1&limit=10
GET    /api/blog/:idOrSlug
GET    /api/testimonials
GET    /api/social-links
GET    /api/education
GET    /api/experience
GET    /api/resume
GET    /api/resume/download
POST   /api/contact          { full_name, email, phone?, subject?, message }
POST   /api/analytics/track  { event_type, page, project_id? }
```

### Auth Endpoints

```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/change-password
```

### Admin Endpoints (JWT required)

```
GET    /api/admin/dashboard
PUT    /api/admin/profile
GET/PUT /api/admin/settings
GET/GET/PATCH/POST/DELETE  /api/admin/messages/:id
GET/POST/PUT/DELETE        /api/admin/skills/:id
GET/POST/PUT/DELETE        /api/admin/services/:id
GET/POST/PUT/DELETE        /api/admin/projects/:id
GET/POST/PUT/DELETE        /api/admin/education/:id
GET/POST/PUT/DELETE        /api/admin/experience/:id
GET/POST/PUT/DELETE        /api/admin/certificates/:id
GET/POST/PUT/DELETE        /api/admin/gallery/:id
GET/POST/PUT/DELETE        /api/admin/blog/:id
GET/POST/PUT/DELETE        /api/admin/testimonials/:id
GET/POST/DELETE            /api/admin/social-links/:id
GET/POST                   /api/admin/resume
GET                        /api/admin/analytics
```

---

## Security

- **Helmet** — HTTP security headers
- **CORS** — Whitelist-only origins
- **Rate limiting** — 100 req/15min general, 10 req/15min auth, 5 msg/hr contact
- **JWT** — Access tokens (15m) + refresh tokens (7d) via httpOnly cookies
- **bcrypt** — Password hashing (cost 12)
- **XSS** — Input sanitization on all request bodies
- **SQL injection** — Parameterized queries throughout
- **express-validator** — Input validation on all write endpoints

---

## Deployment

### Backend (Render / Railway)

1. Push code to GitHub
2. Create a PostgreSQL database on your platform
3. Set all environment variables
4. Build command: `node database/setup.js && node database/seed.js`
5. Start command: `node server.js`

### Frontend

```bash
npm run build     # outputs to dist/
```

Deploy `dist/` to Netlify, Vercel, or serve via Nginx.

### Admin Dashboard

```bash
cd admin
npm run build     # outputs to admin/dist/
```

Deploy separately or serve via the backend:

```js
// In server.js (production)
app.use('/admin', express.static(path.join(__dirname, '../admin/dist')));
```

---

## Gmail App Password (for email notifications)

1. Enable 2FA on your Google account
2. Go to Google Account → Security → App passwords
3. Create an app password for "Mail"
4. Paste into `SMTP_PASS` in `.env`
