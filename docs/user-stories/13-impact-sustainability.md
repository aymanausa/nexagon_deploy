# Epic 13 — Impact & Sustainability

Quantified economic impact and the ESG (virtual-water/CO₂) lens. Replicate from POC (both
shipped as panels/sections consuming their endpoints). POC ref: `impactApi`, `sustainabilityApi`;
backend `impact` controller (`GET /v1/impact`, `PUT /config`), `sustainability` controller
(`GET /v1/sustainability`).

### NEX-13-01 — View quantified economic impact
**As an** Analyst / decision-maker, **I want** the estimated SAR/spend retained and import
value at risk, **so that** I can express the platform's value in money, not adjectives.
- **Type:** Replicate · **Priority:** P0 · **POC ref:** `impactApi.get` → `GET /v1/impact` · **Layer:** both
- **Acceptance criteria:**
  - Given the impact endpoint, when I view it, then it shows estimated spend retained (procurement timing + reserve arbitrage + avoided disruption), the import-value base, and import-value-at-risk, with a stated methodology.
  - Given proxy vs authoritative data, when displayed, then proxy figures are labelled approximate (never presented as official).

### NEX-13-02 — Configure the impact model
**As an** Org Admin, **I want** to adjust the impact model's config, **so that** the estimate
reflects our assumptions.
- **Type:** Replicate · **Priority:** P2 · **POC ref:** `PUT /v1/impact/config` · **Layer:** both
- **Acceptance criteria:**
  - Given config, when I change it, then impact figures recompute, persist, and are audited (G5); Analysts cannot change it (G6).

### NEX-13-03 — View the sustainability (virtual-water / CO₂) lens
**As an** Analyst, **I want** the virtual-water and CO₂ view of sourcing, **so that** I can
factor ESG and water-smart localization into decisions.
- **Type:** Replicate · **Priority:** P1 · **POC ref:** `sustainabilityApi.get` → `GET /v1/sustainability` · **Layer:** both
- **Acceptance criteria:**
  - Given the endpoint, when I view it, then virtual-water and CO₂ metrics render per commodity/origin, supporting a water-smart-localization narrative.
