# Epic 20 — Operations & Observability

Production-hardening: the ability to run the system safely and see what it's doing. **Go-live
gates** — from `../v1-production-readiness-assessment.md` section C. POC ref: none (new);
the POC has no backups, error tracking, or health probes.

### NEX-20-01 — Automated backups + tested restore/DR
**As an** operator, **I want** automated database backups with a tested restore, **so that** a
bad migration or disk failure never loses a customer's data.
- **Type:** New · **Priority:** P0 · **Version:** v1.0 · **POC ref:** none · **Layer:** backend
- **Acceptance criteria:**
  - Given the database, when backups run on schedule, then encrypted backups are stored off-host with a defined retention.
  - Given a backup, when a restore drill is performed, then data is recovered to a target point within a documented RPO/RTO — the restore is *tested*, not assumed.

### NEX-20-02 — Error tracking + APM
**As a** developer/operator, **I want** errors and performance captured centrally, **so that** I
see problems before users report them (the POC's one test rotted silently for weeks).
- **Type:** New · **Priority:** P0 · **Version:** v1.0 · **POC ref:** none · **Layer:** both
- **Acceptance criteria:**
  - Given a runtime error (frontend or backend), when it occurs, then it is reported to an error-tracking service with context (release, tenant — no secrets/PII leaked).
  - Given requests/jobs, when they run, then latency and failure rates are visible (APM/OpenTelemetry), including the `@Cron` pipelines and AI calls.

### NEX-20-03 — Health / readiness / liveness probes
**As an** operator, **I want** health endpoints, **so that** orchestration and uptime checks can
tell if the app is up and ready.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** none · **Layer:** backend
- **Acceptance criteria:**
  - Given the backend, when probed, then it exposes liveness and readiness endpoints reporting DB/Redis/queue connectivity.

### NEX-20-04 — Centralized structured logging
**As an** operator, **I want** structured, centralized logs, **so that** I can debug a
multi-tenant production system.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** Nest `Logger` (unstructured) · **Layer:** backend
- **Acceptance criteria:**
  - Given app activity, when logged, then logs are structured (JSON), carry a correlation/request id and tenant, and ship to a central store; no secrets or PII in logs.

### NEX-20-05 — Uptime monitoring + alerting
**As an** operator, **I want** to be alerted when the system is down or degraded, **so that**
someone responds before the customer notices.
- **Type:** New · **Priority:** P1 · **Version:** v1.1 · **POC ref:** none · **Layer:** backend
- **Acceptance criteria:**
  - Given uptime/health checks, when a threshold is breached (down, error spike, job overdue), then an alert is sent to an on-call channel.

### NEX-20-06 — Migration & rollback runbook
**As a** developer, **I want** a tested forward + rollback migration path, **so that** deploys
are reversible.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** `prisma migrate deploy` (`db:deploy`) · **Layer:** backend
- **Acceptance criteria:**
  - Given a release, when it includes a schema change, then migrations apply via `migrate deploy` in the pipeline and a documented rollback procedure exists and has been rehearsed.

> **Deferred (🟢, v2.0):** high availability / redundancy / horizontal scale-out — acceptable as
> single-node for the first pilot; see roadmap v2.0.
