# Procurement Optimizer — Methodology & Assumptions

**Module:** Procurement (`/procurement`) · backend `backend/src/procurement/`
**Purpose:** turn the platform's signals into an actionable, **auditable** recommendation per
commodity — **BUY NOW / HOLD / DEFER** — with quantity, timing, recommended origins, and the
reasoning behind every call. **Last updated:** 2026-09.

This is decision support, not automation: it recommends and explains; a human procures.

## 1. Inputs (all already live in the platform)

| Signal | Source | Used for |
|---|---|---|
| Demand projection (12-mo, deficit months, peak) | Demand module (`DemandService`) | *when* more is needed and how much |
| Price forecast (3-mo % move, R²) | `commodityPrice` (World Bank monthly), OLS in-service | is it cheap now / rising or falling |
| Reserves (days of supply, target gap) | `stockLevel` (USDA PSD) | buffer available; replenishment need |
| Supplier cost + risk | `supplierCountry` (implied `usd/volumeMt`, `riskScore`, `climateScore`, `foodSafetyAlerts`, share) | *where* to buy, risk-adjusted |
| News signals (recent high-severity) | `newsSignal` (GDELT + Claude) | leading-indicator override |

No new external source — the optimizer only reads and combines.

## 2. Decision logic (rule-based, transparent)

Per commodity, factors accumulate an **urgency (0–100)** and push toward BUY or DEFER; each
factor writes a reasoning line:

| Factor | Rule | Urgency | Pushes |
|---|---|---|---|
| Reserves | days of supply < `reserveWatchDays` (60) | +30 | BUY |
| Demand timing | a projected deficit falls within `leadTimeWeeks` (8) | +30 | BUY |
| Price | forecast rising ≥ `priceSlopeThreshold` (2%) at R² ≥ `minForecastConfidence` (0.3) | +20 | BUY |
| Price | forecast falling ≤ −2% (confident) | — | DEFER |
| News | high-severity export-ban/drought/logistics/disease/policy for the commodity | +25 | BUY |

**Action:** BUY if any BUY factor fired; DEFER if only the falling-price factor fired; else HOLD.
Urgency is capped lower for HOLD/DEFER so BUY items sort to the top.

**Quantity:** deficit volume over the 12-mo horizon + (for BUY) the reserve top-up to target →
MT estimate; qualitative low/med/high vs one month of demand.

**Timing window:** BUY → "next `leadTimeWeeks` weeks"; DEFER → "await forecast trough"; HOLD → "monitor".

**Origin ranking:** for the commodity, each supplier scored =
`50 + share·0.4 − riskScore·0.4 − climateScore·0.2 − min(20, foodSafetyAlerts)`.
Top 3 shown; if the dominant origin's `riskScore ≥ 55`, a "diversify" note is added. Implied
unit price (`usd/volumeMt` from Comtrade) is shown per origin as a cost proxy.

**Portfolio brief:** one Claude call summarises the priority (non-HOLD) actions into a short
markdown brief. It summarises the rule-based output — it does not make the decisions.

## 3. Config (tunable, reviewable) — `AppConfig` key `procurement-config`

| Setting | Default | Meaning |
|---|---|---|
| `leadTimeWeeks` | 8 | how far ahead a deficit must be to trigger pre-positioning |
| `priceSlopeThreshold` | 2 (%) | projected 3-mo move counting as rising/falling |
| `minForecastConfidence` | 0.3 (R²) | below this, price trend treated as flat/uncertain |
| `reserveWatchDays` | 60 | reserves below this push BUY |

Editable by admin via `PUT /v1/procurement/config`; recomputes immediately.

## 4. Known simplifications (ceilings)

- **Landed cost** = Comtrade implied unit price + supplier risk as a premium proxy — **no live
  freight/transit** yet (that's the backlogged logistics layer; searoute/paid APIs). Documented.
- **Supply steadiness** inherited from the demand model (annual ÷ 12) — can over-flag structural
  importers (e.g. wheat). See `demand-model-guidelines.md`.
- **Price forecast** is a 12-point linear (OLS) trend — captures direction, not shocks; the news
  override is what injects shock-awareness.
- Rule weights are heuristics — deliberately **tunable config**, not a trained model, so every
  call is explainable.

## 5. How to review / tune
1. Sanity-check each recommendation's reasoning list against reality.
2. Adjust `leadTimeWeeks` to your real procurement + shipping lead time (KSA sea freight is weeks).
3. Adjust `reserveWatchDays` to the strategic reserve policy (see stock-level thresholds).
4. Validate origin risk weighting with SALIC/procurement teams.

Refreshes on boot, every 6h (`@Cron`), and on admin `POST /v1/procurement/recompute`.
Data still needed to sharpen this (live freight, authoritative reserves) is in `docs/data-sources-tracker.md`.
