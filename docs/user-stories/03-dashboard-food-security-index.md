# Epic 03 — Dashboard & Food-Security Index

The "Measure" stage: the headline view and the composite index. Replicate from POC.
POC ref: `frontend/app/dashboard`, `dashboardApi`, `foodIndexApi`, `selfSufficiencyApi`;
backend `dashboard`, `food-index`, `self-sufficiency` modules.

### NEX-03-01 — Headline KPI cards
**As an** Analyst, **I want** the top-line food-security KPIs at a glance, **so that** I know
the national state without drilling in.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `dashboardApi.getKpis` → `GET /v1/dashboard/kpis` · **Layer:** both
- **Acceptance criteria:**
  - Given I open the dashboard, when it loads, then KPI cards render from `/v1/dashboard/kpis` with value and trend.
  - Given a data source is degraded, when KPIs load, then the affected KPI still renders with a clear "stale/degraded" indicator rather than blank.

### NEX-03-02 — Latest commodity prices panel
**As an** Analyst, **I want** the latest prices for the commodities I care about, **so that**
I see market movement immediately.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `dashboardApi.getLatestPrices` → `GET /v1/dashboard/prices/latest` · **Layer:** both
- **Acceptance criteria:**
  - Given the dashboard, when it loads, then latest prices render with recent change (direction + %).
  - Given I have selected specific commodities (NEX-04-04), when the panel renders, then only those show; if none selected, all show.

### NEX-03-03 — Recent alerts on dashboard
**As an** Analyst, **I want** the most recent alerts surfaced on the dashboard, **so that** I
see emerging threats without opening the Alerts page.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `dashboardApi.getRecentAlerts` → `GET /v1/dashboard/alerts/recent` · **Layer:** both
- **Acceptance criteria:**
  - Given recent alerts exist, when the dashboard loads, then the latest N render with severity, ordered newest first, linking to Alerts (Epic 11).

### NEX-03-04 — "Runs itself" automation status strip
**As an** Analyst, **I want** to see that the platform is updating itself, **so that** I trust
the data is current (durability made visible).
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `dashboardApi.getAutomationStatus` → `GET /v1/dashboard/automation/status` · **Layer:** both
- **Acceptance criteria:**
  - Given scheduled jobs run, when I view the strip, then each shows last-run time and status (ok/degraded).
  - Given a job hasn't run in its expected window, when displayed, then it shows a warning state.

### NEX-03-05 — 4-pillar Food-Security Index with drill-down
**As an** Analyst, **I want** the composite index (Availability, Access, Utilization,
Stability) with its sub-indicators, **so that** I can see *why* the score is what it is.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `foodIndexApi.get` → `GET /v1/food-index` · **Layer:** both
- **Acceptance criteria:**
  - Given the index endpoint, when I view it, then the 0–100 composite, four pillar scores, and 16 sub-indicators render with drill-down.
  - Given a completed initiative changed the data, when the index recomputes, then the score reflects it (closes the loop — Epic 12).

### NEX-03-06 — Recompute the index
**As an** Org Admin / System, **I want** to recompute the index on demand, **so that** it
reflects the latest data after ingestion or an initiative.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `foodIndexApi.recompute` → `POST /v1/food-index/recompute` · **Layer:** both
- **Acceptance criteria:**
  - Given new data, when recompute is triggered, then the index updates and the action is audited (G5); Analysts cannot trigger it (G6).

### NEX-03-07 — Self-sufficiency view
**As an** Analyst, **I want** production ÷ domestic supply per commodity, **so that** I know
where the Kingdom depends on imports.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `selfSufficiencyApi.list` → `GET /v1/self-sufficiency` · **Layer:** both
- **Acceptance criteria:**
  - Given the endpoint, when I view it, then self-sufficiency ratios render per commodity with a clear import-dependence indicator.
