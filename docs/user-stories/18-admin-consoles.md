# Epic 18 — Admin Consoles (Platform Super-Admin & Org/Tenant Admin)

Two management surfaces that don't exist in the POC. **New**, built on the tenancy foundation
(Epic 01) and RBAC (Epic 02). The Platform Super-Admin core (NEX-18-01→04) is **pulled into
v1.0** to pair with the tenancy work; the org-admin dashboard and usage/BYO-data pieces stay
v1.1–v1.2. Each story carries its **Version:** tag. POC ref: none — greenfield.

## A. Platform Super-Admin console (operator, cross-tenant)

### NEX-18-01 — Platform admin dashboard
**As a** Platform Admin, **I want** a cross-tenant overview, **so that** I can see the health of
the whole system at a glance.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** none · **Layer:** both
- **Acceptance criteria:**
  - Given I am a Platform Admin, when I open the console, then I see all orgs with key status (active/suspended, plan, last activity, health) — the only role permitted to cross tenants (G1).
  - Given a non-platform-admin, when they attempt to reach it, then access is forbidden (G6).

### NEX-18-02 — Manage tenants
**As a** Platform Admin, **I want** to create, suspend, and assign a plan to an org, **so that**
I can onboard and control tenants.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** implements NEX-01-03 · **Layer:** both
- **Acceptance criteria:**
  - Given the console, when I create an org, then it is provisioned with system defaults (NEX-18-04) and an initial Org Admin; the action is audited (G5).
  - Given an org, when I suspend it, then its users lose access immediately (NEX-01-03).

### NEX-18-03 — Global data-source management
**As a** Platform Admin, **I want** to manage the global catalog of data sources (enable/disable,
credentials, health), **so that** I control what feeds the platform.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** extends Epic 14 (`data-sources`, `integration`) · **Layer:** both
- **Acceptance criteria:**
  - Given the global catalog, when I enable/disable or update a source's credentials, then it applies platform-wide and is audited (G5); secrets are stored securely (never in plain config).

### NEX-18-04 — System-wide defaults & tenant override
**As a** Platform Admin, **I want** to set system-wide default configuration that tenants inherit
and can override, **so that** new orgs start sane and can still customize.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** none · **Layer:** both
- **Acceptance criteria:**
  - Given a system default, when a tenant has no override, then the effective value = system default; when a tenant sets an override, then `effective = tenantOverride ?? systemDefault`.
  - Given a default change, when applied, then tenants without an override pick it up; tenants with an override keep theirs.

### NEX-18-05 — Cross-tenant usage view
**As a** Platform Admin, **I want** to see usage/cost per org, **so that** I understand
consumption before pricing.
- **Type:** New · **Priority:** P2 · **Version:** v1.1 · **POC ref:** depends on metering (roadmap v1.1) · **Layer:** both
- **Acceptance criteria:**
  - Given metering data, when I open the usage view, then per-org consumption (copilot calls, ingestion runs, seats) renders across all tenants.

## B. Org (Tenant) Admin dashboard

### NEX-18-06 — Org admin dashboard
**As an** Org Admin, **I want** a management home for my org, **so that** I can run my tenant
without touching platform-level controls.
- **Type:** New · **Priority:** P1 · **Version:** v1.1 (basics could ship v1.0) · **POC ref:** partial (Users Epic 02 + Settings) · **Layer:** both
- **Acceptance criteria:**
  - Given I am an Org Admin, when I open the org console, then I see my org's users, roles, configuration, audit log, and (when available) usage — scoped to my org only (G1).

### NEX-18-07 — Manage org configuration in one place
**As an** Org Admin, **I want** my org's config (thresholds, demand assumptions, catalog,
optimizer/impact config) reachable from one console, **so that** tuning is coherent.
- **Type:** New · **Priority:** P2 · **Version:** v1.1 · **POC ref:** consolidates NEX-05-02, NEX-05-04, NEX-04-03, NEX-07-04, NEX-13-02 · **Layer:** both
- **Acceptance criteria:**
  - Given the org console, when I change any org config, then it persists as a tenant override (NEX-18-04) and is audited (G5).

### NEX-18-08 — Per-org usage & credits
**As an** Org Admin, **I want** to see my org's usage and remaining credits, **so that** I can
manage consumption against our plan.
- **Type:** New · **Priority:** P2 · **Version:** v1.1–v1.2 (metering v1.1, credits v1.2) · **POC ref:** none · **Layer:** both
- **Acceptance criteria:**
  - Given metering, when I open usage, then my org's consumption and (when credits exist) balance/limits render, with a warning as limits approach.

### NEX-18-09 — Bring-your-own data sources
**As an** Org Admin, **I want** to register my org's own data sources, **so that** the loop
consumes our proprietary data alongside the global sources.
- **Type:** New · **Priority:** P2 · **Version:** v1.2 · **POC ref:** extends Epic 14 + NEX-18-03 · **Layer:** both
- **Acceptance criteria:**
  - Given a per-org connector, when I register and configure it, then it is ingested on the fly and consumed by the loop for my org only (G1); global + org sources coexist.

> **Version note:** NEX-18-01→04 (Platform Admin dashboard, tenant management, global data
> sources, system defaults + tenant override) are **in v1.0** — they pair with the Epic 01
> tenancy work. NEX-18-05→09 (cross-tenant usage, org-admin dashboard, org usage/credits,
> BYO-data) stay v1.1–v1.2.
