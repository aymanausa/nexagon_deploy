# Epic 06 — Suppliers & Supply Risk

The supplier map and risk overlays (Measure/Detect). Replicate from POC. POC ref:
`frontend/app/suppliers`, `frontend/app/risk-heatmap`, `suppliersApi`; backend `suppliers`,
`commodities/suppliers`, `scenarios/risk-domains` routes.

### NEX-06-01 — View suppliers with risk overlays
**As an** Analyst, **I want** to see who supplies what, with risk overlays, **so that** I can
judge sourcing exposure.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `suppliersApi.list` → `GET /v1/suppliers` · **Layer:** both
- **Acceptance criteria:**
  - Given suppliers, when I view them, then each shows commodity(ies), origin, share, and risk overlays (animal disease, political, climate, food-safety).
  - Given a supplier's country has an active risk signal, when displayed, then the overlay reflects it (ties to Detect signals, Epic 08).

### NEX-06-02 — View a supplier's detail
**As an** Analyst, **I want** to open a single supplier, **so that** I can see its full risk
and trade profile.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `GET /v1/commodities/suppliers/:code` · **Layer:** both
- **Acceptance criteria:**
  - Given a supplier code, when I open it, then its detail (commodities supplied, risk breakdown, transit where available) renders.

### NEX-06-03 — Supply-risk heatmap
**As an** Analyst, **I want** a heatmap of risk across domains and commodities/origins, **so that**
I can spot concentration and hotspots at a glance.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `frontend/app/risk-heatmap`, `GET /v1/scenarios/risk-domains` · **Layer:** both
- **Acceptance criteria:**
  - Given risk domains, when the heatmap loads, then risk is shown per domain × commodity/origin with a clear severity scale.

### NEX-06-04 — Refresh supplier data
**As an** Org Admin / System, **I want** to refresh suppliers, **so that** overlays reflect
the latest risk feeds.
- **Type:** Replicate · **Priority:** P2 · **POC ref:** `POST /v1/suppliers/refresh` · **Layer:** both
- **Acceptance criteria:**
  - Given a refresh, when run, then supplier data and overlays update and the action is audited (G5).

> **Backlog (roadmap v1.6):** transit distance/time (free `searoute`) and load-port coords
> feed the supplier transit fields — see `../release-roadmap.md` when-ready track.
