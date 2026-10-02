# Epic 10 — AI Copilot

A tool-using Claude copilot over the live modules ("why is wheat BUY?"). **Finish-work:** the
POC's `aichat` was canned keyword strings; it has been rewritten into a real tool-use loop but
that change is **uncommitted** — commit + verify as part of v1.0. POC ref:
`frontend/app/ai-assistant`, `chatApi`; backend `aichat` module (`POST /v1/ai-chat/ask`,
`GET /v1/ai-chat/suggested-questions`).

### NEX-10-01 — Ask an operational question answered from live data
**As an** Analyst, **I want** to ask questions in natural language and get answers grounded in
the live modules, **so that** I get decision support without digging through pages.
- **Type:** Finish-work · **Priority:** P0 · **POC ref:** `chatApi.ask` → `POST /v1/ai-chat/ask` · **Layer:** both
- **Acceptance criteria:**
  - Given a question (e.g. "why is wheat BUY?"), when I ask, then the copilot uses tools to read live data (prices, procurement rationale, food index, impact, news) and answers with the concrete figures it retrieved — never invented numbers.
  - Given the tool loop, when it runs, then it is bounded (no infinite loop) and a per-tool failure degrades gracefully rather than failing the whole answer.
  - Given tenancy (G1), when tools read data, then they read only the caller's org data.

### NEX-10-02 — Suggested questions
**As an** Analyst, **I want** starter questions, **so that** I know what the copilot can do.
- **Type:** Finish-work · **Priority:** P2 · **POC ref:** `chatApi.suggestions` → `GET /v1/ai-chat/suggested-questions` · **Layer:** both
- **Acceptance criteria:**
  - Given the assistant page, when it loads, then relevant suggested questions render and are clickable.

### NEX-10-03 — Bilingual (Arabic) answers
**As an** Arabic-speaking Analyst, **I want** answers in Arabic when I ask in Arabic, **so that**
the tool fits ministry users.
- **Type:** Finish-work · **Priority:** P1 · **POC ref:** `aichat.service.ts` language handling · **Layer:** both
- **Acceptance criteria:**
  - Given an Arabic prompt (or an Arabic language flag), when answered, then the reply is in Arabic.

### NEX-10-04 — Graceful when AI is not configured
**As an** operator, **I want** the copilot to degrade cleanly without an API key, **so that**
the app never crashes in an environment where AI is disabled.
- **Type:** Finish-work · **Priority:** P1 · **POC ref:** `aichat.service.ts` (`ANTHROPIC_API_KEY` guard) · **Layer:** backend
- **Acceptance criteria:**
  - Given no `ANTHROPIC_API_KEY`, when a question is asked, then a clear "AI not configured" message is returned, not an error.

> **v1.0 task:** commit the rewritten `aichat` service + the 5 module `exports` wiring, then
> smoke-test (`docker compose restart backend`, ask "Why is wheat BUY?"). Depth (multi-turn,
> "run this what-if" tool, proactive push) is roadmap v1.5.
