# Epic 05 — Stock Levels & Demand Forecast

Days-of-supply (Measure) and forward demand (Anticipate). Replicate from POC. POC ref:
`frontend/app/stock-levels`, `frontend/app/demand`, `stockLevelsApi`, `demandApi`;
backend `stock-levels`, `demand` controllers.

### NEX-05-01 — View days-of-supply per commodity
**As an** Analyst, **I want** days-of-supply per commodity against thresholds, **so that** I
can see what's running low.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `stockLevelsApi.list` → `GET /v1/stock-levels` · **Layer:** both
- **Acceptance criteria:**
  - Given the endpoint, when I view it, then each commodity shows days-of-supply and a status (adequate / watch / low) derived from thresholds.

### NEX-05-02 — Configure stock thresholds
**As an** Org Admin, **I want** to set the adequate/watch day thresholds, **so that** status
reflects our policy (config-not-code).
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `stockLevelsApi.getThresholds/setThresholds` → `GET/PUT /v1/stock-levels/thresholds` · **Layer:** both
- **Acceptance criteria:**
  - Given thresholds, when I change them, then statuses recompute, the change persists and is audited (G5); Analysts cannot change them (G6).

### NEX-05-03 — View demand forecast with deficit months
**As an** Analyst, **I want** month-by-month demand shaped by Ramadan/Hajj and population
growth, **so that** I know when demand peaks and reserves may fall short.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `demandApi.get` → `GET /v1/demand` · **Layer:** both
- **Acceptance criteria:**
  - Given the forecast, when I view it, then demand renders month-by-month with deficit months clearly flagged.
  - Given the Islamic calendar drives Ramadan/Hajj uplift, when the forecast is built, then those peaks appear in the correct months.

### NEX-05-04 — Configure demand assumptions
**As an** Org Admin, **I want** to tune the Ramadan/Hajj/population-growth assumptions, **so that**
the forecast matches our planning basis.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `demandApi.getAssumptions/setAssumptions` → `GET/PUT /v1/demand/assumptions` · **Layer:** both
- **Acceptance criteria:**
  - Given assumptions (`ramadanUpliftPct`, `hajjUpliftPct`, `populationGrowthPct`), when I change them, then the forecast recomputes, persists, and is audited (G5); Analysts cannot change them (G6).

### NEX-05-05 — Refresh stock/demand data
**As an** Org Admin / System, **I want** to refresh stock and demand data, **so that** they
reflect the latest inputs.
- **Type:** Replicate · **Priority:** P2 · **POC ref:** `POST /v1/stock-levels/refresh`, `POST /v1/demand/refresh` · **Layer:** both
- **Acceptance criteria:**
  - Given a refresh trigger, when run, then data updates and the action is audited; scheduled runs act as System.
