# Initiatives — Action-Tracking Layer

**Module:** Initiatives (`/initiatives`) · backend `backend/src/initiatives/`
**Purpose:** close the loop. The platform generates actions everywhere (procurement, supplier
risk, reserves, data gaps); Initiatives turns them into **persistent, ownable, trackable** items
so findings become action: **detect → recommend → track → improve.** **Last updated:** 2026-09.

## 1. Two sources

- **Auto-suggested** — derived from current findings on `generate()` (boot + admin trigger),
  deduped by a stable `sourceKey`.
- **Manual** — created by a user (`sourceKey` null), for anything not auto-detected.

## 2. Auto-suggestion rules

| Trigger (live) | Initiative | Owner | sourceKey | Priority |
|---|---|---|---|---|
| `procurementRecommendation.action = buy` | Secure {commodity} supply ahead of deficit | SAGO / SALIC | `procure:{c}` | from urgency |
| import concentration HHI ≥ 0.30 **or** dominant origin `riskScore ≥ 55` | Diversify {commodity} sourcing | SALIC | `diversify:{c}` | from risk |
| `stockLevel.status = low` | Replenish {commodity} strategic reserve | SAGO | `reserve:{c}` | high |
| `indexIndicator.status = pending` | Onboard data source: {label} | SDAIA + authority | `data:{key}` | medium |

Rationale reuses the source's own reasoning (e.g. the procurement reasoning strings). Each item
links to its `linkedCommodity` / `linkedPillar` so completing it maps back to the food-index.

## 3. Status lifecycle

`suggested → approved → in_progress → completed` (+ `dismissed`). Auto items start `suggested`;
manual items start `approved`. **`generate()` only refreshes items still `suggested`** — once a
human advances one, its status is never overwritten (the `sourceKey` upsert respects it).

## 4. Endpoints
- `GET /v1/initiatives` (optional `?status=`) · `POST /v1/initiatives` (manual create) ·
  `PATCH /v1/initiatives/:id` (status / priority / owner) · `POST /v1/initiatives/generate` (admin).

## 5. How it closes the loop
An initiative carries `linkedPillar` / `linkedCommodity`, so a completed "Diversify Rice
sourcing" or "Replenish Corn reserve" maps to the food-index sub-indicator it improves — the
intended feedback from action back to the measured score.

## 6. Ceilings / follow-ons
- Auto-suggestions are **first-order** off persisted findings. **Scenario-run mitigations aren't
  a source yet** (scenarios compute on demand and aren't stored) — a natural follow-on is to let
  a scenario run "promote" its mitigations into tracked initiatives.
- `estimatedCost` / `expectedRoi` fields exist on the model but stay manual/optional (no costing).
