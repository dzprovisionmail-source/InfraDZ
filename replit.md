# InfraDZ

A mobile app (Expo/React Native) for the Algerian Highway Code 2026 — helps users learn traffic laws, violations, and scoring rules.

## Run & Operate

- `Start application` workflow — Expo Metro dev server (port 5000, webview)
- `Start Backend` workflow — Express API server (port 3000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Frontend: Expo 54 (React Native) + Expo Router (file-based routing)
- API: Express 5 (port 3000 in dev, 3000 in prod)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle for API server)
- Mockup sandbox: Vite + React (for UI component development)

## Where things live

- `artifacts/traffic-law-dz/` — Expo mobile app (main frontend)
  - `app/` — Expo Router screens (file-based routes)
  - `context/` — React context providers
  - `hooks/` — Custom hooks
  - `components/` — Reusable UI components
  - `data/` — Static data (violations, traffic law content)
  - `server/serve.js` — Production static file server
  - `scripts/build.js` — Production build script (Metro bundler)
- `artifacts/api-server/` — Express API backend
  - `src/app.ts` — Express app setup
  - `src/routes/` — API routes
- `artifacts/mockup-sandbox/` — Vite sandbox for UI mockups
- `lib/db/` — Drizzle ORM schema & config (source of truth: `src/schema/index.ts`)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-zod/` — Zod schemas generated from OpenAPI spec
- `lib/api-client-react/` — React Query hooks generated from OpenAPI spec

## Architecture decisions

- Expo Router for file-based routing — same pattern as Next.js Pages Router
- Orval generates both Zod schemas (`api-zod`) and React Query hooks (`api-client-react`) from the OpenAPI spec, keeping frontend and backend in sync
- esbuild bundles the API server into a single ESM file for fast cold starts
- The Expo app uses `EXPO_PUBLIC_DOMAIN` env var for API base URL (never hardcoded)
- Production Expo build: Metro bundles iOS/Android JS, then `serve.js` serves static files

## Product

InfraDZ is an Algerian traffic law reference app that helps users understand the Code de route Algérien 2026, including traffic violations, point deductions, and legal information.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Never run `npx expo start` directly — always use `restart_workflow` so PORT and other env vars are injected
- API server dev script rebuilds before starting: `build && start`
- The `serve.js` production server requires `static-build/` to exist (run `pnpm --filter @workspace/traffic-law-dz run build` first)
- DB schema is currently empty (`lib/db/src/schema/index.ts`) — add models there before calling `pnpm --filter @workspace/db run push`
- PORT env var is set in workflow commands (PORT=5000 for frontend, PORT=3000 for backend)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Expo skill for mobile development guidelines
