# 🩺 Diagnóstico — Frontend

Single-page app for the **Diagnóstico** health center's appointment-management ERP.
Built with **React + Vite** and styled with **Tailwind CSS**. It consumes the REST API
served by the backend (separate repo: [`diagnostico-backend`](../diagnostico-backend))
over HTTP/JSON, authenticated with a JWT bearer token.

> Bootcamp final project — MVP. The frontend is used only by the center's staff
> (administration, reception and doctors). Most project documentation lives in the
> backend repo under `docs/` (in Spanish); the frontend **component map** is here in
> [`docs/COMPONENTES.md`](docs/COMPONENTES.md).

## 🧱 Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | **React 19** |
| Routing | **React Router 7** |
| Build tool | **Vite** |
| Styling | **Tailwind CSS v4** (brand theme in `src/index.css`) |
| Language | **JavaScript** (no TypeScript) |
| Linter | **Oxlint** |
| Package manager | **pnpm** |

## 🚀 Getting started

> Requirements: Node.js 20+ and pnpm. The backend must be running separately
> (see [`diagnostico-backend`](../diagnostico-backend)).

```bash
pnpm install            # install dependencies
cp .env.example .env    # set VITE_API_URL (local backend or Render)
pnpm dev                # start the dev server → http://localhost:5173
```

### Environment

The only variable is the backend URL. Copy `.env.example` to `.env` and adjust it:

```bash
VITE_API_URL=http://localhost:8000            # local backend
# VITE_API_URL=https://diagnostico-api-jtbw.onrender.com   # production (Render)
```

`.env` is git-ignored; `.env.example` is the committed template.

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Vite dev server (with HMR) |
| `pnpm build` | Build for production into `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run Oxlint over the source |

## 🔐 Authentication & roles

Login (`POST /auth/login`) returns a JWT that is stored in `localStorage` and sent
as a bearer token on every request. The session user (and role) is read from
`GET /auth/me`. Routes are guarded by role:

| Role | Access |
|------|--------|
| **ADMIN** | Everything (incl. Users and Settings) |
| **RECEPCION** | Panel, calendar, patients, doctors, booking (no Users/Settings) |
| **MEDICO** | Panel and their own calendar (read-only) |

## 🗺️ Views (routes)

| Route | View | Roles |
|-------|------|-------|
| `/login` | Login | public |
| `/` | Dashboard (today's KPIs + agenda) | all |
| `/agenda` | Day calendar (doctor × hour, availability blocking) | all |
| `/pacientes` | Patients list + create | ADMIN · RECEPCION |
| `/pacientes/:id` | Patient file (data + appointment history) | ADMIN · RECEPCION |
| `/medicos` | Doctors grid (specialties + availability) | ADMIN · RECEPCION |
| `/citas/nueva` | New appointment form | ADMIN · RECEPCION |
| `/usuarios` | Staff management (CRUD) | ADMIN |
| `/config` | Catalog management (specialties, services) | ADMIN |

## 📂 Project structure

```
├── index.html              # HTML entry point
├── .env.example            # env template (VITE_API_URL)
├── vercel.json             # SPA rewrite (deep links → index.html)
├── docs/
│   └── COMPONENTES.md      # component map (atomic-design lite)
├── public/                 # static assets (logo, favicon)
├── src/
│   ├── main.jsx            # React entry (Router + Auth providers)
│   ├── App.jsx             # routes + role guards
│   ├── index.css           # Tailwind v4 + brand theme (@theme)
│   ├── api/
│   │   └── client.js       # HTTP client + JWT handling
│   ├── auth/               # AuthContext, AuthProvider, useAuth, ProtectedRoute
│   ├── components/
│   │   ├── atoms/          # Boton, Input, Select, Label, Badge, Avatar,
│   │   │                   # Spinner, Tarjeta, Alerta, MensajeLista
│   │   ├── molecules/      # Campo, Modal, EstadoBadge, TarjetaKPI,
│   │   │                   # BarraBusqueda, CamposCita
│   │   └── organisms/      # Sidebar, Topbar, forms, TarjetaMedico, DetalleCita
│   ├── layouts/            # AuthLayout, AppLayout
│   ├── pages/              # one component per route
│   └── utils/              # fecha, texto, datos, citas (state meta), roles (role meta)
└── vite.config.js          # Vite + React + Tailwind config
```

> Appointments are managed from the calendar/dashboard: clicking an appointment
> opens a detail dialog to **cancel**, **mark attendance** (attended / no-show)
> or **edit/move** it (reception & admin).

## ☁️ Deployment (Vercel)

The app is a static Vite build (`dist/`) hosted on **Vercel**.

1. Import the GitHub repo into Vercel — it auto-detects Vite (build `pnpm build`,
   output `dist`) and pnpm from the lockfile.
2. In **Project → Settings → Environment Variables**, add:
   - `VITE_API_URL = https://diagnostico-api-jtbw.onrender.com`

   Vite reads env vars at **build time**, so redeploy after changing it.
3. Deploy. Deep links and page refreshes (e.g. `/agenda`) work thanks to
   [`vercel.json`](vercel.json), which rewrites every path to `index.html`.

> **⚠️ Backend CORS:** the API only accepts requests from the origin set in its
> `FRONTEND_ORIGIN` env var. After the first deploy, set that variable (on Render)
> to the Vercel URL — e.g. `https://diagnostico-frontend.vercel.app` — otherwise
> the browser will block every request.

## 🔗 Related

- **Backend:** [`diagnostico-backend`](../diagnostico-backend) — FastAPI + PostgreSQL API and project docs.
