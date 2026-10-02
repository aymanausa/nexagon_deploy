# Epic 21 — Security & Compliance

Production-hardening: the gates a government/enterprise buyer checks before granting production
access. From `../v1-production-readiness-assessment.md` sections D & E. Some are process/infra,
not app code. POC ref: `docs/deployment-guide.md` (TLS via Cloudflare, non-root user) + Epic 16-06 baseline.

### NEX-21-01 — Security review / penetration test before go-live
**As a** buyer's security team, **I want** an independent review before production access, **so that**
the system is verified defensible, not assumed.
- **Type:** New (process) · **Priority:** P0 · **Version:** v1.0 go-live gate · **POC ref:** none (was v2.0 — too late) · **Layer:** both
- **Acceptance criteria:**
  - Given v1.0 is feature-complete, when go-live is planned, then a pen test / security review is completed and high/critical findings are remediated before the first pilot's production access.

### NEX-21-02 — Data residency (KSA) + encryption at rest
**As a** government buyer, **I want** data hosted in-Kingdom and encrypted at rest, **so that**
PDPL and procurement requirements are met.
- **Type:** New (infra) · **Priority:** P0 · **Version:** v1.0 · **POC ref:** deployment decision · **Layer:** backend
- **Acceptance criteria:**
  - Given the deployment, when provisioned, then the database and backups reside in an approved KSA region and are encrypted at rest.
  - Given this is a deploy-time decision, when chosen, then it is documented in the deployment guide (can't be retrofitted cheaply).

### NEX-21-03 — Rate limiting & brute-force protection
**As the** platform, **I want** request rate limits and auth throttling, **so that** auth and
AI-cost endpoints resist abuse.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** none · **Layer:** backend
- **Acceptance criteria:**
  - Given repeated requests beyond a threshold, when detected, then they are throttled (esp. login, reset, and `ai-chat`/`run-nl` cost endpoints); pairs with account lockout (NEX-19-04).

### NEX-21-04 — Dependency / vulnerability scanning
**As a** developer, **I want** automated dependency and image scanning in CI, **so that** known
vulnerabilities are caught before release.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** CI (NEX-16-07) · **Layer:** both
- **Acceptance criteria:**
  - Given a PR/build, when CI runs, then SCA (and container image scan) runs and fails on high/critical vulnerabilities.

### NEX-21-05 — PDPL data handling
**As a** data protection officer, **I want** defined retention, subject-access, and consent
handling for personal data, **so that** we comply with Saudi PDPL.
- **Type:** New · **Priority:** P1 · **Version:** v1.1 · **POC ref:** none · **Layer:** backend
- **Acceptance criteria:**
  - Given personal data (users), when the policy is applied, then retention windows, export/delete of a subject's data, and consent records exist and are honored.

### NEX-21-06 — Accessibility (WCAG 2.1 AA)
**As a** user with a disability (and a government buyer with legal a11y requirements), **I want**
the UI to meet WCAG 2.1 AA, **so that** the product is usable and compliant.
- **Type:** New · **Priority:** P1 · **Version:** v1.1 · **POC ref:** extends Epic 17 (contrast only today) · **Layer:** frontend
- **Acceptance criteria:**
  - Given every page, when audited, then it meets WCAG 2.1 AA: keyboard navigable, screen-reader labels, focus states, contrast in both themes, and correct semantics — verified by an automated + manual pass.

### NEX-21-07 — Secrets management & rotation
**As an** operator, **I want** secrets centrally managed and rotatable, **so that** credentials
aren't static or exposed.
- **Type:** New · **Priority:** P2 · **Version:** v1.1 · **POC ref:** env-var baseline (NEX-16-06) · **Layer:** backend
- **Acceptance criteria:**
  - Given secrets, when stored, then they live in a secrets manager (not plain env files in the repo) and can be rotated without a code change.
