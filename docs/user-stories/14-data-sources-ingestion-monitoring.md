# Epic 14 — Data Sources, Ingestion & Monitoring

The data backbone: source catalog + health, ingestion runs, a live-data feed, and a system
monitoring view. Replicate from POC. POC ref: `frontend/app/data-sources`,
`frontend/app/live-data`, `frontend/app/monitoring`, `liveDataApi`; backend `data-sources`
(`GET /health`, `GET /`), `integration` (`POST /sources/:id/run`), `live-data` controllers.

### NEX-14-01 — View data sources and health
**As an** Analyst / Admin, **I want** the catalog of data sources with health status, **so that**
I know what's feeding the platform and what's degraded.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `GET /v1/data-sources`, `GET /v1/data-sources/health` · **Layer:** both
- **Acceptance criteria:**
  - Given sources, when I view the page, then each shows name, category, last update, and health (ok/degraded), with degraded sources clearly flagged.

### NEX-14-02 — Live-data feed
**As an** Analyst, **I want** a live view of incoming data, **so that** I can see the platform
ingesting in real time.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `liveDataApi.list` → `GET /v1/live-data` · **Layer:** both
- **Acceptance criteria:**
  - Given the live-data page, when it loads, then recent ingested records render; where the POC pushes updates, real-time parity is kept (G7).

### NEX-14-03 — System monitoring
**As an** Admin, **I want** a monitoring view of scheduled jobs and system health, **so that**
I can confirm the platform is running itself.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `frontend/app/monitoring`, dashboard automation status · **Layer:** both
- **Acceptance criteria:**
  - Given scheduled pipelines, when I open monitoring, then each job's last run, status, and next expected run render; failures are visible.

### NEX-14-04 — Manually run a source ingestion
**As an** Org Admin, **I want** to trigger a source's ingestion on demand, **so that** I can
refresh or recover a degraded source without waiting for the schedule.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `integration` → `POST /v1/integration/sources/:id/run` · **Layer:** both
- **Acceptance criteria:**
  - Given a source, when I run it, then ingestion executes, health updates, and the action is audited (G5); a failing fetcher marks the source DEGRADED without throwing (see `ingestion.service.spec.ts`); Analysts cannot trigger runs (G6).

> **Roadmap v1.1–v1.3:** the Platform-Admin admin portal (global source catalog with
> credentials, system-wide default config + tenant override, bring-your-own per-org sources)
> extends this epic — see `../release-roadmap.md`. v1.0 delivers the view + manual run.
