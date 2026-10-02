# Epic 08 — News, Signals & Insights

The "Detect" stage: AI-classified world-news signals + contextual insights. Replicate from
POC. POC ref: `frontend/app/news`, `newsApi`, `insightsApi`; backend `news`, `insights`
controllers.

### NEX-08-01 — View classified news signals
**As an** Analyst, **I want** world-news signals classified and ranked, **so that** I see
emerging threats before they hit prices or trade.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `newsApi.get` → `GET /v1/news` · **Layer:** both
- **Acceptance criteria:**
  - Given ingested news (GDELT → Claude classification), when I view News, then each signal shows commodity, country, event type, severity, and KSA relevance.
  - Given the signals, when listed, then they are ranked/sorted by relevance+severity, newest first.

### NEX-08-02 — Daily brief
**As an** Analyst, **I want** a daily brief of the top signals, **so that** I get the picture
without reading every item.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `GET /v1/news` (brief payload) · **Layer:** both
- **Acceptance criteria:**
  - Given the day's signals, when I open the brief, then a concise summary of the most material items renders; when the AI is unavailable, then the raw ranked list still renders.

### NEX-08-03 — Refresh news
**As an** Org Admin / System, **I want** news ingestion to run on schedule and on demand, **so that**
signals stay current.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `POST /v1/news/refresh` · **Layer:** both
- **Acceptance criteria:**
  - Given a refresh, when run (scheduled as System or manual as Admin), then new signals are ingested+classified and the action is audited (G5).

### NEX-08-04 — Contextual AI insights
**As an** Analyst, **I want** short AI insights in the context of what I'm viewing, **so that**
I get interpretation without leaving the page.
- **Type:** Replicate · **Priority:** P2 · **POC ref:** `insightsApi.get` → `GET /v1/insights?context=&focus=` · **Layer:** both
- **Acceptance criteria:**
  - Given a page context (and optional focus), when I request insights, then a relevant short analysis renders; when the AI is unavailable, then the panel shows a graceful "unavailable" state, never a crash.
