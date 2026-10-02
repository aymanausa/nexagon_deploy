# Epic 15 — Reports

Generate shareable reports from the platform's state. Replicate from POC. POC ref:
`frontend/app/reports`; backend `reports` controller (`GET /v1/reports/templates`,
`POST /v1/reports/generate`).

### NEX-15-01 — View report templates
**As an** Analyst, **I want** to see the available report templates, **so that** I can pick the
right one.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `GET /v1/reports/templates` · **Layer:** both
- **Acceptance criteria:**
  - Given templates, when I open Reports, then each template renders with its name/description.

### NEX-15-02 — Generate a report
**As an** Analyst, **I want** to generate a report from a template, **so that** I can share the
current picture with stakeholders.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `POST /v1/reports/generate` · **Layer:** both
- **Acceptance criteria:**
  - Given a template, when I generate, then a report is produced from my org's live data (G1) and the action is audited (G5).
  - Given generation, when it runs, then the output reflects the current index, prices, procurement, and threats.

> **Roadmap v1.3:** PDF export builds on this epic — v1.0 delivers template selection +
> generation.
