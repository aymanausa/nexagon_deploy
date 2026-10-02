# Epic 01 — Multi-Tenancy & Audit Log

The SaaS bedrock. Every model gets a `tenantId`; every query is org-scoped; every
state-change is audited. **New for v1.0** — no POC equivalent (the POC is single-tenant with
a fake user). This epic is a prerequisite for Epics 02–15 (Global Rule G1, G5).

> **Open decision before build:** row-level tenancy (shared DB + `tenantId`, cheapest) vs
> schema/DB-per-tenant (stronger isolation, heavier ops). Stories below assume row-level;
> re-check AC wording if schema-per-tenant is chosen.

### NEX-01-01 — Tenant data model
**As a** Platform Admin, **I want** every domain record owned by exactly one org, **so that**
data can never leak across tenants.
- **Type:** New · **Priority:** P0 · **POC ref:** `backend/prisma/schema.prisma` · **Layer:** backend
- **Acceptance criteria:**
  - Given the schema, when reviewed, then every tenant-owned model has a non-null `tenantId` with an index and FK to `Organization`.
  - Given a new org, when created, then its records are isolated from all other orgs.

### NEX-01-02 — Automatic query scoping
**As an** Analyst, **I want** all data I see automatically limited to my org, **so that** I
never see another org's data and developers can't forget to filter.
- **Type:** New · **Priority:** P0 · **POC ref:** all backend services · **Layer:** backend
- **Acceptance criteria:**
  - Given an authenticated request, when any service queries the DB, then `tenantId` is applied centrally (Prisma middleware / a scoped client), not hand-added per query.
  - Given a request that omits a tenant context, when it reaches a tenant-owned model, then it is rejected rather than returning cross-tenant rows.
  - Given org A's user requesting org B's record by id, when handled, then it returns 404/forbidden, not the record.

### NEX-01-03 — Organization lifecycle
**As a** Platform Admin, **I want** to create, suspend, and assign a plan to an org, **so that**
I can onboard and manage tenants.
- **Type:** New · **Priority:** P1 · **POC ref:** n/a (new admin surface, see Epic 14) · **Layer:** backend
- **Acceptance criteria:**
  - Given the platform admin console, when I create an org, then it is provisioned with defaults inherited from system config (Epic 14).
  - Given a suspended org, when its users try to log in, then access is denied.

### NEX-01-04 — Immutable audit log
**As an** Org Admin / auditor, **I want** every consequential action recorded immutably, **so that**
decisions (who changed a threshold, who ran a simulation, who approved an initiative) are defensible in a security review.
- **Type:** New · **Priority:** P0 · **POC ref:** n/a · **Layer:** backend
- **Acceptance criteria:**
  - Given any state-changing request (POST/PUT/PATCH/DELETE), when it succeeds, then an audit entry is written: actor id, role, action, target type+id, org, timestamp, and before/after where applicable.
  - Given an audit entry, when any user attempts to edit or delete it, then the operation is refused (append-only).
  - Given an Org Admin, when they open the audit view, then they see their org's entries filtered by actor/date/action.

### NEX-01-05 — Audit log export
**As an** Org Admin, **I want** to export the audit log, **so that** I can hand compliance evidence to a customer's security team.
- **Type:** New · **Priority:** P1 · **POC ref:** n/a · **Layer:** both
- **Acceptance criteria:**
  - Given the audit view, when I export a date range, then I receive a CSV/JSON of my org's entries only (G1).
