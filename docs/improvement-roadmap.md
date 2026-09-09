# Nexagon — Evaluation Improvement Roadmap

How to raise the weighted evaluation (currently **≈ 89.5 / 100**) toward the ceiling. Headroom is
uneven — this is where each point is trapped and the concrete moves to unlock it, prioritized by
return-on-effort.

## Headroom per criterion

| Criterion | Now | Max | Headroom | What's capping it |
|---|---|---|---|---|
| Novelty | 12.6 | 15 | **2.4** | building blocks are established techniques |
| Sustainability | 12.9 | 15 | **2.1** | *durability* criterion — dev-mode deploy; some unofficial endpoints |
| AI & Emerging Tech | 18.2 | 20 | **1.8** | classical OLS forecasting; no conversational agent |
| Impact | 23.3 | 25 | **1.7** | impact is qualitative — no quantified value; proxy data |
| Feasibility | 13.5 | 15 | **1.5** | no hosted demo / pilot plan; proxy + unofficial endpoints |
| Scalability | 9.0 | 10 | 1.0 | rate-limited sources; single-tenant |

## Moves per criterion

**Impact (→ ~24.5).** Biggest lever: **quantify it** — an impact/savings model estimating spend
retained / SAR saved (procurement timing + reserve arbitrage + avoided disruption) with a stated
methodology, plus the real total import-value base and import-value-at-risk. Second: land ≥1
**authoritative feed** (SAGO/GASTAT) so headline numbers are official, not proxy.

**Novelty (→ ~14, biggest headroom).** Lean into what's rare: **Arabic natural-language what-if**;
**compound/cascade scenarios** (second-order effects); emphasize the live **satellite + news + trade
+ disease fusion** into one autonomous index.

**Sustainability (→ ~14).** *Criterion = durable, long-term value with minimal manual effort.* Nexagon
is already strong here (self-running `@Cron` pipelines, self-healing ingestion, config-not-code tuning,
free-data economics, the compounding loop). To lift the last points: ship a **production build**
(multi-stage `next build`/`nest build`, process manager) so "runs itself" holds under real traffic;
land ≥1 **authoritative feed** to retire unofficial endpoints; and surface the autonomy in-product (a
"last auto-updated" / scheduled-jobs status strip) so durability is *visible*, not just true.
*(The virtual-water/CO₂ lens is an ESG product feature + water-smart-localization support — it does not move this criterion.)*

**AI & Emerging Tech (→ ~19.5).** A real **AI copilot** — tool-using agent over the live modules
("why is wheat BUY?"). An **ML forecast** (trained seasonal model + confidence intervals) beyond OLS.

**Feasibility (→ ~14.5).** Cheapest credibility win: a **hosted live demo URL** + a one-page **pilot &
data-partnership plan** (the 27-dataset tracker scaffolds this).

**Scalability (→ ~9.5).** Least headroom; quick win is demonstrating **GCC generalization** (swap KSA
area codes — the architecture already supports it).

## Prioritized shortlist (buildable now, no new paid data)

1. **Quantified impact/savings KPI panel** — unlocks Impact and strengthens the whole pitch. *(highest ROI — building first)*
2. **Durability wins** (production build + a "last auto-updated / scheduled-jobs" status strip) — makes the self-running Sustainability story visible. *(The food-miles/CO₂ + water lens already shipped as an ESG feature.)*
3. **AI copilot** (tool-using agent over modules) — lifts AI *and* Novelty; strong demo.
4. **Arabic NL what-if + cascade scenarios** — lifts Novelty (biggest gap).
5. **Hosted demo + pilot/partnership one-pager** — cheap Feasibility win.

**Depends on the authorities team (not us):** authoritative feeds (SAGO/GASTAT/MEWA/SFDA) — in the
data-sources tracker; lift Impact + Feasibility when they land.

Estimated effect of building #1–#3: **≈ 89.5 → ~93–94**.
