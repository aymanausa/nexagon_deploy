# Epic 16 — Platform & Non-Functional Requirements

Cross-cutting requirements that make v1.0 a real product rather than a POC. These aren't
"user" stories in the classic sense but are mandatory for the rebuild. POC ref: `docker-compose.yml`,
`frontend/app/settings`, `websocket` module, `docs/deployment-guide.md`.

### NEX-16-01 — Production build (no dev-mode in prod)
**As an** operator, **I want** real production builds, **so that** the platform runs
efficiently and safely under real traffic.
- **Type:** New/Finish · **Priority:** P0 · **POC ref:** compose runs dev-mode (`nest start --watch`, `next dev`) · **Layer:** both
- **Acceptance criteria:**
  - Given the backend, when built, then `nest build` succeeds with **zero `tsc` errors** (fix the 2 known: `alerts.service.ts`, `scenarios.service.ts`) and runs via `node dist/main`.
  - Given the frontend, when built, then `next build` produces a production bundle served by `next start`.
  - Given deployment, when the stack runs, then it is `NODE_ENV=production` behind a process manager, not dev-mode with watchers.

### NEX-16-02 — API versioning & contract
**As a** frontend developer, **I want** the API stable under `/api/v1`, **so that** the client
contract holds across the rebuild.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** URI versioning, `frontend/lib/api.ts` · **Layer:** backend
- **Acceptance criteria:**
  - Given the rebuilt backend, when the existing frontend calls it, then every endpoint in `lib/api.ts` responds with the same shape (no frontend rewrite needed).

### NEX-16-03 — Real-time updates
**As an** Analyst, **I want** live views to update in real time, **so that** the "live" data
feels live.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** backend `websocket` module, `live-data` · **Layer:** both
- **Acceptance criteria:**
  - Given a WebSocket connection, when new data arrives, then subscribed views update without a manual refresh; the connection is authenticated and org-scoped (G1).

### NEX-16-04 — Settings
**As an** Org Admin / Analyst, **I want** a settings area, **so that** I can manage org
configuration and my preferences in one place.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `frontend/app/settings` · **Layer:** both
- **Acceptance criteria:**
  - Given Settings, when I open it, then org-level config (thresholds, assumptions, catalog links) is reachable per role (G6), and personal preferences are saved per user.

### NEX-16-05 — Self-running pipelines (durability)
**As an** operator, **I want** the ingestion/classification/generation pipelines to run on
schedule and self-heal, **so that** the platform stays current with minimal manual effort.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `@nestjs/schedule` cron jobs, `ingestion.service` · **Layer:** backend
- **Acceptance criteria:**
  - Given scheduled jobs, when a source fails, then it is marked DEGRADED and retried on the next cycle rather than crashing the app (see `ingestion.service.spec.ts`).
  - Given the jobs, when they run, then their status is visible (NEX-03-04, NEX-14-03).

### NEX-16-06 — Security baseline
**As a** security reviewer, **I want** baseline protections, **so that** the platform can pass
an enterprise/government security check.
- **Type:** New · **Priority:** P0 · **POC ref:** deployment guide (non-root user, Cloudflare SSL) · **Layer:** backend
- **Acceptance criteria:**
  - Given the app, when reviewed, then: secrets come from env (no secrets in code/repo), JWT auth on all non-public routes, org-scoping enforced server-side (G1), audit log in place (G5), TLS terminated (Cloudflare per deployment guide), and the runtime runs as a non-root user.
  - **Note:** hardening depth and a formal review are roadmap v2.0; this is the v1.0 baseline.

### NEX-16-07 — Automated tests & CI
**As a** developer, **I want** tests and CI, **so that** regressions (like the drift that broke
the POC's one test) are caught automatically.
- **Type:** New · **Priority:** P1 · **POC ref:** backend Jest (`ingestion.service.spec.ts`), no CI · **Layer:** backend
- **Acceptance criteria:**
  - Given non-trivial logic, when written, then it ships with tests; when a PR is opened, then CI runs `nest build`, `next build`, and the test suites and blocks merge on failure.
