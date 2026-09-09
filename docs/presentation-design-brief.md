# Nexagon — Presentation Design Brief (master input for a design AI)

**Purpose of this document:** give a design tool (or designer) *everything* needed to produce a
polished, 3–5 minute, video-paired pitch deck organized around the six evaluation criteria. It
contains the story, the real data (with sources + how each number was derived), the design system,
a module glossary, and a deep per-slide brief. Nothing here is invented — every figure is produced
live by the platform or cited to a public source.

---

## 0. How to use this brief
- The deck has **10 slides ≈ 4:00**. Each criterion is framed as **a judge's question**, answered with a **live proof**.
- The creative spine is the **Nexagon Loop** (Detect → Measure → Anticipate → Decide → Stress-test → Track).
- Use **real captured UI** wherever possible (this brief names which screen for each slide).
- Keep numbers **consistent** across deck + video (see the Data Pack §4).
- Tone: national-scale, confident, *in control* — never alarmist.

---

## 1. Project snapshot

**What it is:** Nexagon is a **national food-security intelligence platform for Saudi Arabia** — a
live, AI-driven decision system that measures the Kingdom's food security, anticipates demand,
optimizes procurement, watches the world for threats, stress-tests them, and tracks the response.
It is a working software product (NestJS + Next.js + PostgreSQL, Dockerized), ingesting real data
from 10+ public sources today.

**The goal (say it up front, echo at the close):**
> *Secure Saudi Arabia's food supply — turn an 80% import dependency into a proactively managed,
> optimized, and resilient national system, aligned with Vision 2030.*

**The problem it solves:** KSA imports ~80–85% of its food. The data needed to manage that (prices,
trade, reserves, weather, disease, news) is **fragmented and lagging**, so decisions — what to buy,
when, from where, what to stockpile — are made **reactively**, after shocks (export bans, Red Sea /
Hormuz disruptions, droughts) have already moved. Nexagon closes that gap with one proactive loop.

**The one-sentence pitch:** *From a headline half a world away to a tracked decision that protects
Saudi tables — in one continuous, mostly-autonomous loop.*

---

## 2. Audience & context
- **Audience:** hackathon judges + government/food-security stakeholders (SAGO, SALIC, MEWA, GASTAT, SFDA, SDAIA).
- **They score on six weighted criteria:** Impact 25%, AI & Emerging Tech 20%, Feasibility 15%,
  Novelty 15%, Sustainability 15%, Scalability 10%.
- **Format:** 3–5 minute talk, paired with a screen-capture video of the real product.
- **Win condition:** prove the platform *hits every criterion* with concrete, sourced evidence — and
  tell it as one coherent story (the Loop), not six disconnected claims.

---

## 3. Design system (visual language)

**Palette (from the product UI — use these hex):**
- Background deep navy: `#0B1628` (darkest), panels `#0f1d2f`, insets `#080e1a`
- Borders/hairlines: `#1a2d45`
- **Signature gold (primary accent):** `#c8a45c`
- Text: primary `#e2e8f0` / `#ffffff`, secondary `#94a3b8`, muted `#64748b`, body `#cbd5e1`
- Status accents: emerald `#10b981` (good/defer), amber `#f59e0b` (watch/hold), red `#ef4444`/`#dc2626` (risk/buy), cyan `#22d3ee` (sustainability/water), blue `#3b82f6`, purple `#a855f7`

**Logo/mark:** a **gold hexagon** (the "Nexagon" mark). Wordmark in a techy geometric face
(product uses *Orbitron* for the logo); body copy in a clean sans (Inter/again similar).

**Motion:** calm, purposeful data-motion — dials easing to a value, numbers counting up, a ring
(the Loop) lighting node-by-node, a world map with pulsing shipping lanes. Avoid frantic/flashy.

**Imagery:** Saudi ports at dawn, grain handling, a family meal (the human stakes), satellite/earth,
subtle Arabic-geometry motifs. One recurring **human anchor** (a decision-maker at a screen) to keep
it about people, not dashboards.

**Chart style:** dark background, gold/emerald/red data, thin `#1a2d45` gridlines, rounded corners,
generous whitespace. Prefer one hero number + one supporting chart per slide (don't crowd).

---

## 4. The Data Pack (every real number, with source + derivation)

> All values are produced live by the platform (endpoint noted) or cited to a public dataset. Round
> for slides as shown. Keep the Food-Security Index at **71** and Red-Sea scenario **71→70** everywhere.

**National context**
- Food import dependence: **~80–85%** — FAO / GASTAT (national statistic).

**Economic impact** (endpoint `/impact`; base data: UN Comtrade)
- **Total tracked food-import value: ~$11.9 billion / year** (exact: $11,887,333,971). Source: UN
  Comtrade KSA imports for the tracked HS food codes, summed.
- **Estimated annual timing opportunity: ~$144 million** ($144,233,173). Derivation: Σ over
  commodities of (import value × 12-month price volatility × 25% capture rate). Volatility from World
  Bank Pink Sheet monthly prices. *Framed as an addressable opportunity, not booked savings.*
- **Import value at high-risk origins: ~$765 million (6.4%)** ($764,850,398). Derivation: import
  value from suppliers whose World Bank WGI governance risk ≥ 55.
- **Top-origin concentration: Brazil 26.4%** of tracked import value.
- **Top saving drivers:** Rice $35.2M (8.3% price volatility), Sugar $26.9M (9%), Chicken $17.1M
  (4.4%), Corn $16.7M (4.8%).

**Food-Security Index** (endpoint `/food-index`; page `/risk-heatmap`)
- **Overall: 71 / 100** (target 85). Pillars: **Availability 59, Access 87, Utilization 73, Stability 69.**
- **16 sub-indicators; 13 live** from real data (3 pending authoritative feeds: SafetyNet, RetailOSA, CyberResilience).
- Example sub-indicators: Reserves (USDA PSD), Production (FAOSTAT QCL), GeoRisk (WGI, import-weighted),
  ClimateVol (NASA POWER), Nutrition (FAO FS), Health (World Bank), Affordability (price basket).

**Sustainability** (endpoint `/sustainability`)
- **Virtual (embedded) water imported: ~39.2 billion m³ / year = 16.3× KSA's renewable water.**
  Derivation: Σ (commodity import volume [Comtrade] × water-footprint [Water Footprint Network /
  Mekonnen & Hoekstra averages]); ÷ KSA renewable water ≈ **2.4 billion m³** (FAO AQUASTAT).
- Water drivers (B m³): **Barley 6.75, Wheat 6.56, Corn 5.92, Rice 4.47.**
- **Shipping CO₂: ~1.2 million tonnes / year** (great-circle distance origin→Jeddah × volume × bulk-freight factor; ~97% of import volume has coordinates).

**Suppliers** (page `/suppliers`)
- **~109 partner countries**, mapped, with per-commodity breakdown. Overlays: World Bank WGI
  (political/economic risk), NASA POWER (climate stress), FAO EMPRES-i (animal disease), EU RASFF
  (food safety), World Bank (health). Top suppliers: Brazil 26.4%, India ~14%, Argentina ~10%, Russia, Romania, Australia, USA, Indonesia.

**Demand** (page `/demand`)
- Wheat: **5.79M MT/yr** consumption, **23%** self-sufficient. Chicken: 1.43M MT, **74%** self-sufficient.
- Seasonality computed from the Islamic calendar: **Ramadan** peak (e.g., Feb 2027) with per-commodity
  uplifts (Rice +35%, Sugar +45%, Chicken +40%, Wheat +20%), plus a **Hajj** uplift and population growth.

**Procurement** (page `/procurement`)
- Verified live calls: **Wheat BUY** (pre-position ahead of a projected deficit), **Chicken BUY**
  (rising price), **Rice / Sugar DEFER** (adequate reserves + falling price), **Barley / Palm Oil HOLD.**
  Each with urgency, quantity, timing window, risk-adjusted origins, and shown reasoning.

**News AI signals** (page `/news`) — **GDELT** global news → **Claude** classification into
`{commodity, country, event type, severity, KSA relevance}` + a daily brief. Real recent signals
included escalating Hormuz-corridor risk to Dammam.

**Scenario simulator** (page `/scenarios`)
- Red Sea closure: index **71→70**. Natural-language "India bans rice exports and drought hits Brazil":
  index **71→60**. **Autonomous generator** produced **Red Sea** and **Hormuz** corridor scenarios from
  *live* news (not seeded). Four modes: templates, custom builder, natural language, autonomous.

**Initiatives** (page `/initiatives`) — **15 auto-suggested** actions from live findings (e.g. "Secure
Wheat supply", "Diversify Rice sourcing", "Replenish Corn reserve", "Onboard data source: Safety Net"),
each with an owning authority (SAGO/SALIC/MEWA/SFDA) and a status lifecycle.

**Platform / feasibility**
- **12 live datasets** wired; **27** cataloged with an upgrade path in the data-sources tracker.
- Sources are mostly **free public APIs**; one paid key (**UN Comtrade**).
- Stack: **NestJS + Next.js + PostgreSQL + Redis, Docker.** AI: **Anthropic Claude (claude-opus-4-8).**
- Architecture: **ingest → normalise → store → serve**; every proxy upgrades to an authoritative KSA
  feed with no read-path/frontend change.

**Evaluation (self-assessed, justified in `docs/evaluation-criteria.md`)**
- Impact 93, AI & Tech 91, Feasibility 90, Novelty 84, Sustainability 86, Scalability 90 → **≈ 89.5 / 100** weighted.

---

## 5. Module glossary (one line each — for captions/icons)
- **Food-Security Index** (`/risk-heatmap`): 4-pillar 0–100 national score.
- **Suppliers** (`/suppliers`): import-origin map + risk/climate/disease/food-safety overlays.
- **Stock Levels** (`/stock-levels`): strategic reserves, days of supply.
- **Commodity Prices** (`/commodities`): live monthly/annual prices + forecast.
- **Demand Forecast** (`/demand`): Ramadan/Hajj-aware 12-month demand vs supply.
- **Procurement** (`/procurement`): buy/hold/defer per commodity with reasoning.
- **Live News** (`/news`): GDELT + Claude signals + daily brief.
- **Scenarios** (`/scenarios`): what-if simulator (templates / custom / NL / autonomous).
- **Initiatives** (`/initiatives`): tracked actions with owners.
- **Live Data** (`/live-data`): data-lineage — every source, status, record count.
- **Dashboard** (`/dashboard`): Economic Impact + Sustainability + index + price trends.

---

## 6. Slide-by-slide design brief

> Each slide: **Objective · Big idea · Headline (+alt) · Body copy/context · Featured data (with
> source) · Suggested visual · Layout · Speaker VO (~timing) · Transition.**

### Slide 1 — Title & Hook (0:00–0:20)
- **Objective:** land the stakes and the brand in 15 seconds.
- **Big idea:** food is national security.
- **Headline:** *"80% of our food crosses an ocean to get here."* **Alt:** *"A nation fed by the world."*
- **Body:** the gold hexagon resolves into "NEXAGON — National Food-Security Intelligence."
- **Featured data:** ~80–85% import dependence (FAO/GASTAT).
- **Visual:** cinematic port-at-dawn → grain unloading → family meal; hexagon mark forms.
- **Layout:** full-bleed image, hexagon + wordmark lower third, one big line.
- **VO:** "Saudi Arabia feeds itself from the whole world — a strength, and a dependency. Nexagon turns that dependency into control."
- **Transition:** pull up to a world map.

### Slide 2 — The Goal & The Problem (0:20–0:45)
- **Objective:** state the goal explicitly; frame the pain.
- **Big idea:** we find out too late, across disconnected systems.
- **Headline:** *"The risks arrive before the data does."* Sub: **THE GOAL — secure the Kingdom's food supply, proactively.**
- **Body:** 80–85% imported · fragmented, lagging data · reactive decisions · shocks (export bans, Red Sea/Hormuz, droughts) hit first.
- **Featured data:** import dependence; name the shock types.
- **Visual:** world map, shipping lanes pulsing red one-by-one; a faint news ticker.
- **Layout:** map left, the goal + 4 pain bullets right.
- **VO:** "The goal is national: secure our food supply. The obstacle — we learn about threats too late, across disconnected systems. Nexagon closes that gap."
- **Transition:** the map collapses into a glowing ring (the Loop).

### Slide 3 — The Solution: One Loop (0:45–1:10) — *creative centerpiece*
- **Objective:** show the whole system as one elegant idea.
- **Big idea:** a closed, self-improving decision loop.
- **Headline:** *"Not a dashboard — a decision loop."*
- **Body:** Detect → Measure → Anticipate → Decide → Stress-test → Track → (feeds back to Detect). Completed actions raise the score.
- **Featured data:** Food-Security Index **71/100** (computed, `/food-index`).
- **Visual:** an animated **ring** of six labeled nodes lighting in sequence; the index dial in the center ticks up as the ring closes.
- **Layout:** centered ring, dial in the middle, six node labels.
- **VO:** "Nexagon runs one closed loop: detect a threat, measure our security, anticipate demand, decide the action, stress-test the future, and track it — and the result feeds back and the score improves. Six ways it delivers."
- **Transition:** the ring's nodes fly out to become the six criteria slides.

### Slide 4 — IMPACT (25%) · "Will it matter?" (1:10–1:40)
- **Objective:** put a live national $ number on food security.
- **Big idea:** it manages an $11.9B budget, live.
- **Headline:** *"It manages an $11.9B national food budget — live."*
- **Body:** real import base + optimization opportunity + risk exposure it helps cut; Vision-2030 aligned.
- **Featured data (source: `/impact`, UN Comtrade / World Bank):** $11.9B import value; $144M/yr timing opportunity (25% capture); $765M (6.4%) at high-risk origins; Brazil 26.4% concentration.
- **Visual:** the **Economic Impact** panel with three big counters animating up; a small bar of the top saving drivers (Rice/Sugar/Chicken/Corn).
- **Layout:** hero $11.9B left; three supporting stats right; source caption bottom.
- **VO:** "Impact? Nexagon puts a live number on national food security — an $11.9 billion import base, $144 million a year in timing opportunity, and the risk exposure we can cut."
- **Transition:** counters dissolve into streaming headlines.

### Slide 5 — AI & EMERGING TECH (20%) · "Is it smart?" (1:40–2:10)
- **Objective:** show LLM + autonomy + multi-source fusion.
- **Big idea:** it reads the world and stress-tests threats by itself.
- **Headline:** *"It reads the world — and stress-tests threats by itself."*
- **Body:** Claude classifies GDELT news into signals + daily brief; natural-language what-if → simulation; autonomous daily scenario generation; fusion of satellite/news/trade/disease.
- **Featured data (source: `/news`, `/scenarios`):** GDELT + Claude; NASA POWER; Comtrade; FAO EMPRES-i.
- **Visual:** headlines stream in and **self-tag** (commodity/country/severity chips); a typed sentence morphs into a running simulation.
- **Layout:** left = live signal feed; right = a natural-language box mid-simulation.
- **VO:** "Smart? Its AI reads the world's news as it breaks, understands what each event means for Saudi supply, and — on its own — stress-tests emerging threats before they land."
- **Transition:** the app UI zooms out to show it's a real running product.

### Slide 6 — FEASIBILITY (15%) · "Can it be done?" (2:10–2:35)
- **Objective:** prove it's real and deployable now.
- **Big idea:** already running on live data.
- **Headline:** *"It's already running — on live data, today."*
- **Body:** working platform; mostly free sources + one paid key; every proxy upgrades to an authoritative KSA feed with no rework; documented path (27-dataset tracker).
- **Featured data (source: `/live-data`):** 12 live datasets, 27 cataloged; providers ACTIVE with record counts.
- **Visual:** a real screen-capture clicking through modules; the **Live Data lineage** table (providers, status, counts).
- **Layout:** device frame showing the live app; a checklist of sources.
- **VO:** "Feasible? This isn't a concept deck — it's a working system on real data, built to plug straight into official Saudi feeds."
- **Transition:** cut to the auto-detected scenario cards.

### Slide 7 — NOVELTY (15%) · "Is it new?" (2:35–3:05)
- **Objective:** show the genuinely novel capabilities.
- **Big idea:** ask a crisis in plain English — or let it ask itself.
- **Headline:** *"Ask it a crisis in plain English — or let it ask itself."*
- **Body:** natural-language crisis simulation; autonomous corridor detection (Red Sea/Hormuz from *live* news, not seeded); closed self-improving loop; live satellite+news+trade+disease fusion.
- **Featured data (source: `/scenarios`):** Red Sea corridor 71→70; NL India-rice-ban 71→60; auto scenarios from real GDELT.
- **Visual:** auto-detected scenario cards appear ("Red Sea corridor disruption · 71→70"); then a NL box *"What if the Red Sea closes?"* → the map reroutes around Africa, index dips, commodities flip to BUY, a mitigation appears.
- **Layout:** split — auto cards top, the NL→result animation bottom.
- **VO:** "New? Nexagon lets a decision-maker run a national crisis simulation in a sentence — and it already caught real Red Sea and Hormuz threats on its own."
- **Transition:** a water-drop ripples in for sustainability.

### Slide 8 — SUSTAINABILITY (15%) · "Is it responsible?" (3:05–3:35)
- **Objective:** the water insight + water-smart sourcing.
- **Big idea:** we import 16× our renewable water.
- **Headline:** *"We import 16× our renewable water. Nexagon makes sourcing water-smart."*
- **Body:** virtual water quantified; a water-footprint + food-miles/CO₂ lens steers water-smart, lower-emission sourcing & local production; right-timed procurement cuts waste; low-cost; governed.
- **Featured data (source: `/sustainability`):** 39.2B m³/yr virtual water = 16.3×; drivers Barley/Wheat/Corn/Rice; 1.2M t CO₂.
- **Visual:** the **Sustainability Footprint** panel; the **16.3×** lands as a huge number; a water-drop / two-bar comparison (imports vs renewable water).
- **Layout:** giant 16.3× center-left; supporting stats + drivers right.
- **VO:** "Responsible? Nexagon reveals that our food imports carry sixteen times our own renewable water — and turns that into a water-smart sourcing and localization strategy."
- **Transition:** the map zooms out KSA → GCC.

### Slide 9 — SCALABILITY (10%) · "Will it grow?" (3:35–3:55)
- **Objective:** show it scales by configuration.
- **Big idea:** one commodity → the whole GCC, no rewrite.
- **Headline:** *"From one commodity to the whole GCC — no rewrite."*
- **Body:** source-agnostic, config-driven, modular; add a commodity = one toggle (auto-propagates); add a source = one ingester; FAO/Comtrade already cover GCC by area code.
- **Featured data (source: architecture / `/live-data`):** 10+ integrated sources; one-toggle commodity add.
- **Visual:** a **layered architecture diagram** (spec in §9b) that visually proves "plug in, don't rewrite," with a KSA → GCC map zoom beside it.
- **Layout:** architecture diagram as the hero (left/centre), GCC zoom + 3 scalability call-outs on the right. See **§9b** for the full visual blueprint.
- **VO:** "Scalable? Its architecture grows by configuration, not rewrites — from one commodity to the entire Gulf."
- **Transition:** everything composes into the scorecard.

### §9b — Architecture Visual Guidance (build the Scalability diagram)

**Message the diagram must land in 3 seconds:** *sources plug into a common pipeline, everything
normalises into one store, and many modules are served from it — so growth is "add a plug," not
"rebuild."*

**Layout: five left-to-right layers, arrows flowing →.**

1. **DATA SOURCES** (far left, a vertical stack of small chips):
   UN Comtrade · FAO (FAOSTAT / FBS / AQUASTAT / EMPRES-i) · World Bank (Pink Sheet / WGI / Health) ·
   USDA PSD · NASA POWER · EU RASFF · GDELT.
   Below them, **two dashed chips** to signal extensibility:
   `＋ new source` and `KSA authoritative feeds (SAGO · GASTAT · MEWA · SFDA)`.
   *Colour:* source chips in cyan/blue (`#22d3ee`/`#3b82f6`); dashed chips in muted gold outline.

2. **INGEST + NORMALISE** (one rounded box): "Source ingesters" — fetch · rate-limit backoff + cache ·
   normalise to one model · `@Cron` schedules. *Colour:* gold-outlined box; gold arrows in from every source.

3. **STORE** (a database cylinder): **PostgreSQL — one canonical schema** (+ Redis cache).
   *Colour:* navy cylinder `#0f1d2f` with gold rim.

4. **INTELLIGENCE / COMPUTE** (a cluster of gold-outlined boxes): Food-Security Index (4 pillars) ·
   Demand (Ramadan/Hajj) · Procurement (buy/hold/defer) · Scenario Simulator · News signals ·
   Impact · Sustainability. A band beneath labelled **Anthropic Claude (AI)** feeding the AI-driven ones.

5. **SERVE** (two stacked boxes): **NestJS API `/v1`** → **Next.js UI (10+ modules)**.
   *Colour:* gold. Arrow out to a small device/browser frame.

**Scalability call-outs** — three gold "pill" badges along the bottom (this is the actual point of the slide):
- **"Add a source = 1 ingester → same tables"**
- **"Add a commodity = 1 config toggle → auto-propagates to Suppliers · Demand · Index"**
- **"KSA → GCC = area-code parameter"** (pair with the map zoom)
- (optional 4th) **"Weights & thresholds = config, not code"**

**ASCII mock (hand this to the design tool as the structure):**
```
 DATA SOURCES          INGEST + NORMALISE       STORE           INTELLIGENCE                SERVE
 ┌─────────────┐       ┌──────────────────┐   ┌─────────┐   ┌────────────────────────┐  ┌────────────┐
 │ UN Comtrade │──┐    │ Source ingesters │   │Postgres │   │ Food-Security Index    │  │ NestJS /v1 │
 │ FAO *       │  │    │ • fetch          │   │ (one    │   │ Demand · Procurement   │  │    ↓       │
 │ World Bank *│  ├──► │ • rate-limit/    │──►│ canon.  │──►│ Scenarios · News(AI)   │─►│ Next.js UI │
 │ USDA PSD    │  │    │   backoff+cache  │   │ schema) │   │ Impact · Sustainability│  │ 10+ modules│
 │ NASA POWER  │  │    │ • normalise      │   │ +Redis  │   │        ▲               │  └────────────┘
 │ EU RASFF    │  │    │ • @Cron          │   └─────────┘   │  Anthropic Claude (AI) │
 │ GDELT       │──┘    └──────────────────┘                └────────────────────────┘
 │┈＋ new src ┈│  ← dashed = extensible
 │┈ KSA feeds ┈│  ← upgrade the SAME columns (no rewrite)
 └─────────────┘
 [ Add a source = 1 ingester ]  [ Add a commodity = 1 toggle ]  [ KSA → GCC = area-code param ]
```
**Design notes:** keep it clean and horizontal; consistent arrow style; the two dashed source chips
and the three bottom pills are what communicate *scalability* — make them visually prominent (gold).
Animate (for the video): a `＋ new source` chip slides into the sources column, an arrow auto-draws
to the ingest box, and the pills highlight one by one.

### Slide 10 — Scorecard, Goal & Ask (3:55–4:20)
- **Objective:** land the "we hit every criterion" case + the ask.
- **Big idea:** six criteria, one system, one goal.
- **Headline:** *"See it coming. Act in time."*
- **Body:** the weighted scorecard fills in (≈89.5/100); restate the goal; the ask = authoritative data partnerships (SAGO, GASTAT, MEWA, SFDA) + a pilot mandate.
- **Featured data:** scorecard table (Impact 93 / AI 91 / Feasibility 90 / Novelty 84 / Sustainability 86 / Scalability 90 → **89.5**).
- **Visual:** the scorecard animates in; pull back to the calm green dashboard; the family meal; hexagon centers.
- **Layout:** scorecard left, goal + ask + close line right.
- **VO:** "Six criteria, one system, one goal — securing our food supply before the shock arrives. Give us the official data and a pilot, and Nexagon becomes the Kingdom's food-security nerve center. See it coming. Act in time."
- **Transition:** hold on the hexagon.

---

## 7. Provenance appendix (show if asked)
The app's **Live Data** page (`/live-data`) displays every feed's provider, status, and record count —
open it to prove provenance live. Full figure→source map is in `docs/pitch-deck-criteria.md` (appendix)
and the data catalog in `docs/data-sources-tracker.md`. Sources used: UN Comtrade, FAO FAOSTAT/FBS/
AQUASTAT/EMPRES-i, World Bank (Pink Sheet/WGI/health/macro), USDA PSD, NASA POWER, EU RASFF, GDELT,
Water Footprint Network, Anthropic Claude.

## 8. Deliverables the design AI should produce
1. A 10-slide deck (16:9), dark navy + gold, one hero idea per slide, sourced figures.
2. Matching **video storyboard** (the VO + visual directions above are the script).
3. A **30-second teaser** (port → red lanes → index dial → "What if the Red Sea closes?" → reroute +
   BUY → tracked action → secure meal → hexagon).
