# The Nexagon Loop — How the Platform Thinks

## The one-liner
Nexagon runs a continuous decision loop for national food security:
**Detect → Measure → Anticipate → Decide → Stress-test → Track** — and then back to Measure.
A world event becomes a quantified impact, a recommended action, and a tracked outcome — and the
result feeds back to raise the score. It's not a dashboard; it's a closed control loop.

## Why a loop (and not a dashboard)
A dashboard *shows* you the past. A loop *drives* a decision and *learns* from the outcome.
Traditional food-security tooling is fragmented and lagging — prices here, trade there, weather
somewhere else, all after the fact. Nexagon connects those into one cycle so the Kingdom can act
**before** a shock lands and **see** each action improve the national picture. Every stage hands a
concrete output to the next; the last stage feeds back into the first.

---

## The six stages

### 1. DETECT — see it coming
**What:** watch the world for emerging threats before they show up in prices or trade data.
**Modules:** World-News AI Signals (GDELT → Claude classification into `{commodity, country, event
type, severity, KSA relevance}` + a daily brief); the live risk overlays — animal disease (FAO
EMPRES-i), political risk (World Bank WGI), climate stress (NASA POWER), food-safety (EU RASFF).
**Output:** structured, ranked signals — the *leading indicators*.
**Hands to →** Measure & Anticipate (which commodities/origins are now under threat).

### 2. MEASURE — know where we stand
**What:** quantify the current state of national food security in one number, with full drill-down.
**Modules:** the 4-pillar **Food-Security Index** (Availability, Access, Utilization, Stability;
16 sub-indicators; 0–100); the **Supplier Map** (who supplies what, with risk overlays); **Stock
Levels** (days of supply); **Self-Sufficiency** (production ÷ domestic supply).
**Output:** the index, pillar scores, and per-commodity/per-supplier state.
**Hands to →** Anticipate & Decide (the baseline everything is compared against).

### 3. ANTICIPATE — know what's coming
**What:** project forward — demand peaks, supply gaps, price direction.
**Modules:** the **Demand Forecast** (FAO consumption baseline shaped by Ramadan & Hajj via the
Islamic calendar + population growth → month-by-month demand with deficit months flagged); the
**price forecast** (OLS trend + confidence); **reserve days-of-supply**.
**Output:** *when* we'll need more, *how much*, and whether prices are rising or falling.
**Hands to →** Decide (the timing + quantity signal).

### 4. DECIDE — turn insight into a call
**What:** a transparent, auditable recommendation per commodity.
**Module:** the **Procurement Optimizer** — synthesizes demand + price forecast + reserves +
supplier cost/risk + news into **BUY / HOLD / DEFER**, with urgency, quantity, timing window,
risk-adjusted origins, and shown reasoning (plus a Claude portfolio brief).
**Output:** the action — what to do, how much, when, from where, and why.
**Hands to →** Stress-test (pressure-test the plan) and Track (turn it into an owned action).

### 5. STRESS-TEST — pressure-test the future
**What:** ask "what if?" and see the impact before it happens.
**Module:** the **Scenario Simulator** — run curated templates (Red Sea closure, India rice ban,
Brazil drought, Hajj surge), a **custom builder**, **natural-language** what-ifs (Claude translates
plain English into shocks), or the **autonomous daily generator** that stress-tests emerging signals
on its own — including corridor/chokepoint threats (Red Sea, Hormuz). Each run recomputes the index,
demand deficits, and procurement actions and returns before→after impact + mitigations.
**Output:** quantified impact of a shock + recommended mitigation.
**Hands to →** Decide (revise the plan) and Track (contingency actions).

### 6. TRACK — follow through to done
**What:** make sure recommendations become owned, monitored actions — not lost insight.
**Module:** **Initiatives** — auto-suggested from findings (procurement BUYs, supplier
concentration, low reserves, data gaps) + manual; each with an owning authority (SAGO / SALIC /
MEWA / SFDA), a priority, and a status lifecycle (suggested → approved → in progress → completed).
**Output:** a tracked action linked to the pillar/commodity it improves.
**Hands to →** back to **Measure** — completing it lifts the index. The loop closes.

---

## What makes it *closed* (the feedback)
The last stage feeds the first two:
- A completed initiative (e.g. "Replenish Corn reserve", "Diversify Rice sourcing") **changes the
  underlying data** — reserves rise, concentration falls.
- On the next cycle, **Measure** picks that up and the **Food-Security Index improves**.
- So action is not fire-and-forget; its effect is visible in the score. That feedback is what turns
  a set of modules into a *control loop*.

## On-demand *and* autonomous
The loop runs two ways:
- **Human-driven:** an analyst reviews the index, runs a scenario, acts on a procurement call.
- **Autonomous:** every day the platform scans signals, self-generates and stress-tests material
  threats, raises alerts, and creates tracked initiatives — with a human confirming. So the loop
  keeps turning even when no one is looking. That's the "early warning" in action.

---

## Worked example — "India extends its rice export ban"

1. **Detect:** GDELT surfaces the headline; Claude tags it `{Rice, India, export-ban, high}`.
2. **Measure:** India supplies a large share of KSA rice; the Supplier Map shows the concentration,
   Stock Levels show rice days-of-supply, the index registers the exposure.
3. **Anticipate:** the Demand Forecast shows a rice peak approaching (Ramadan); reserves won't cover
   the gap if imports drop.
4. **Stress-test:** the autonomous generator simulates the ban → the index dips, rice flips into a
   projected deficit, procurement flips to BUY. (No one had to click "run".)
5. **Decide:** the Procurement Optimizer says **BUY rice now**, in the near window, from diversified
   low-risk origins (not India) — with the reasoning shown.
6. **Track:** initiatives "Secure rice supply" and "Diversify rice sourcing" are created, owned by
   SAGO/SALIC, and moved through to completion.
7. **→ Measure again:** once secured, reserves rise and concentration falls — and the index recovers.

From a headline half a world away to a tracked decision that visibly restores national food
security — in one continuous, mostly-autonomous loop.

## Why it matters
- **Proactive, not reactive:** the loop acts on leading indicators, before the shock lands.
- **Auditable, not a black box:** every stage shows its reasoning and its data source.
- **Whole-of-government:** each action carries an owner, so the loop coordinates institutions.
- **Self-improving:** outcomes feed back into the score, so the system — and the Kingdom's food
  security — gets measurably stronger over time.
