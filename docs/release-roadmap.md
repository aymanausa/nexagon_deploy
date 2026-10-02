# Nexagon — Release Roadmap

> Re-fitted 2026-09-30 after a full POC functional-gap audit. Pilot-first,
> ROI/dependency-ordered, no fixed dates. Quarterly releases from Q4 2026. Current state =
> **v0.9** — a POC, *not* a real v1 (auth is faked, some pages stubbed). **v1.0 is the first
> release that's actually functional.** Legend: 📋 planned (evaluation roadmap) · 💡 new ·
> 🗂️ deferred backlog · 🔴 broken/stubbed (finish work) · ⚠️ build-blocker · 🔒 production-hardening (go-live gate).

## The re-fit logic
The phone-session draft called the current POC "v1.0" and started the plan at v1.1 — but the
POC isn't a real v1, so v1.0 is reserved for the first functional release. The audit also
showed **auth is faked**, making it the critical-path blocker — and since tenancy/RBAC/metering
all sit on real auth, the whole SaaS foundation plus the "make it functional" work collapses
into the first release. So **v1.0 is "make the POC real + lay the SaaS bedrock"**, and the old
v1.7 (scale) + v2.0 merge into v2.0.

## Quarterly cadence

| Version | Quarter | Theme | Features |
|---|---|---|---|
| **v0.9** | *now* | POC (current) | Shipped demo: ~13 pages on real backend + genuine integrations. Not production: faked auth, stubbed Users/Alerts pages, 2 build-blocking errors. |
| **v1.0** | Q4 2026 | **Make it real + SaaS bedrock** | 🔴 Real auth: wire `useAuth`→`authApi`+backend, kill `mock-token` · 🔴 Wire Users page→`users` backend (add `usersApi`) · 🔴 Wire Alerts page→existing `alertsApi` · ⚠️ Fix 2 `tsc` errors to unblock `nest build` · Production build in compose + process manager 📋 · **Multi-tenancy bedrock**: tenant isolation (`tenantId` across models/queries) + tenant-scoped RBAC + immutable audit log 💡 · **Platform super-admin console**: cross-tenant dashboard, tenant mgmt, global data sources, system defaults + tenant override 💡 · Theme switcher + responsive baseline · **Arabic UI (i18n + RTL + language switcher)** 💡 · **Production-hardening go-live gates:** password reset + self-service change · MFA/TOTP · email/notification service · automated backups + tested restore · error tracking + APM + health probes · rate limiting · dep scanning in CI · security review/pen-test + KSA data residency + at-rest encryption 🔒 |
| **v1.1** | Q1 2027 | **Pilot-ready & operable** | Hosted demo URL 📋 · Session/device mgmt + admin-driven provisioning 💡 · Org-admin dashboard (org config, users, usage) 💡 · Per-org usage metering + observability dashboard 💡 · **Hardening fast-follow:** structured logging + uptime alerting · alert/briefing email delivery · PDPL data handling · accessibility (WCAG 2.1 AA) · secrets rotation 🔒 · Onboarding + demo-data toggle 💡 |
| **v1.2** | Q2 2027 | **Regional & monetizable** | GCC generalization (swap KSA area codes) 📋 · Pilot & data-partnership one-pager 📋 · Credits + quota enforcement + pricing tiers 💡 · Bring-your-own data sources (per-org connectors, on-the-fly ingest) 💡 · Widen climate coords (centroid fallback) 🗂️ |
| **v1.3** | Q3 2027 | **Close the loop** | Alert workflows: ack/assign/track-to-resolution 💡 · Procurement optimizer (timing + reserve arbitrage, feeds impact) 💡 · PDF report export 💡 |
| **v1.4** | Q4 2027 | **Smarter anticipation** | ML forecast (seasonal model + confidence intervals) 📋 · Compound/cascade scenarios 📋 |
| **v1.5** | Q1 2028 | **Conversational & bilingual AI** | Arabic NL what-if (finish) 📋 · Copilot depth: multi-turn + "run this what-if" tool + proactive push 💡 · Auto weekly AI briefing 💡 |
| **v1.6** | Q2 2028 | **Logistics & supply depth** | Load-port layer 🗂️ · Free `searoute` transit distance+time 🗂️ · Supplier diversification recommender 💡 · Expand commodity catalog 💡 |
| **v2.0** | Q3 2028 | **Scale & platform** | Multi-tenant scale-out + perf · Mobile/PWA · Security review / hardening · Partner API + embeddable widgets · Scenario-template / commodity-pack marketplace |

## Production-hardening track (🔒 — go-live gates, user-stories epics 19–21)
Feature-complete ≠ deployable. Before the **first real pilot goes to production**, the v1.0
hardening gates above must be done — they are not optional polish. Rationale and full gap list:
`v1-production-readiness-assessment.md`. v1.0 gates: password reset, email/notification service,
MFA, backups + tested restore, error tracking + APM + health probes, rate limiting, dependency
scanning, security review/pen-test, KSA data residency + at-rest encryption. Fast-follow in v1.1:
structured logging + uptime alerting, alert/briefing email, PDPL data handling, accessibility,
secrets rotation. Deferred to v2.0: HA/scale-out.

## Parallel "when-ready" track (drop into whichever release is live when they clear)
- **Authoritative feeds** (SAGO/GASTAT/MEWA/SFDA) — each retires proxy data, lifts Impact + Feasibility; no frontend change (multi-source upsert pattern).
- **Paid live-logistics** (AIS congestion/freight) — only after vendor quotes land in budget *and* a real disruption justifies; swaps into transit fields; best once v1.6's free baseline exists.
- **SSO / SAML / OIDC** — off the table for now; keep auth behind a clean boundary so a specific future buyer can be accommodated without a rewrite.

## POC functional-gap audit (complete, 2026-09-30)
Backends exist for every gap below — these are wiring/finish work, not new features.

| Gap | Where | Backend ready? | Fix size |
|---|---|---|---|
| 🔴 Auth is faked (`token: 'mock-token'` + hardcoded user) | `frontend/hooks/useAuth.ts` | Yes — `authApi` (login/register/me) + `auth` module | Medium — **critical path**, blocks tenancy/RBAC |
| 🔴 Users page uses `mockUsers` array | `frontend/app/users/page.tsx` | Backend `users` module exists; **no `usersApi` yet** | Medium — add client + wire |
| 🔴 Alerts page uses `mockAlerts` array | `frontend/app/alerts/page.tsx` | Yes — `alertsApi` already in client | Small — page ignores existing api |
| ⚠️ 2 build-blocking `tsc` errors (Prisma enum vs string) | `backend/.../alerts.service.ts`, `scenarios.service.ts` | n/a | Small — required for production `nest build` |

**Verified real (no action):** ~13 pages wired to the real backend (dashboard, commodities,
procurement, suppliers, news, scenarios, demand, stock-levels, risk-heatmap, live-data,
initiatives, settings, login). Backend integrations genuine (FAO, GDELT, NASA POWER,
Comtrade); no `Math.random`, no fake-data generators, no "in production" cop-outs. Backend
source is clean of stubs. The `aichat` copilot was the one canned stub — already rewritten
(uncommitted).

## Open decisions before v1.0
- **Tenancy model** — row-level (shared DB + `tenantId`, cheapest) vs schema/DB-per-tenant
  (stronger isolation, heavier ops). Decide before writing the `tenantId` migration.
- **⚠️ v1.0 is now very heavy** — after pulling in the super-admin console + i18n/Arabic +
  theme/responsive, it's realistically closer to two releases than one quarter. The small,
  must-do parts (3 🔴 wiring fixes + ⚠️ build unblock + deploy) plus the tenancy bedrock are
  the true critical path; the super-admin console, i18n/Arabic, and org-admin dashboard could
  split into a **v1.0.x** or slip to v1.1 if Q4 velocity is tight. Recommend building in that
  priority order (make-it-real → tenancy → admin/i18n) so a pilot cut is always shippable.
- **Compound/cascade scenarios** (v1.4) is the biggest Novelty lever — pull forward to v1.3
  if a pilot demo needs a "wow".
