# Epic 07 — Procurement Optimizer

The "Decide" stage: a transparent BUY/HOLD/DEFER call per commodity. Replicate from POC.
POC ref: `frontend/app/procurement`, `procurementApi`; backend `procurement` controller
(`GET /v1/procurement`, `POST /recompute`, `PUT /config`).

### NEX-07-01 — View procurement recommendations
**As an** Analyst, **I want** a BUY/HOLD/DEFER recommendation per commodity, **so that** I
know what action to take.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `procurementApi.get` → `GET /v1/procurement` · **Layer:** both
- **Acceptance criteria:**
  - Given the endpoint, when I view it, then each commodity shows a recommendation with urgency, suggested quantity, timing window, and risk-adjusted origins.

### NEX-07-02 — See the reasoning behind a recommendation
**As an** Analyst, **I want** the drivers and shown reasoning, **so that** the call is
auditable, not a black box.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `GET /v1/procurement` (reasoning payload) + Claude portfolio brief · **Layer:** both
- **Acceptance criteria:**
  - Given a recommendation, when I expand it, then it shows the contributing signals (demand forecast, price forecast, reserves, supplier cost/risk, news) and a plain-language rationale.
  - Given the Claude brief, when present, then it renders; when the AI is unavailable, then the numeric recommendation still renders (graceful degradation).

### NEX-07-03 — Recompute recommendations
**As an** Org Admin / System, **I want** to recompute procurement calls, **so that** they
reflect the latest data.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `POST /v1/procurement/recompute` · **Layer:** both
- **Acceptance criteria:**
  - Given new data, when recompute runs, then recommendations update and the action is audited (G5); Analysts cannot trigger it (G6).

### NEX-07-04 — Configure the optimizer
**As an** Org Admin, **I want** to tune the optimizer's config, **so that** it reflects our
risk appetite (config-not-code).
- **Type:** Replicate · **Priority:** P2 · **POC ref:** `PUT /v1/procurement/config` · **Layer:** both
- **Acceptance criteria:**
  - Given config, when I change it, then recommendations recompute, config persists and is audited (G5); Analysts cannot change it (G6).
