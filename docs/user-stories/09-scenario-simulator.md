# Epic 09 — Scenario Simulator

The "Stress-test" stage: templates, custom builder, natural-language what-ifs, and an
autonomous generator. Replicate from POC. POC ref: `frontend/app/scenarios`, `simulationApi`;
backend `simulation` + `scenarios` controllers.

### NEX-09-01 — Run a curated scenario template
**As an** Analyst, **I want** to run a pre-built scenario (Red Sea closure, India rice ban,
Brazil drought, Hajj surge), **so that** I can stress-test a known threat instantly.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `simulationApi.templates/run` → `GET /v1/simulation/templates`, `POST /v1/simulation/run` `{key}` · **Layer:** both
- **Acceptance criteria:**
  - Given the template list, when I run one, then the index, demand deficits, and procurement actions are recomputed and a before→after impact is returned.

### NEX-09-02 — Build a custom scenario
**As an** Analyst, **I want** to define my own shocks (production and price), **so that** I can
test situations not covered by templates.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `simulationApi.runCustom` → `POST /v1/simulation/run` `{shocks, name}` · **Layer:** both
- **Acceptance criteria:**
  - Given the custom builder, when I set production/price shocks and run, then the impact is computed the same way as a template and can be named.

### NEX-09-03 — Natural-language what-if
**As an** Analyst, **I want** to type a plain-English (or Arabic) what-if, **so that** I can
stress-test without learning the shock model.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `simulationApi.runNl` → `POST /v1/simulation/run-nl` `{prompt}`; `simulation.service.ts` `interpret()` · **Layer:** both
- **Acceptance criteria:**
  - Given a prompt naming an event, when I run it, then Claude infers the shock object and the simulation runs on it.
  - Given the AI is unavailable, when I submit, then I get a clear message and can fall back to the custom builder.
  - **Note (roadmap v1.4):** compound/cascade (second-order) scenarios are not in v1.0.

### NEX-09-04 — View before→after impact and mitigations
**As an** Analyst, **I want** each run to show quantified impact and recommended mitigations,
**so that** I know how bad it is and what to do.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** simulation run response · **Layer:** both
- **Acceptance criteria:**
  - Given a completed run, when I view results, then the index dip, flipped deficits, changed procurement calls, and mitigations render as before→after.

### NEX-09-05 — Autonomous daily generator
**As a** System, **I want** to auto-generate and stress-test emerging threats daily
(including corridor/chokepoint threats), **so that** the loop runs without a human.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `simulationApi.listAuto/autoGenerate` → `GET /v1/simulation/auto`, `POST /v1/simulation/auto-generate` · **Layer:** both
- **Acceptance criteria:**
  - Given the scheduled job, when it runs, then it generates scenarios from active signals, stress-tests them, and surfaces material ones (with alerts/initiatives as warranted).
  - Given the auto list, when an Analyst views it, then generated scenarios render with their impact.

### NEX-09-06 — Scenario history
**As an** Analyst, **I want** past scenarios saved, **so that** I can revisit and compare runs.
- **Type:** Replicate · **Priority:** P2 · **POC ref:** `scenarios` controller (`GET /v1/scenarios`, `GET /v1/scenarios/:id`) · **Layer:** both
- **Acceptance criteria:**
  - Given saved scenarios, when I open the list, then I see them scoped to my org (G1) and can open any by id.
