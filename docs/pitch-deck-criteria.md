# Nexagon — Criteria Pitch Deck (3–5 min, video-paired)

A presentation built to **hit every evaluation criterion**. Creative device: each of the six
criteria is posed as **the question a judge is asking**, and answered with a concrete, live proof
from Nexagon. Designed to run **alongside a video** — each slide has an on-screen line, the proof,
a visual/motion direction (use *real captured UI*), and a timed voiceover (VO).

**The Goal (state it up front and echo at the close):**
> *Secure Saudi Arabia's food supply — turn an 80% import dependency into a proactively managed,
> optimized, and resilient national food-security system, in line with Vision 2030.*

**Creative spine:** the **Nexagon Loop** — *Detect → Measure → Anticipate → Decide → Stress-test →
Track*. The six criteria are mapped onto it, so the deck tells one story, not six.

**Palette / feel:** deep navy + gold (product colours), calm data-motion, one human anchor (a
decision-maker). Confident, national-scale, in control — not alarmist.

**Total runtime target ≈ 4:00** across 10 slides (timecodes below).

---

## Slide 1 — Title & Hook · (0:00–0:20)
**On screen:** the gold hexagon mark → **NEXAGON** → tagline *"National Food-Security Intelligence."*
Big line: **"80% of our food crosses an ocean to get here."**
**Visual/motion:** port at dawn, grain unloading, a family meal; the hexagon forms.
**Source:** KSA food import-dependence ~80–85% — FAO / GASTAT.
**VO:** "Saudi Arabia feeds itself from the whole world — a strength, and a dependency. Nexagon
turns that dependency into control."

## Slide 2 — The Goal & The Problem · (0:20–0:45)
**On screen:** **THE GOAL — Secure the Kingdom's food supply, proactively.**
Bullets: 80–85% imported · data is fragmented & lagging · decisions are reactive · shocks (export
bans, Red Sea/Hormuz, droughts) hit *before* the data moves.
**Visual/motion:** world map, shipping lanes pulsing red one by one; a news ticker flickers.
**VO:** "The goal is simple and national: secure our food supply. The obstacle — we find out about
threats too late, across disconnected systems. Nexagon closes that gap."

## Slide 3 — The Solution: One Loop · (0:45–1:10) — *creative centerpiece*
**On screen:** the **Loop** animates as a ring: **Detect → Measure → Anticipate → Decide →
Stress-test → Track → (back to Detect).** Center: the Food-Security Index dial settling on **71/100**.
**Visual/motion:** each node lights up in sequence; the ring closes; the dial ticks up as the loop completes.
**Source:** Food-Security Index (0–100) computed by the platform from live data (`/food-index`).
**VO:** "Nexagon isn't a dashboard — it's a closed decision loop. It detects a threat, measures our
security, anticipates demand, decides what to do, stress-tests the future, and tracks the action —
then the result feeds back and the score improves. Now — six ways it delivers."

---

## Slide 4 — IMPACT (25%) · "Will it matter?" · (1:10–1:40)
**Answer line:** **"It manages an $11.9B national food budget — live."**
**Proof:**
- Real, live from UN Comtrade: **$11.9B/yr** tracked food-import value.
- **$144M/yr** estimated optimization opportunity from better-timed procurement.
- **$765M (6.4%)** of imports exposed to high-risk origins — quantified, then reduced.
- National scale, Vision-2030 aligned; the whole loop serves one goal: food security.
**Visual/motion:** the dashboard **Economic Impact** panel counts up ($11.9B, $144M, $765M).
**Source:** import value = **UN Comtrade** (KSA food imports); timing opportunity = Comtrade value ×
**World Bank Pink Sheet** price volatility × capture rate; risk exposure = Comtrade value × **World
Bank WGI** governance risk. (Live at `/impact`.)
**VO:** "Impact? Nexagon puts a live number on national food security — an $11.9 billion import
base, $144 million a year in timing opportunity, and the risk exposure we can cut."

## Slide 5 — AI & EMERGING TECH (20%) · "Is it smart?" · (1:40–2:10)
**Answer line:** **"It reads the world — and stress-tests threats by itself."**
**Proof:**
- **Claude** classifies global news (GDELT) into structured signals + a daily brief.
- **Natural-language what-if:** type *"India bans rice exports"* → it simulates the impact.
- **Autonomous** daily scenario generation — the system pre-empts threats without a prompt.
- Multi-source AI fusion: **satellite (NASA), news (GDELT), trade (Comtrade), disease (EMPRES-i).**
**Visual/motion:** headlines stream in and self-tag; a typed sentence becomes a running simulation.
**Source:** news = **GDELT** Global Database of Events; classification/briefs/NL = **Anthropic Claude**;
fusion adds **NASA POWER** (satellite climate), **UN Comtrade** (trade), **FAO EMPRES-i** (animal disease).
**VO:** "Smart? Its AI reads the world's news as it breaks, understands what each event means for
Saudi supply, and — on its own — stress-tests emerging threats before they land."

## Slide 6 — FEASIBILITY (15%) · "Can it be done?" · (2:10–2:35)
**Answer line:** **"It's already running — on live data, today."**
**Proof:**
- A working platform (NestJS + Next.js + Postgres, Dockerized), ingesting **live** data now.
- Mostly **free** public sources (one paid key) — cheap to operate.
- Every proxy upgrades to an **authoritative KSA feed** (SAGO, GASTAT, MEWA, SFDA) **with no rework** —
  path to production is mapped in a 27-dataset tracker.
**Visual/motion:** the live app clicking through real modules; the data-lineage view.
**Source:** the running platform + the in-app **Live Data lineage** (`/live-data`) showing every feed;
upgrade path in **`docs/data-sources-tracker.md`** (27 datasets). Free public APIs + one paid key (UN Comtrade).
**VO:** "Feasible? This isn't a concept deck — it's a working system on real data, built to plug
straight into official Saudi feeds."

## Slide 7 — NOVELTY (15%) · "Is it new?" · (2:35–3:05)
**Answer line:** **"Ask it a crisis in plain English — or let it ask itself."**
**Proof:**
- **Natural-language crisis simulation** — a genuinely new interaction for food security.
- **Autonomous corridor detection:** from *live* news it generated **Red Sea** & **Hormuz** disruption
  scenarios — no injected data.
- The **closed, self-improving loop** + live fusion of satellite + news + trade + disease is uncommon.
**Visual/motion:** the auto-detected scenario cards appear ("Red Sea corridor disruption · index 71→70"),
then a natural-language box: *"What if the Red Sea closes?"* → map reroutes.
**Source:** NL + autonomous simulation = **Anthropic Claude** + the platform's scenario engine, driven
by live **GDELT** signals (the Red Sea/Hormuz scenarios were auto-generated from real news, not seeded).
**VO:** "New? Nexagon lets a decision-maker run a national crisis simulation in a sentence — and it
already caught real Red Sea and Hormuz threats on its own."

## Slide 8 — SUSTAINABILITY (15%) · "Will it last, without babysitting?" · (3:05–3:35)
*(Criterion definition: durable, long-term value with minimal manual effort.)*
**Answer line:** **"It runs, heals, and improves itself."**
**Proof:**
- **Runs itself:** scheduled pipelines refresh signals, recompute procurement, and **auto-generate +
  stress-test scenarios daily** — raising alerts and tracked actions with no human prompt.
- **Self-healing & low-cost:** rate-limit backoff, staleness guards and retries keep it live on flaky
  APIs; it runs on **mostly free public data** — cheap to run for years, no per-seat licences.
- **Adapts without a rewrite:** weights, thresholds and assumptions are **config, not code**; new
  sources/commodities/countries plug in; proxies upgrade to authoritative KSA feeds — and the closed
  loop feeds outcomes back, so **value compounds over time**.
**Visual/motion:** the **loop ring turning on its own** with an "auto-updated" timestamp ticking;
cut to the Settings config panel (weights/thresholds) and an "auto-detected" scenario appearing.
**Source:** platform capability — `@Cron` schedulers (news / procurement / auto-scenarios), `AppConfig`
tunables in Settings, and governed methodology docs + the 27-dataset tracker. *(An ESG virtual-water/CO₂
lens also ships at `/sustainability`, supporting water-smart localization.)*
**VO:** "Will it last? It runs, heals and updates itself on a schedule — no team babysitting it — and
because the loop feeds results back in, it gets more valuable the longer it runs."

## Slide 9 — SCALABILITY (10%) · "Will it grow?" · (3:35–3:55)
**Answer line:** **"From one commodity to the whole GCC — no rewrite."**
**Proof:**
- **Source-agnostic, config-driven, modular:** add a commodity = one toggle (auto-propagates); add a
  data source = one ingester upserting the same tables (proven with 10+ sources).
- Extends to the **GCC** and more commodities with no architectural change.
**Visual/motion:** toggling a commodity ripples across suppliers/demand/index; map zooms KSA → GCC.
**Source:** platform architecture (proven by 10+ integrated sources on the **Live Data lineage** page);
FAO/Comtrade already cover the full GCC by area code.
**VO:** "Scalable? Its architecture grows by configuration, not rewrites — from one commodity to the
entire Gulf."

## Slide 10 — Scorecard, Goal & Ask · (3:55–4:20)
**On screen — the weighted scorecard:**
| Criterion | Weight | Score |
|---|---|---|
| Impact | 25% | 93 |
| AI & Emerging Tech | 20% | 91 |
| Feasibility | 15% | 90 |
| Novelty | 15% | 84 |
| Sustainability | 15% | 86 |
| Scalability | 10% | 90 |
| **Total** | | **≈ 89.5 / 100** |

**Restate the goal:** *"Secure the Kingdom's food supply — proactively."*
**The ask:** authoritative data partnerships (SAGO, GASTAT, MEWA, SFDA) + a pilot mandate.
Close line: **"See it coming. Act in time. Nexagon."**
**Visual/motion:** scorecard fills in; pull back to the calm green dashboard; the family meal; hexagon centers.
**VO:** "Six criteria, one system, one goal — securing our food supply before the shock arrives. Give
us the official data and a pilot, and Nexagon becomes the Kingdom's food-security nerve center. See
it coming. Act in time."

---

## The video (how the deck and film work together)
- **Format:** a ~4-minute screen-capture film using **real Nexagon UI** (the loop ring, the index dial,
  the news signals, a natural-language what-if, the auto-detected corridor scenarios, the Economic
  Impact + Sustainability panels). Each slide = one beat of the film.
- **Continuity number:** keep the index at **71** everywhere; Red Sea scenario **71→70**.
- **Music:** restrained, building through Detect→Decide, resolving to calm at Track/close — mirror the loop.
- **Two cuts:** the full 4-min presentation film, and a **30-sec teaser** (port → red lanes → index dial →
  "What if the Red Sea closes?" → reroute + BUY → tracked action → secure meal → hexagon).

## Timing cheat-sheet (present in ~4:00)
| # | Slide | In | ~Sec |
|---|---|---|---|
| 1 | Title & Hook | 0:00 | 20 |
| 2 | Goal & Problem | 0:20 | 25 |
| 3 | The Loop (centerpiece) | 0:45 | 25 |
| 4 | Impact (25%) | 1:10 | 30 |
| 5 | AI & Emerging Tech (20%) | 1:40 | 30 |
| 6 | Feasibility (15%) | 2:10 | 25 |
| 7 | Novelty (15%) | 2:35 | 30 |
| 8 | Sustainability (15%) | 3:05 | 30 |
| 9 | Scalability (10%) | 3:35 | 20 |
| 10 | Scorecard & Ask | 3:55 | 25 |

*Tighten to 3:00 by trimming slides 6 & 9 to 15s and shortening VO; stretch to 5:00 by adding a live
demo moment after slide 5 (run a scenario on screen).*

---

## Appendix — Data provenance (show this if asked)

Every figure in the deck traces to a live source. **Tip:** the app's own **Live Data** page
(`/live-data`) displays each feed's provider, status, and record count — open it on screen to *prove*
provenance in real time.

| Proof point | Value | Source | Where in app |
|---|---|---|---|
| Import-dependence | ~80–85% | FAO / GASTAT (national statistics) | context |
| Food-import value | $11.9B/yr | **UN Comtrade** (KSA imports, tracked HS food codes) | `/impact`, `/suppliers` |
| Timing opportunity | $144M/yr | Comtrade value × **World Bank Pink Sheet** price volatility × 25% capture (stated method) | `/impact` |
| Import value at risk | $765M (6.4%) | Comtrade value × **World Bank WGI** governance risk | `/impact`, `/suppliers` |
| Food-Security Index | 71/100 | Computed 4-pillar composite from live data | `/risk-heatmap` |
| Virtual water | 39.2B m³ = 16.3× | **UN Comtrade** volumes × **Water Footprint Network** averages; ÷ **FAO AQUASTAT** renewable water (~2.4B m³) | `/sustainability` |
| Shipping CO₂ | 1.2M t/yr | Comtrade volumes × great-circle distance to Jeddah × freight factor | `/sustainability` |
| Autonomous scenarios | Red Sea, Hormuz (71→70) | **GDELT** live news → **Claude** classification → platform scenario engine | `/scenarios` |
| Governance/political risk | per supplier | **World Bank WGI** | `/suppliers` |
| Climate stress | per supplier | **NASA POWER** (satellite) | `/suppliers` |
| Animal disease | 90-day events | **FAO EMPRES-i** | `/suppliers` |
| Food safety | recent alerts | **EU RASFF** | `/suppliers` |
| Reserves / days of supply | per commodity | **USDA PSD** | `/stock-levels` |
| Prices | monthly/annual | **World Bank Pink Sheet** + **FAO FAOSTAT** | `/commodities` |
| Demand baseline | consumption/production | **FAO FBS** (Food Balance Sheets) | `/demand` |
| AI (all) | classification, briefs, NL | **Anthropic Claude** (claude-opus-4-8) | `/news`, `/scenarios`, insights |

*Self-assessed scores are documented with justification in `docs/evaluation-criteria.md`; the full
data catalog and upgrade path (proxy → authoritative KSA feed) is in `docs/data-sources-tracker.md`.*
