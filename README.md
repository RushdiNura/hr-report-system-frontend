# HR Reports — Frontend

React (Vite) client for the HR Reports service registry. Two roles:

- **`head`** — branch coordinators. Submit monthly service reports (with a
  signature pad and optional file upload), manage their own employee list.
- **`hr`** — central admin. Reviews reports and stats across every branch,
  manages `head` accounts.

## Tech stack

- React 19, Vite, React Router
- `axios` (single shared instance with auth interceptor — see
  `src/api/axios.js`), `socket.io-client` for live dashboard updates
- `framer-motion` for transitions, `lucide-react` for icons,
  `react-hot-toast` for notifications
- `react-signature-canvas` for the signature pad, `mammoth` for reading
  uploaded Word documents client-side

## Setup

```bash
npm install
cp .env.example .env
# point VITE_API_URL / VITE_SERVER_URL at your backend (see below)
npm run dev
```

## Environment variables

See `.env.example`. Both point at the backend — same host, different suffix:

| Variable | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL for all API calls |
| `VITE_SERVER_URL` | `http://localhost:5000` | Base URL for Socket.io and file downloads (no `/api` suffix) |

Vite only exposes env vars prefixed `VITE_` to client code — this is a Vite
convention, not optional.

## Design system

The whole app draws from two files:

- `src/styles/tokens.css` — colors (light + dark via `[data-theme="dark"]`),
  fonts, spacing, radius, shadow scale. Change the identity here.
- `src/styles/primitives.css` — reusable classes: `.btn`/`.btn-primary`/
  `.btn-secondary`/`.btn-danger`, `.input`/`.select`/`.textarea`, `.card`,
  `.badge-*`, `.data-table`, `.seal-ring` (the signature ring motif used on
  the login seal and loading spinner).

Dark mode is handled by `src/hooks/ThemeProvider.jsx` (`ThemeContext` +
`useTheme()` hook), applied at the `<html>` root via a `data-theme`
attribute and persisted to `localStorage`. Toggle it anywhere with
`<ThemeToggle />`.

Fonts (Space Grotesk / IBM Plex Sans / IBM Plex Mono) are loaded via Google
Fonts `<link>` tags in `index.html` — not bundled, so they need network
access at runtime (fine for a normal deployed site; irrelevant to the
build step).

## Project structure

```
src/
├── api/            # axios instance + per-resource API functions
├── components/      # shared building blocks (Modal, Spinner, ReportsTable, ThemeToggle...)
├── hooks/           # useAuth, ThemeProvider/useTheme
├── layout/          # authenticated app shell (sidebar + header)
├── pages/           # one file per route
├── services/        # socket.js (Socket.io client)
└── styles/          # tokens.css, primitives.css, one file per page/component
```

## Testing

No frontend test suite yet — see the backend's `tests/` for the pattern
this project follows if you're adding one (Node's built-in test runner +
Testing Library would be a reasonable fit here, no extra framework needed).

## Deployment (Vercel, or similar)

This is a single-page app using `BrowserRouter` (real paths like `/hr/heads`,
not hash routing) — **`vercel.json`** in this repo rewrites all paths to
`index.html` so refreshing on a non-root route doesn't 404. If you deploy
somewhere other than Vercel, you'll need the equivalent (e.g. Netlify's
`_redirects` file, or your host's SPA fallback setting).

1. Set `VITE_API_URL` / `VITE_SERVER_URL` as environment variables in your
   hosting platform's dashboard, pointed at your deployed backend.
2. Build command: `npm run build`. Output directory: `dist`.
3. Make sure the backend's `CORS_ORIGINS` includes this frontend's deployed
   URL, or every API call will be blocked by CORS.

## Troubleshooting

- **Refreshing any page except `/` shows a 404 in production**: your host
  isn't applying the SPA rewrite. See `vercel.json` above.
- **Requests fail with a CORS error**: the backend's `CORS_ORIGINS` doesn't
  include this app's URL — see the backend README.
- **Dark mode doesn't persist**: it's stored under the `theme` key in
  `localStorage`; check the browser isn't blocking storage for this origin.
