# Epic 12 — Initiatives

The "Track" stage: turning findings into owned, monitored actions that close the loop.
Replicate from POC. POC ref: `frontend/app/initiatives`, `initiativesApi`; backend
`initiatives` controller (`GET`, `POST`, `PATCH /:id`, `POST /generate`).

### NEX-12-01 — View initiatives
**As an** Analyst, **I want** to see initiatives with owner, priority, and status, **so that**
I can track what's being done.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `initiativesApi.list` → `GET /v1/initiatives` · **Layer:** both
- **Acceptance criteria:**
  - Given initiatives, when I view them, then each shows title, owning authority (SAGO/SALIC/MEWA/SFDA), priority, and status, scoped to my org (G1).

### NEX-12-02 — Auto-suggest initiatives from findings
**As an** Analyst, **I want** the platform to propose initiatives from findings (procurement
BUYs, supplier concentration, low reserves, data gaps), **so that** insight becomes action.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `initiativesApi.generate` → `POST /v1/initiatives/generate` · **Layer:** both
- **Acceptance criteria:**
  - Given current findings, when I generate, then suggested initiatives are created (status "suggested") linked to the pillar/commodity they improve, and the action is audited (G5).

### NEX-12-03 — Create a manual initiative
**As an** Analyst, **I want** to add my own initiative, **so that** actions outside the
auto-suggestions are tracked too.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `initiativesApi.create` → `POST /v1/initiatives` · **Layer:** both
- **Acceptance criteria:**
  - Given valid details, when I create an initiative, then it is saved in my org with an owner and priority, and audited (G5).

### NEX-12-04 — Progress an initiative through its lifecycle
**As an** Analyst / Org Admin, **I want** to move an initiative through its status (suggested →
approved → in progress → completed) and set priority/owner, **so that** it reflects reality.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `initiativesApi.update` → `PATCH /v1/initiatives/:id` · **Layer:** both
- **Acceptance criteria:**
  - Given an initiative, when I change status/priority/responsibleEntity, then it persists and is audited (G5).

### NEX-12-05 — Completing an initiative feeds back to the index
**As an** Analyst, **I want** a completed initiative to change the underlying data, **so that**
the Food-Security Index reflects the improvement (the loop closes).
- **Type:** Replicate · **Priority:** P1 · **POC ref:** feedback into `food-index` (Epic 03) · **Layer:** backend
- **Acceptance criteria:**
  - Given an initiative marked completed, when the index next recomputes, then its effect (e.g. reserves up, concentration down) is reflected in the score.
