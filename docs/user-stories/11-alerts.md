# Epic 11 — Alerts

Threat alerts across the loop. **Finish-work:** the POC's Alerts page renders a hardcoded
`mockAlerts` array (`frontend/app/alerts/page.tsx`) even though `alertsApi` already exists and
the backend `alerts` module is real — just wire it. POC ref: `alertsApi`, backend `alerts`
controller (`GET /v1/alerts`, `/count`, `POST /:id/acknowledge`, `/:id/read`).

### NEX-11-01 — View alerts
**As an** Analyst, **I want** to see current alerts, **so that** I know what needs attention.
- **Type:** Finish-work · **Priority:** P0 · **POC ref:** `alertsApi.list` → `GET /v1/alerts` (replace `mockAlerts`) · **Layer:** both
- **Acceptance criteria:**
  - Given the Alerts page, when it loads, then alerts render from `GET /v1/alerts` scoped to my org (G1) — no mock array.
  - Given filter params, when applied, then the list narrows (severity/type/read state).

### NEX-11-02 — Unread alert count badge
**As an** Analyst, **I want** an unread count, **so that** I notice new alerts from anywhere in
the app.
- **Type:** Finish-work · **Priority:** P1 · **POC ref:** `alertsApi.count` → `GET /v1/alerts/count` · **Layer:** both
- **Acceptance criteria:**
  - Given unread alerts, when any page is open, then the nav badge shows the count and updates as alerts are read.

### NEX-11-03 — Acknowledge an alert
**As an** Analyst, **I want** to acknowledge an alert, **so that** the team knows it's owned.
- **Type:** Finish-work · **Priority:** P1 · **POC ref:** `alertsApi.acknowledge` → `POST /v1/alerts/:id/acknowledge` · **Layer:** both
- **Acceptance criteria:**
  - Given an alert, when I acknowledge it, then it records who acknowledged and when, is audited (G5), and reflects the acknowledged state.

### NEX-11-04 — Mark an alert read
**As an** Analyst, **I want** to mark alerts read, **so that** my unread count reflects reality.
- **Type:** Finish-work · **Priority:** P2 · **POC ref:** `alertsApi.markRead` → `POST /v1/alerts/:id/read` · **Layer:** both
- **Acceptance criteria:**
  - Given an unread alert, when I mark it read, then it persists and the count (NEX-11-02) decrements.

> **Roadmap v1.3:** full alert workflows (assign/track-to-resolution) build on this.
