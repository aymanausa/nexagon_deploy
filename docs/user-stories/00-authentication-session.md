# Epic 00 — Authentication & Session

Replace the POC's faked auth (`useAuth.ts` hardcodes `token: 'mock-token'` and a fake
`Dr. Ayman Al-Ali / SALIC` user) with real JWT auth against the existing `auth` backend.
This is the **critical path** for v1.0 — tenancy (01), RBAC (02), and metering all depend on
a real authenticated identity. POC ref: `frontend/hooks/useAuth.ts`, `frontend/app/login`,
backend `auth` module (`/v1/auth/login|register|refresh|me`), `frontend/lib/api.ts` `authApi`.

### NEX-00-01 — Log in with email and password
**As an** Analyst, **I want** to log in with my email and password, **so that** I get an
authenticated session scoped to my org.
- **Type:** Finish-work · **Priority:** P0 · **POC ref:** `authApi.login` → `POST /v1/auth/login`, `/login` page · **Layer:** both
- **Acceptance criteria:**
  - Given valid credentials, when I submit the login form, then I receive a JWT, it is stored, and I land on the dashboard.
  - Given invalid credentials, when I submit, then I see an inline error and no token is stored.
  - Given the token, when any API call is made, then it is sent as `Authorization: Bearer <token>`.

### NEX-00-02 — Persist and restore session
**As an** Analyst, **I want** my session to persist across reloads, **so that** I don't
re-authenticate on every page load.
- **Type:** Finish-work · **Priority:** P0 · **POC ref:** `useAuth.ts` (currently fakes this) · **Layer:** both
- **Acceptance criteria:**
  - Given a stored valid token, when I reload, then `GET /v1/auth/me` restores my identity (id, name, org, role) — **not** a hardcoded user.
  - Given no token or an expired one, when I open any protected page, then I am redirected to `/login` (G2).

### NEX-00-03 — Expire and refresh session
**As an** Analyst, **I want** my session to refresh silently and expire safely, **so that**
I stay logged in during use but am protected when idle.
- **Type:** New · **Priority:** P1 · **POC ref:** `POST /v1/auth/refresh` (exists, unused by FE) · **Layer:** both
- **Acceptance criteria:**
  - Given a near-expiry token, when a request is made, then it is refreshed via `/v1/auth/refresh` without interrupting me.
  - Given a 401 on any call, when it returns, then the token is cleared and I am sent to `/login` (matches `apiFetch`).

### NEX-00-04 — Log out
**As an** Analyst, **I want** to log out, **so that** my session cannot be reused on a shared device.
- **Type:** New · **Priority:** P1 · **POC ref:** `components/layout/Header.tsx` · **Layer:** both
- **Acceptance criteria:**
  - Given I am logged in, when I click log out, then the token is cleared and I am returned to `/login`.

### NEX-00-05 — Provisioned accounts only (no open self-registration)
**As a** Platform/Org Admin, **I want** account creation controlled, **so that** only
authorized ministry users get access.
- **Type:** New · **Priority:** P0 · **POC ref:** `POST /v1/auth/register` (must be admin-gated) · **Layer:** both
- **Acceptance criteria:**
  - Given the register endpoint, when called by a non-admin, then it is rejected (G6).
  - Given an Org Admin, when they invite a user, then an account is created in their org with an assigned role (see Epic 02).

### NEX-00-06 — Auth behind a clean boundary (future SSO)
**As a** Platform Admin, **I want** identity handling isolated behind an interface, **so that**
a future buyer's SAML/OIDC can be added without a rewrite (SSO is out of scope for v1.0).
- **Type:** New · **Priority:** P2 · **POC ref:** backend `auth` module · **Layer:** backend
- **Acceptance criteria:**
  - Given the auth module, when reviewed, then credential verification sits behind a provider interface with the native email/password provider as the only v1.0 implementation.

> **Note (v1.1):** MFA/TOTP, password policy, lockout, and device/session management build on
> this epic — see roadmap v1.1. Keep the token/session model ready for a second factor.
