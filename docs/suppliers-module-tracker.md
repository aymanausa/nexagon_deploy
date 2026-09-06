# Suppliers Module — Build Tracker & Backlog

**Product:** Nexagon — Saudi Food-Security Intelligence (v2)
**Module:** Suppliers (import-origins map + overlays)
**Last updated:** 2026-09-06

This document tracks everything built for the Suppliers module, the live data sources
behind it, and the backlog with justifications so nothing is lost.

---

## 1. Architecture (how every layer works)

**Pattern: ingest → normalise → store → serve.** The backend ingests each source on a
schedule, normalises it, and upserts into one Postgres table (`SupplierCountry`, keyed by
`countryCode` / ISO2). The frontend reads only our API (`/api/v1/suppliers`) — it never
calls an external source directly.

**Multi-source, one row per country.** Each source owns its own columns of the same row,
so re-running one ingester never clobbers another's data:

| Source owns | Columns |
|---|---|
| UN Comtrade (trade) | `shareOfImports`, `totalVolumeMt`, `commodities`, `breakdown`, `m49`, `iso3`, `flag` |
| World Bank WGI (governance risk) | `politicalRisk`, `economicRisk`, `riskScore` |
| NASA POWER (climate) | `climateScore`, `climateRisk` |
| FAO EMPRES-i (animal disease) | `diseaseEvents90d`, `diseaseTop` |
| EU RASFF (food safety) | `foodSafetyAlerts` |
| World Bank (health capacity) | `healthExpPctGdp` |
| Composite | `healthScore` |

**Refresh tiers** (`backend/src/suppliers/suppliers.service.ts`):
- `refreshAll()` — trade + WGI risk. Fast. Runs on the per-commodity toggle auto-refresh.
- `refreshFull()` — everything incl. climate + country-health (slow, external calls). Runs on boot and the admin `POST /suppliers/refresh`.

---

## 2. What's built (DONE)

### 2.1 Trade flows — UN Comtrade ✅
- **Source:** `comtradeapi.un.org` (paid key in `.env` as `COMTRADE_API_KEY`).
- KSA (reporter 682) food imports by partner country, for the HS codes of the **watched commodities** (catalog `Commodity.hsCode`, `showOnDashboard = true`).
- Produces share of imports (by USD value), volume (MT), commodity list, and a **per-commodity `breakdown`** for the map's commodity filter.
- **Follows the watched set:** enabling/disabling a commodity in Settings auto-refreshes suppliers (fire-and-forget) if it has an HS code. ~109 partner countries, Comtrade 2025.

### 2.2 Governance risk — World Bank WGI ✅
- **Source:** `api.worldbank.org/v2` (free, keyless), indicators `GOV_WGI_PV.SC` (political stability) + `GOV_WGI_GE.SC` (government effectiveness), 0–100 scores, joined by ISO3.
- Maps to `politicalRisk` / `economicRisk` bands + composite `riskScore` (0–100, higher = riskier).

### 2.3 Climate stress — NASA POWER ✅
- **Source:** `power.larc.nasa.gov` (free, keyless), precipitation + temperature.
- Growing-season weather stress = rainfall deficit vs long-term climatology (drought, 60%) + temperature anomaly (heat, 40%), at a **curated crop-region coordinate** per supplier.
- Covers the top ~30 suppliers with curated coords (`CROP_COORDS`); others show n/a.

### 2.4 Country health ✅ (3 of 4 sub-signals)
- **Animal disease — FAO EMPRES-i** (`api.data.apps.fao.org`, free): confirmed animal-disease events (HPAI/ASF/FMD) in the last 90 days, counted per country → `diseaseEvents90d` + top diseases. The strongest signal (drives meat/poultry export bans).
- **Food safety — EU RASFF** (`webgate.ec.europa.eu/rasff-window` backend, **unofficial**): recent food/feed alerts counted by origin country → `foodSafetyAlerts`. **Recent-alerts sample, not a full-year track record** (see backlog).
- **Health capacity — World Bank** `SH.XPD.CHEX.GD.ZS` (free): current health expenditure % of GDP → `healthExpPctGdp`. Structural capacity proxy.
- Composite `healthScore` (0–100) folds the three, reweighting when a component is absent.

### 2.5 Frontend (Suppliers page) ✅
- World **choropleth map** (`react-simple-maps`) with a shade toggle: **Share · Risk · Climate · Health**.
- **Commodity filter** — re-scopes map/table/KPIs to one commodity (from the per-commodity `breakdown`).
- **Hover data card** — flag, rank, share, volume, governance risk, climate stress, and the country-health block (score, disease + top disease, food-safety alerts, health spend).
- **Click a country / table row** → focuses the AI Insights panel on it (`suppliers` context), which now reasons over trade + all three risk dimensions.
- Top-supplier table with a Risk column.

### 2.6 Live Data lineage ✅
The Suppliers dataset shows all **six providers** with live status/record counts:
UN Comtrade · World Bank WGI · NASA POWER · FAO EMPRES-i · EU RASFF · World Bank (Health).

---

## 3. Backlog (LEFT TO DO, with justification)

### 3.1 Human disease — ReliefWeb v2 ⏳ ON HOLD (waiting on appname)
- **Why not done:** ReliefWeb v2 requires an **approved appname** (free, requested via their form). WHO DON RSS — the originally-proposed source — is **dead (404)**; ReliefWeb is the replacement.
- **Status:** appname form submitted 2026-09-06, expected within ~2 days.
- **When it lands:** wire as the 4th country-health sub-signal (epidemics filtered by `disaster_type=Epidemic` + country ISO3), fold into `healthScore`.
- **Priority:** low — human outbreaks are the least food-export-relevant of the health signals.

### 3.2 RASFF proper per-country track record ⏳ DEFERRED
- **Why deferred:** the RASFF backend is **unofficial**, hard-caps `pageSize` at 10, and ignores ISO-based filters — a real per-country count needs its **internal country-ID filter DTO reverse-engineered**. Current implementation scans a bounded recent window (100 pages × 10) and counts by origin = a **recent-alerts sample**, not a full-year record.
- **Risk:** unofficial endpoint may change without notice.
- **Upgrade path:** capture the SPA's filter payload (country → internal ID), then read `totalElements` per supplier in one call each for an accurate trailing-window count.

### 3.3 Widen climate coordinate coverage ⏳ DEFERRED
- **Why deferred:** user chose the hybrid approach; `CROP_COORDS` currently covers ~30 top suppliers (23–24 scored). The rest show climate n/a.
- **Upgrade path:** extend `CROP_COORDS`, or add a country-centroid fallback for the long tail.
- Tracked in memory: `nexamind-widen-climate-coords-backlog`.

### 3.4 Load port per supplier ⏳ DEFERRED
- **Why deferred:** "most-frequent load port for KSA-bound cargo" is premium data. Panjiva (proposed) is **paid/enterprise and US-import-centric** — KSA-inbound bill-of-lading coverage unverified; would break the all-free source pattern. Comtrade has no port dimension.
- **Recommended path:** curated static "principal export port" per major supplier (~30, free), labelled honestly (not KSA-specific); swap to real BL data later via a `loadPort` column if a paid source is justified.
- Tracked in memory: `nexamind-load-port-backlog`.

### 3.5 Transit distance/time + paid live-logistics layer ⏳ DEFERRED
- **Free baseline:** distance + estimated transit time via open-source `searoute` (needs the load-port coords from 3.4 — same logistics layer).
- **Paid live layer:** real-time ETA / route diversion + port congestion (MarineTraffic-Kpler) and/or freight rates (SeaRates). Both **quote-only** (no public pricing). Justification is **live disruption detection**, not distance (free covers that).
- **Business case written:** `docs/live-logistics-business-case.md` (incl. decision gate + vendor-quote specs).
- Tracked in memory: `nexamind-live-logistics-backlog`.

---

## 4. Known ceilings / honesty notes

- **Climate score** is a single-point, trailing-12-month proxy — a rough signal; some values are debatable. Refinements: per-commodity growing-season windows, multiple points per country, or CHIRPS for rainfall accuracy in sparse regions.
- **RASFF** is the only unofficial source and only a recent sample (see 3.2).
- **Composite scores** (`riskScore`, `healthScore`, `climateScore`) use heuristic thresholds; raw components are kept visible in the hover card and AI insights so users see the real numbers.
- **Source freshness** is tracked at source level via the Live Data lineage; per-column timestamps are not split yet (single `lastUpdated`) — fine until a source lags enough to matter.

---

## 5. Source summary

| Dimension | Source | Cost | Status |
|---|---|---|---|
| Trade flows | UN Comtrade | Paid key | ✅ Live |
| Governance risk | World Bank WGI | Free | ✅ Live |
| Climate stress | NASA POWER | Free | ✅ Live (top ~30) |
| Animal disease | FAO EMPRES-i | Free | ✅ Live |
| Food safety | EU RASFF (unofficial) | Free | ✅ Live (recent sample) |
| Health capacity | World Bank | Free | ✅ Live |
| Human disease | ReliefWeb v2 | Free (appname) | ⏳ On hold |
| Load port | curated / Panjiva | Free / Paid | ⏳ Backlog |
| Transit distance/time | searoute (free) / SeaRates (paid) | Mixed | ⏳ Backlog |
| Live vessel ETA / congestion | MarineTraffic-Kpler | Paid (quote) | ⏳ Backlog |
