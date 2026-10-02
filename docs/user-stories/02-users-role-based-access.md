# Epic 02 — Users & Role-Based Access

Wire the Users page (POC renders a hardcoded `mockUsers` array — `frontend/app/users/page.tsx`)
to the real `users` backend, and add tenant-scoped roles. Backend `users` module exists
(`GET /v1/users`); **no `usersApi` in the client yet** — add it. POC ref: `users` page,
`users` module, Global Rule G6.

### NEX-02-01 — List org users
**As an** Org Admin, **I want** to see the users in my org, **so that** I can manage access.
- **Type:** Finish-work · **Priority:** P0 · **POC ref:** `users` page (`mockUsers` → `GET /v1/users`) · **Layer:** both
- **Acceptance criteria:**
  - Given I am an Org Admin, when I open Users, then I see real users from `GET /v1/users`, scoped to my org (G1) — no mock array.
  - Given I am an Analyst, when I open Users, then access is denied or the page is not shown (G6).

### NEX-02-02 — Invite / provision a user
**As an** Org Admin, **I want** to invite a user to my org with a role, **so that** the right
people get the right access (admin-driven provisioning; no open signup).
- **Type:** New · **Priority:** P0 · **POC ref:** ties to NEX-00-05 · **Layer:** both
- **Acceptance criteria:**
  - Given valid details, when I invite a user, then an account is created in my org with the chosen role and an audit entry (G5).
  - Given a duplicate email in my org, when I invite, then it is rejected with a clear message.

### NEX-02-03 — Assign and change roles
**As an** Org Admin, **I want** to set a user's role (Org Admin / Analyst), **so that**
permissions match responsibility.
- **Type:** New · **Priority:** P0 · **POC ref:** RBAC (G6) · **Layer:** both
- **Acceptance criteria:**
  - Given a user, when I change their role, then their permissions update on their next request and the change is audited.
  - Given I am the last Org Admin, when I try to demote myself, then it is prevented.

### NEX-02-04 — Deactivate a user
**As an** Org Admin, **I want** to deactivate a user, **so that** departed staff lose access
immediately (no SSO/SCIM in v1.0, so this is manual).
- **Type:** New · **Priority:** P1 · **POC ref:** n/a · **Layer:** both
- **Acceptance criteria:**
  - Given an active user, when I deactivate them, then their sessions are invalidated and they cannot log in.

### NEX-02-05 — Enforce role gates server-side
**As a** developer, **I want** roles enforced on the API, not just hidden in the UI, **so that**
permissions can't be bypassed.
- **Type:** New · **Priority:** P0 · **POC ref:** all write endpoints (G6) · **Layer:** backend
- **Acceptance criteria:**
  - Given an Analyst token, when it calls an admin-only endpoint (user mgmt, config/threshold writes), then it is rejected with 403.
  - Given role checks, when applied, then they are declared per-route (guard/decorator), not scattered ad hoc.

### NEX-02-06 — Roles are tenant-scoped
**As a** Platform Admin, **I want** roles to mean "within an org", **so that** an admin of
org A has no power in org B.
- **Type:** New · **Priority:** P0 · **POC ref:** G1 + G6 · **Layer:** backend
- **Acceptance criteria:**
  - Given an Org Admin of org A, when they access org B's users or config, then it is forbidden.
