# Business Case — Live Logistics Layer (Paid Data)

**Product:** Nexagon — Saudi Food-Security Intelligence
**Feature:** Real-time supply-line disruption detection for import suppliers
**Status:** Backlog / pre-decision (needs vendor quotes)
**Date:** 2026-09

## 1. Problem

Nexagon already maps *who* supplies KSA food (UN Comtrade), governance risk (World Bank WGI) and crop-region weather stress (NASA POWER) — all free. What it **cannot** see is the **physical movement of cargo**: whether a KSA-bound shipment has been delayed, rerouted, or is stuck in port congestion. For an early-warning system, the transit leg is a major blind spot — most KSA grain arrives by sea through a few chokepoints.

## 2. What we can do for free (already planned)

Static **distance + estimated transit time** per supplier lane is computable **free** with the open-source `searoute` library (sea-lane-accurate distance) ÷ typical bulk-carrier speed + port dwell. This covers "how far / roughly how long" and needs **no paid API**. It is the baseline and should ship as part of the load-port work.

## 3. What only paid data provides (the ask)

| Capability | Source | EWS value |
|---|---|---|
| Live vessel position, ETA, **route diversion** | MarineTraffic-Kpler (AIS) | Detect a Bab-el-Mandeb/Suez closure forcing a Cape reroute (+10–14 days) **as it happens** |
| **Port congestion** / port calls | MarineTraffic-Kpler | Flag backlog at load/discharge ports |
| **Freight rate** per lane | SeaRates Logistics Explorer | Cost/affordability signal (shipping-cost spikes) |

The justification is **not** "distance/time" (free covers that) — it is **live disruption detection**, which is squarely the platform's early-warning mission and is paid-only.

## 4. Cost

Both vendors are **quote-only** as of 2026-09 — no public API pricing:
- **MarineTraffic** (now **Kpler**): API access is enterprise/negotiated; legacy credit packs discontinued.
- **SeaRates**: Distance&Time and Logistics Explorer (rates) are Bearer-token APIs, priced by request volume on request.

**To obtain a real number, request quotes specifying:** endpoints needed (vessel positions / voyage-ETA / port calls, or freight rates), real-time vs historical, calls per month, number of lanes/vessels tracked, and any evaluation/startup tier.

## 5. Recommendation

1. **Ship the free baseline** (searoute distance + estimated time) with the load-port curation — no spend.
2. **Scope paid to the live capability only.** Prioritize **MarineTraffic-Kpler live ETA/route-diversion** (highest EWS value); treat SeaRates freight rates as a separate, optional cost-signal add-on.
3. **Decision gate:** proceed to paid only if a quote lands within budget **and** we can point to concrete disruption episodes it would have caught (e.g., 2024–25 Red Sea reroutes). Architecture is ready either way — a `SupplierCountry.transitTimeDays` / new transit fields, populated free now and swappable to live data later with no frontend change (same multi-source pattern as Comtrade/WGI/NASA POWER).

## 6. Next steps

- [ ] Send quote requests to Kpler (MarineTraffic API) and SeaRates with the specs in §4
- [ ] Build free `searoute` distance/time baseline (bundled with load-port curation)
- [ ] Re-evaluate paid live layer once quotes are in, against §5 decision gate

**Sources:** MarineTraffic pricing (G2 / Data Docked AIS comparison); SeaRates Distance & Time + Logistics Explorer API docs (searates.com/pricing/distance-time, docs.searates.com).
