# Epic 19 — Authentication Completeness & Communications

Production-hardening: the auth flows and the email/notification backbone that the rest of the
product silently assumes. **Go-live gates** — from `../v1-production-readiness-assessment.md`
sections A & B. Mostly **v1.0**. POC ref: none (new); builds on Epic 00 (auth) and Epic 02
(provisioning).

### NEX-19-01 — Password reset (forgot password)
**As a** user who forgot my password, **I want** to reset it via email, **so that** I can
regain access without an admin editing the database.
- **Type:** New · **Priority:** P0 · **Version:** v1.0 · **POC ref:** none (POC has no reset flow) · **Layer:** both
- **Acceptance criteria:**
  - Given my email, when I request a reset, then I receive a time-limited, single-use reset link (via Epic 19 email service).
  - Given a valid link, when I set a new password meeting policy, then it updates, all existing sessions are invalidated, and the action is audited (G5).
  - Given an expired/used link, when opened, then it is rejected; requesting a reset for an unknown email returns the same neutral response (no account enumeration).

### NEX-19-02 — Self-service change password
**As a** logged-in user, **I want** to change my own password, **so that** I can rotate my
credentials.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** Settings (Epic 16-04) · **Layer:** both
- **Acceptance criteria:**
  - Given my current + new password, when I submit, then it verifies the current one, enforces policy, updates, and is audited (G5).

### NEX-19-03 — MFA / TOTP
**As a** security-conscious org, **I want** two-factor authentication, **so that** a leaked
password alone cannot access a system that recommends moving reserves.
- **Type:** New · **Priority:** P0 · **Version:** v1.0 (pulled from v1.1) · **POC ref:** none · **Layer:** both
- **Acceptance criteria:**
  - Given a user, when they enroll, then a TOTP secret + QR is issued and confirmed with a code before activation; recovery codes are provided.
  - Given MFA is enforced for the org, when a user logs in, then a valid second factor is required after the password.
  - Given the token/session model (Epic 00), when MFA is added, then no rework of the session model is needed (00-06 boundary).

### NEX-19-04 — Password policy & account lockout
**As an** Org Admin, **I want** password strength rules and lockout on repeated failures, **so that**
brute-force and weak passwords are prevented.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** none · **Layer:** backend
- **Acceptance criteria:**
  - Given a new/changed password, when it fails policy (length/complexity), then it is rejected with clear guidance.
  - Given N consecutive failed logins, when exceeded, then the account is temporarily locked and the event is audited (pairs with rate limiting, NEX-21-03).

### NEX-19-05 — Email / notification delivery service
**As the** platform, **I want** a reliable transactional email/notification service, **so that**
invites, resets, MFA, and alerts actually reach users.
- **Type:** New · **Priority:** P0 · **Version:** v1.0 · **POC ref:** none (unblocks NEX-02-02, 19-01, 19-03) · **Layer:** backend
- **Acceptance criteria:**
  - Given a transactional event (invite, reset, MFA, alert), when triggered, then an email is sent via a configured provider with delivery success/failure logged.
  - Given a provider outage, when a send fails, then it is retried/queued and surfaced in ops (Epic 20), not silently dropped.
  - Given templates, when localized, then emails respect the recipient's language (Epic 17 i18n).

### NEX-19-06 — Alert & briefing delivery
**As an** Analyst, **I want** critical alerts and the daily brief delivered to me, **so that** I
act on threats without polling the app.
- **Type:** New · **Priority:** P1 · **Version:** v1.1 · **POC ref:** builds on Epic 08 (news brief), Epic 11 (alerts) · **Layer:** backend
- **Acceptance criteria:**
  - Given a high-severity alert or the daily brief, when generated, then it is emailed to subscribed users per their preferences, scoped to their org (G1).
