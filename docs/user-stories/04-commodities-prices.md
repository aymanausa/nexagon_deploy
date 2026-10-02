# Epic 04 — Commodities & Prices

Price history, sources, and the commodity catalog. Replicate from POC. POC ref:
`frontend/app/commodities`, `commoditiesApi`, `catalogApi`, `getSelectedCommodities`;
backend `commodities` + `commodities/catalog` controllers.

### NEX-04-01 — View price history per commodity
**As an** Analyst, **I want** price history for a commodity, **so that** I can see the trend
behind the latest number.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `commoditiesApi.getPrices` → `GET /v1/commodities/prices?commodity=&source=` · **Layer:** both
- **Acceptance criteria:**
  - Given a commodity, when I open it, then its price series renders over time.
  - Given no data for a commodity/source, when loaded, then an empty state shows, not an error.

### NEX-04-02 — Filter prices by commodity and source
**As an** Analyst, **I want** to filter by commodity and data source, **so that** I can
compare sources (e.g. FAO vs World Bank).
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `commoditiesApi.getPrices` params, `getAvailable` · **Layer:** both
- **Acceptance criteria:**
  - Given available commodities/sources from `GET /v1/commodities/available`, when I pick filters, then the series updates accordingly.

### NEX-04-03 — Manage the commodity catalog
**As an** Org Admin, **I want** to view and refresh the commodity catalog and toggle which
appear on the dashboard, **so that** the org tracks what matters to it.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `catalogApi` → `GET/POST /v1/commodities/catalog`, `PATCH /v1/commodities/catalog/:id` · **Layer:** both
- **Acceptance criteria:**
  - Given the catalog, when I refresh it, then it repopulates from source and the action is audited (G5).
  - Given a catalog item, when I toggle `showOnDashboard`, then it persists and the dashboard reflects it; Analysts cannot edit the catalog (G6).

### NEX-04-04 — Choose my dashboard commodities
**As an** Analyst, **I want** to pick which commodities show on *my* dashboard, **so that** I
focus on my portfolio.
- **Type:** Replicate · **Priority:** P2 · **POC ref:** `getSelectedCommodities`/`setSelectedCommodities` (localStorage) · **Layer:** frontend
- **Acceptance criteria:**
  - Given a selection, when saved, then it persists for me and drives the dashboard prices panel (NEX-03-02).
  - Given no selection, when the dashboard loads, then all catalog-visible commodities show.
  - **Note:** POC stores this in localStorage; for v1.0 consider persisting per-user server-side so it follows the account across devices.
