# Nexagon — Pitch Deck (12 slides)

Markdown content for a 12-slide deck. Each slide has a title, key points, and a speaker note.

---

## Slide 1 — Title

# Nexagon
### National Food-Security Intelligence for Saudi Arabia
From fragmented data to a proactive decision system.

*Speaker note:* Saudi Arabia imports ~80–85% of its food. Nexagon is the intelligence layer that
measures, anticipates, decides, and pre-empts — turning food security from a reporting problem into
a live decision system.

---

## Slide 2 — The Problem

- KSA imports **~80–85%** of its food — security depends on external, volatile supply lines.
- Critical data is **fragmented and lagging** (prices, trade, reserves, weather, disease, news).
- Decisions — *what to buy, when, from where, what to stockpile* — are made **reactively**, in silos.
- Shocks (export bans, Red Sea/Hormuz disruptions, droughts) hit **before** the data moves.

*Speaker note:* The cost of being late is measured in national exposure and avoidable spend.

---

## Slide 3 — The Solution

**Nexagon** — one platform that runs the full food-security decision loop:

**Detect → Measure → Anticipate → Decide → Stress-test → Track**

A live, AI-driven, multi-source system that quantifies national food security and recommends action.

*Speaker note:* Not another dashboard — a closed loop from a world event to a tracked decision.

---

## Slide 4 — The Live Data Layer

Ingests real data today (mostly free public APIs), normalised into one model:

- **Prices** — FAO FAOSTAT + World Bank Pink Sheet
- **Trade / suppliers** — UN Comtrade (KSA import flows by country & commodity)
- **Reserves** — USDA PSD · **Production/consumption** — FAO FBS
- **Risk overlays** — World Bank WGI (political), NASA POWER (climate), FAO EMPRES-i (animal disease), EU RASFF (food safety), World Bank (health)
- **World news** — GDELT

*Speaker note:* Architecture is ingest→normalise→store→serve; every source is swappable to a
Saudi-authoritative feed (SAGO, GASTAT, MEWA…) with no rework.

---

## Slide 5 — Measure: the Food-Security Index

- A **4-pillar composite index (0–100)**: Availability (30%), Access (25%), Utilization (20%), Stability (25%).
- **16 sub-indicators**, 13 computed live from real data; pending ones re-normalise transparently.
- One number for national food security — with full drill-down and trend.

*Speaker note:* Availability=production/reserves/import-capacity/water; Stability=geo/climate/supply-chain/cyber.
Turns "how secure are we?" into a tracked KPI.

---

## Slide 6 — Anticipate: Demand & Reserves

- **Demand Forecast:** FAO consumption baseline shaped by **Ramadan & Hajj** (computed from the
  Islamic calendar) + population growth → month-by-month demand, with **deficit months** flagged.
- **Strategic reserves:** days-of-supply vs configurable thresholds.
- Output: *when* we'll need more, and *how much* — the trigger for procurement.

*Speaker note:* KSA demand is uniquely predictable (Ramadan/Hajj) — we exploit that to buy ahead of peaks.

---

## Slide 7 — Decide: the Procurement Optimizer

Per commodity, a transparent **BUY / HOLD / DEFER** call combining:
demand deficits + price forecast + reserves + supplier cost/risk + live news →
**urgency, quantity, timing window, risk-adjusted origins, and shown reasoning.**

*Speaker note:* Verified live — e.g. "Wheat: BUY now, pre-position ahead of a projected deficit; origins Canada/Australia (low risk)." Every call is auditable.

---

## Slide 8 — Detect: World-News AI Signals

- **GDELT global news → Claude** classifies each headline into a structured signal
  `{commodity, country, event type, severity, KSA relevance}`.
- A daily **AI "Food-Security Signal Brief"** with recommended watch actions.
- The **leading indicator** — catches export bans, droughts, port disruptions early.

*Speaker note:* Real output caught escalating Hormuz-corridor risk to Dammam and recommended rerouting — before it hit prices.

---

## Slide 9 — Stress-test: the Scenario Simulator (Proactive)

Four ways to ask "what if?":
1. **Templates** (Red Sea closure, India rice ban, Brazil drought, Hajj surge…)
2. **Custom builder** — compose any shock
3. **Natural language** — *"India bans rice exports and drought hits Brazil"* → Claude → simulation
4. **Autonomous daily generator** — the system watches signals and **stress-tests emerging threats
   itself**, raising an alert + a tracked action when material.

*Speaker note:* Verified on LIVE news — it auto-generated Red Sea & Hormuz corridor scenarios with quantified index impact. This is genuine early warning.

---

## Slide 10 — Track: Initiatives (Closing the Loop)

- Recommendations become **persistent, ownable initiatives** (auto-suggested + manual).
- Each links to the pillar/commodity it improves and an **owning authority** (SAGO / SALIC / MEWA / SFDA).
- Status lifecycle: suggested → approved → in progress → completed.

*Speaker note:* This closes the loop — a world event becomes a tracked action that visibly improves the index.

---

## Slide 11 — Impact & National Alignment

Bridging Vision-2030 localization gaps:
- **Higher local content** — measure self-sufficiency; steer water-smart local production.
- **Spend retained in Kingdom** — optimize procurement timing/origin; recycle savings into local capacity.
- **Stronger local industry** — demand certainty + quality benchmarks + a governed local data/AI capability.
- **Faster & better sourcing** — one decision surface; weeks of analysis → a same-day, auditable call.

*Speaker note:* Nexagon is the intelligence layer that directs, times, and de-risks these national bets.

---

## Slide 12 — Built, Feasible, Scalable — and the Ask

- **Built & running today** on live data (NestJS + Next.js + Postgres, Dockerized).
- **Feasible:** mostly free sources now; every proxy upgrades to an authoritative KSA feed with no rework.
- **Scalable:** source-agnostic, config-driven, modular — extends to more commodities and the GCC.
- **The ask:** authoritative data partnerships (SAGO, GASTAT, MEWA, SFDA) + a pilot mandate to
  operationalize Nexagon as the national food-security decision layer.

*Speaker note:* We've proven the loop end-to-end. With official data feeds and a pilot, it becomes the Kingdom's proactive food-security nerve center.
