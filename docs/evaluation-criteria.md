# Nexagon — Solution Evaluation

Weighted self-assessment of the Nexagon food-security intelligence platform against the
evaluation criteria. Scores are out of 100; the weighted total is the sum of (score × weight).

| Criterion | Weight | Score /100 | Weighted |
|---|---|---|---|
| Impact | 25% | 93 | 23.3 |
| AI & Emerging Tech | 20% | 91 | 18.2 |
| Feasibility | 15% | 90 | 13.5 |
| Novelty | 15% | 84 | 12.6 |
| Sustainability | 15% | 86 | 12.9 |
| Scalability | 10% | 90 | 9.0 |
| **Total** | **100%** | | **≈ 89.5 / 100** |

---

## 1. Impact — 25% · **93**

**Why it scores high.** Saudi Arabia imports ~80–85% of its food; food security is a national,
Vision 2030 priority. Nexagon turns fragmented, lagging data into a single decision system that
(a) **quantifies** national food security (a 4-pillar, 0–100 index), (b) **anticipates** demand
peaks (Ramadan/Hajj) and supply gaps, (c) **optimizes procurement spend** (buy/hold/defer with
timing and risk-adjusted origins), and (d) **pre-empts crises** (autonomous scenario stress-tests
that raise alerts and tracked actions).

**Evidence:** the full decision loop is live — Food-Security Index, Demand Forecast, Procurement
Optimizer, Supplier risk map, News signals, Scenario Simulator, Initiatives tracker. Real
verified output (e.g. procurement flags Wheat BUY ahead of a projected deficit; the simulator
showed an India rice-ban cutting the index and flipping Rice to BUY).

**Honest gap:** several strategic inputs (SAGO reserves, GASTAT consumption, SFDA inspections)
are currently authoritative-upgradeable proxies — impact grows further once those official feeds land.

## 2. AI & Emerging Tech — 20% · **91**

- **LLM throughout (Claude):** news classification into structured signals, daily AI briefs,
  per-page contextual insights, **natural-language → structured scenario shocks**, and crisis briefs.
- **Autonomous / agentic behaviour:** the platform reviews live signals daily, **self-generates and
  stress-tests scenarios**, and raises alerts + initiatives without a human prompt — proactive, not reactive.
- **Composite modelling:** a weighted 4-pillar index with re-normalisation, OLS price forecasting,
  Hijri-calendar seasonality, import-weighted risk rollups, Shannon dietary-diversity.
- **Emerging data sources:** UN Comtrade, FAO FAOSTAT/FBS, NASA POWER (satellite climate), FAO
  EMPRES-i, World Bank WGI, GDELT global news.

**Honest gap:** forecasting is classical (OLS) rather than ML; a learned demand/price model is a roadmap item.

## 3. Feasibility — 15% · **90**

**It already runs.** A working NestJS + Next.js + Postgres platform on Docker, ingesting **live**
data today, mostly from **free** public APIs (one paid key: UN Comtrade). Architecture is
`ingest → normalise → store → serve`, so it is operationally cheap and deployable now. Every proxy
is swappable to a Saudi-authoritative source **without frontend/read-path changes** (documented in
the data-sources tracker), so the path to production is low-risk and incremental.

## 4. Novelty — 15% · **84**

Individual dashboards and food indices exist elsewhere; Nexagon's novelty is the **integration into
one closed loop** — *detect (news) → measure (index) → anticipate (demand) → decide (procurement) →
stress-test (autonomous scenarios) → track (initiatives)* — plus two genuinely novel capabilities:
**natural-language what-if simulation** and an **autonomous scenario generator** that turns a live
headline (incl. Red Sea/Hormuz corridor threats) into a quantified impact + recommended action.

**Honest gap:** the analytical building blocks are established techniques; novelty is in composition and autonomy, not a new algorithm.

## 5. Sustainability — 15% · **86**

- **Economic:** right-timed procurement and reserve optimization reduce waste and cost; runs on
  low-cost free data.
- **Environmental / resource:** an explicit **Water** sub-indicator (KSA is water-scarce) steers
  toward water-appropriate local production and away from water-intensive crops; climate-stress
  overlays push resilient sourcing.
- **Institutional:** transparent, documented, config-driven assumptions reviewable by GASTAT/SAGO —
  built to be maintained and governed, not a throwaway prototype.

## 6. Scalability — 10% · **90**

**Source-agnostic, modular, config-driven.** Adding a commodity = one catalog toggle (auto-propagates
to suppliers/demand/index); adding a data source = one ingester upserting the same tables (proven
with 10+ sources). Weights/thresholds live in config, not code. The same design extends to the
**GCC** or more commodities with no architectural change.

**Honest gap:** GDELT/RASFF are rate-limited/unofficial endpoints — hardened with backoff + caching, but heavy multi-tenant scale would need managed data contracts.

---

## Summary

Nexagon scores **~89.5/100** weighted. Its strengths are **impact** (a live, end-to-end national
food-security decision system) and **AI/emerging tech** (LLM-driven, autonomous, multi-source). It
is **feasible today** and **scalable by design**. The honest opportunities — authoritative KSA data
feeds and ML forecasting — are already mapped in the data-sources tracker and roadmap.

**To raise the score toward the ceiling, see `improvement-roadmap.md`** — per-criterion headroom and
the prioritized, buildable moves (quantified impact panel, sustainability sourcing lens, AI copilot,
Arabic/cascade scenarios).
