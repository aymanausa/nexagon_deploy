# Scenario Simulator — Methodology

**Module:** Scenarios (`/scenarios`) · backend `backend/src/simulation/`
**Purpose:** a **what-if stress test** — apply a shock to KSA's food system and re-run the
platform's own engines (food-security index, demand, procurement) to show the **first-order
before→after impact** and recommended mitigations. **Last updated:** 2026-09.

It runs entirely on **live baselines already in the system** — no new external data. It answers
"what breaks us, and what do we do about it."

## 1. A scenario = typed shocks

Templates live in `simulation.constants.ts` (`SCENARIO_TEMPLATES`). Each declares shocks:

| Shock | Effect |
|---|---|
| `suppliersOffline: [ISO2]` | remove those countries' import share |
| `importCutPct: {commodity: %}` | reduce a commodity's imports |
| `productionCutPct: {commodity: %}` | reduce domestic production |
| `priceShockPct: {commodity: %}` | raise price |
| `demandSurgePct: %` | lift national demand (e.g. Hajj) |
| `transitDelayDays` | logistics stress (narrative + mitigation) |

Shipped templates: **Red Sea / Bab-el-Mandeb closure**, **Hormuz / Dammam corridor**, **India
rice export ban**, **Black Sea grain disruption**, **Brazil drought**, **Peak Hajj surge**.

## 2. What gets recomputed (reuses our own formulas)

Baselines loaded: `indexIndicator` (sub-scores), `supplierCountry`, demand projection
(`DemandService.list()`), `procurementRecommendation`. Shocks are applied to in-memory copies;
the **directly-affected** sub-indicators are recomputed with the **same formulas as
`food-index.service.ts`** (rolled up via the shared `PILLARS`/`INDICATORS` weights):

- **suppliersOffline** → drop shares → `supplyChain` = clamp((1−HHI)·100) over remaining
  (renormalised); `importCapacity` = clamp(remaining count ÷ 60 · 100); `geoRisk` =
  100 − import-weighted risk over remaining. → overall index falls.
- **importCut / productionCut / demandSurge** → new monthly supply = (prod·(1−cut) + imports·(1−cut))/12,
  new demand = baseline·(1+surge); recount **deficit months** per commodity.
- **priceShock** → `affordability` = clamp(baseline − avg shock · 2.5).
- **Import-coverage penalty** → `importCapacity` is reduced by the share of the total import
  portfolio (by tonnage) that the shock removes, so the overall index responds in proportion to
  how much of KSA's imports are actually hit (a single-commodity ban dents it; a multi-grain
  corridor loss dents it more).
- **Procurement flip:** a commodity whose deficit worsens, imports drop >15%, or price shock >5%
  → action flips to **BUY**.

Output: overall index before→after (Δ) + per-pillar; per-commodity import change, deficit
before/after, action before/after; rule-based mitigations; and a Claude "crisis brief".

## 3. Endpoints
- `GET /v1/simulation/templates` — scenario catalog.
- `POST /v1/simulation/run { key }` — compute-on-demand (no persistence); returns the impact.

## 4. Known simplifications (ceilings)
- **First-order only** — recomputes the sub-indicators a shock *directly* touches; others held
  at baseline. It does not model full multi-round cascades (e.g. second-order price feedback).
- Inherits the **demand model's steady-supply** and **procurement rule weights** (see their
  guideline docs) — same ceilings apply.
- Supplier-offline redistributes concentration among remaining partners but does **not** model
  new-supplier onboarding time; the mitigation text calls that out qualitatively.
- Shock magnitudes in templates are **scenario assumptions** (illustrative but realistic) — edit
  `SCENARIO_TEMPLATES` to calibrate with SALIC/GASTAT.

## 5. How to add / tune a scenario
Add an entry to `SCENARIO_TEMPLATES` with its `shocks`. No schema or frontend change needed —
it appears as a card automatically. Tune magnitudes (import cuts, price shocks) against real
episodes (e.g. the 2023 India rice ban, 2024 Red Sea disruptions).
