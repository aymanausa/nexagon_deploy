# Demand Forecast — Methodology & Assumptions

**Module:** Demand Forecast (`/demand`) · backend `backend/src/demand/`
**Purpose:** project 12 months of KSA demand per commodity and compare it to supply, so
procurement can be timed ahead of demand peaks. **Last updated:** 2026-09.

This document exists so the model is **not a black box** — every input and coefficient is
listed with its source, default, and the authority that should validate it.

## 1. What it computes

For each tracked commodity, a month-by-month projection for the next 12 months:

```
demand(month)  = baselineMonthly × seasonalMultiplier(month) × populationGrowth(month)
supply(month)  = (annualProduction + annualImports) / 12          (steady baseline)
balance(month) = supply − demand        → deficit flag if supply < 95% of demand
```

Outputs per commodity: monthly demand vs supply, the **peak demand month**, and the
**projected deficit months** (with a recommended pre-position / forward-buy action).

## 2. Inputs (data)

| Input | Meaning | Source (current) | Authoritative upgrade |
|---|---|---|---|
| `annualConsumptionMt` | domestic supply / consumption | **FAO FBS** (element 5301) | GASTAT HIES, MEWA |
| `annualProductionMt` | domestic production | **FAO FBS** (element 5511) | MEWA |
| `annualImportsMt` | imports | **UN Comtrade** (summed supplier breakdown) | GASTAT trade / ZATCA |

Commodities covered: Wheat, Rice, Barley, Palm Oil, Sugar, Chicken (the FBS set). Baselines
refresh on boot and via admin `POST /v1/demand/refresh`.

## 3. Seasonality — deterministic timing, estimated magnitude

**Timing is exact.** Ramadan and Hajj windows are read from the built-in Islamic (Hijri)
calendar (`Intl … en-u-ca-islamic`): Ramadan = Hijri month 9, Hajj = Hijri month 12 (days 1–13).
For each Gregorian month we compute the *fraction* of its days falling in each window — so a
Ramadan that straddles two months is split correctly. No hardcoded dates; it stays correct
year over year (Ramadan moves ~11 days earlier annually).

**Magnitude is estimated** and exposed as tunable coefficients:

| Coefficient | Default | Meaning | Where to change | Who should validate |
|---|---|---|---|---|
| `ramadanUpliftPct` | **25%** | general food-demand rise in Ramadan | Settings → Demand Assumptions | GASTAT, SAGO |
| `hajjUpliftPct` | **12%** | national demand rise during the Hajj month | Settings → Demand Assumptions | Ministry of Hajj & Umrah, GASTAT |
| `populationGrowthPct` | **1.6%/yr** | scales future months | Settings → Demand Assumptions | GASTAT |
| per-commodity Ramadan overrides | Rice 35, Sugar 45, Chicken 40, Beef 35, Wheat 20, Barley 10, Palm Oil 25, Milk Powder 30 | staples that spike more | `backend/src/demand/demand.constants.ts` → `RAMADAN_PROFILE` | GASTAT, SAGO |

The three global knobs are stored in `AppConfig` (key `demand-assumptions`) and editable by an
admin in **Settings → Demand Seasonality Assumptions** — no redeploy. Per-commodity overrides
live in code config (documented here) and can be moved to Settings if frequent tuning is needed.

## 4. Known simplifications (ceilings)

- **Supply is modelled as steady** (annual ÷ 12). Real imports/production are themselves seasonal;
  a future version can profile them. Today's value is *timing the demand peaks*, which is the
  main procurement signal.
- **Ramadan magnitude** is a single national uplift (+ per-commodity overrides), not region- or
  income-segmented. GASTAT HIES would allow segmentation.
- **Hajj** is treated as a national monthly uplift; a regional (Makkah/Madinah) and per-pilgrim
  model would be sharper once Ministry of Hajj pilgrim volumes are available.
- **Umrah** (year-round, concentrated in Ramadan) is folded into the Ramadan uplift.

## 5. How to review / calibrate (for authorities)

1. Compare `annualConsumptionMt` per commodity against **GASTAT HIES 2023** food-consumption figures.
2. Validate `ramadanUpliftPct` and the per-commodity overrides against GASTAT/retail Ramadan sales data.
3. Validate `hajjUpliftPct` against Ministry of Hajj pilgrim volumes × per-pilgrim food factors.
4. Adjust the coefficients in Settings; the projection recomputes immediately on read.

Data still needed to upgrade this model is tracked in `docs/data-sources-tracker.md` (rows 24–27).
