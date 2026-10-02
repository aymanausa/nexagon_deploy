# Nexagon v1.0 — User Stories (developer handoff)

These stories specify the **v1.0 product surface** for a clean-room rebuild. The existing
POC (`v0.9`) is the **visual/behavioral reference**, not the spec — see Global Rule G3.
Scope and versioning: `../release-roadmap.md`.

## How to read a story
Each story:
```
### NEX-<epic>-<n> — <title>
**As a** <role>, **I want** <capability>, **so that** <benefit>.
- **Type:** Replicate (built in POC) | Finish-work (POC stub → real) | New (v1.0)
- **Priority:** P0 (must for v1.0) · P1 (should) · P2 (could)
- **POC ref:** <page / api / backend module the rebuild mirrors>
- **Acceptance criteria:**
  - Given … When … Then …
```

## Roles
- **Analyst** — the day-to-day user of the decision loop; read + operate, no config/admin.
- **Org Admin** — manages their org's users, roles, thresholds, and configuration.
- **Platform Admin** (super-admin/operator) — manages tenants, global data sources, and
  system-wide defaults across all orgs.
- **System** — automated jobs (`@Cron` pipelines, auto-generators) acting with no human.

## Global rules (apply to EVERY story — do not restate per story)
- **G1 — Multi-tenancy.** Every read and write is scoped to the caller's org (`tenantId`).
  Implicit AC on all data stories: *Given I am authenticated in org A, when I load any
  data, then I see only org A's data and never another org's.* Platform Admin is the only
  role that crosses tenants. (Epic 01 builds the mechanism.)
- **G2 — Auth required.** Every page except `/login` requires a valid session; an
  unauthenticated or 401 request clears the token and redirects to `/login`. (Epic 00.)
- **G3 — POC is a reference, not a spec.** Rebuild the *target* behavior. **Do NOT**
  replicate the POC's shortcuts: faked auth (`useAuth.ts` `mock-token`, hardcoded user),
  stubbed data (`mockUsers`, `mockAlerts`), or the 2 known `tsc` errors. Use the POC for
  layout, flow, and field-level detail only.
- **G4 — API contract.** Base path `/api/v1`, JWT bearer auth. Response shapes must match
  the existing endpoints (see `frontend/lib/api.ts`) so the frontend needs no rewrite.
- **G5 — Audit log.** Every state-changing action (POST/PUT/PATCH/DELETE) writes an audit
  entry: actor, action, target, org, timestamp. (Epic 01.)
- **G6 — RBAC.** Analyst is read + operate (run simulations, ask copilot); config/threshold
  writes and user management require Org Admin; tenant/global config requires Platform Admin.
- **G7 — Real-time.** Where the POC pushes live updates it uses a WebSocket gateway; keep
  parity (Epic 16).

## Definition of Done (per story)
Code + passing automated test(s) for non-trivial logic · acceptance criteria demonstrably
met · org-scoped (G1) · audit-logged if state-changing (G5) · role-gated (G6) · no mock
data or faked auth (G3) · builds clean (`nest build` + `next build`, no `tsc` errors).

Each story's tests are tagged with its `NEX-XX-YY` id and gate the merges — see
`../testing-and-branching-strategy.md` for the full test levels, traceability check, git
branching model, and CI gates. Non-code stories (esp. epics 19–21) mark a `Verify:` method
(ops-drill / manual / e2e) so the traceability report doesn't demand a unit test for them.

## Epic index
| # | Epic | Theme | Notes |
|---|---|---|---|
| 00 | Authentication & Session | Foundation | Finish-work: replace faked auth |
| 01 | Multi-Tenancy & Audit Log | Foundation | New — bedrock for everything |
| 02 | Users & Role-Based Access | Foundation | Finish-work: wire Users page + roles |
| 03 | Dashboard & Food-Security Index | Measure | Replicate |
| 04 | Commodities & Prices | Measure | Replicate |
| 05 | Stock Levels & Demand Forecast | Measure/Anticipate | Replicate |
| 06 | Suppliers & Supply Risk | Measure | Replicate |
| 07 | Procurement Optimizer | Decide | Replicate |
| 08 | News, Signals & Insights | Detect | Replicate |
| 09 | Scenario Simulator | Stress-test | Replicate |
| 10 | AI Copilot | Cross-cutting | Finish-work: canned → real (uncommitted) |
| 11 | Alerts | Detect/Track | Finish-work: wire Alerts page |
| 12 | Initiatives | Track | Replicate |
| 13 | Impact & Sustainability | Measure | Replicate |
| 14 | Data Sources, Ingestion & Monitoring | Platform | Replicate + admin |
| 15 | Reports | Track | Replicate |
| 16 | Platform & Non-Functional Requirements | Platform | New + finish |
| 17 | UX & Cross-Cutting UI | Cross-cutting | Theme, responsive, i18n/Arabic — all v1.0 |
| 18 | Admin Consoles (Super-Admin & Org Admin) | Platform | Super-admin core v1.0; org-admin/usage v1.1 |
| 19 | Auth Completeness & Communications | Hardening 🔒 | Password reset, MFA, email — v1.0 |
| 20 | Operations & Observability | Hardening 🔒 | Backups, error tracking, health — v1.0 |
| 21 | Security & Compliance | Hardening 🔒 | Pen test, data residency, a11y — v1.0/v1.1 |

> **Production-hardening (🔒, epics 19–21):** the go-live gates from
> `../v1-production-readiness-assessment.md`. Feature-complete ≠ deployable — these must finish
> before the first real pilot goes to production. Most are v1.0 blockers (password reset, email,
> MFA, backups, error tracking, security review, KSA data residency); the rest are fast-follow v1.1.

> **Versioning note:** Epic 17 (theme, responsive, i18n/Arabic + language switcher) is fully
> **v1.0**. Epic 18's Platform Super-Admin core (NEX-18-01→04: cross-tenant dashboard, tenant
> management, global data sources, defaults+override) is **v1.0**; the org-admin dashboard,
> usage/credits, and BYO-data (NEX-18-05→09) stay **v1.1–v1.2**. Each story carries a **Version:** tag.
