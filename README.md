# 🩺 Diagnóstico — Frontend

Single-page app for the **Diagnóstico** health center's appointment-management ERP.
Built with **React + Vite** and styled with **Tailwind CSS**. It consumes the REST API
served by the backend (separate repo: [`diagnostico-backend`](../diagnostico-backend))
over HTTP/JSON, authenticated with a JWT bearer token.

> Bootcamp final project — MVP. The frontend is used only by the center's staff
> (administration, reception and doctors). Project documentation lives in the backend
> repo, under `docs/` (in Spanish).

## 🧱 Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | **React 19** |
| Build tool | **Vite** |
| Styling | **Tailwind CSS v4** |
| Language | **JavaScript** (no TypeScript) |
| Linter | **Oxlint** |
| Package manager | **pnpm** |

## 🚀 Getting started

> Requirements: Node.js 20+ and pnpm. The backend must be running separately
> (see [`diagnostico-backend`](../diagnostico-backend)).

```bash
pnpm install     # install dependencies
pnpm dev         # start the dev server → http://localhost:5173
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Vite dev server (with HMR) |
| `pnpm build` | Build for production into `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run Oxlint over the source |

## 📂 Project structure

```
├── index.html          # HTML entry point
├── src/
│   ├── main.jsx        # React entry point (mounts <App />)
│   ├── App.jsx         # root component (base layout)
│   └── index.css       # Tailwind entry
├── public/             # static assets served as-is
└── vite.config.js      # Vite + React + Tailwind config
```

## 🔗 Related

- **Backend:** [`diagnostico-backend`](../diagnostico-backend) — FastAPI + PostgreSQL API and project docs.
