# Nexagon v1.0 — Production-Readiness Assessment

**Verdict:** With the v1.0 features as specced (`user-stories/` epics 00–18), Nexagon becomes a
**functionally complete, real multi-tenant product** — but it is **not yet production-ready for a
government/enterprise pilot.** The gap is not the product loop (that's done); it's the
"operate it safely for a real customer" layer. Several required items are **not in any release
yet**. Assessed 2026-09-30. Severity: 🔴 blocker for a real pilot · 🟡 important (fast-follow OK) ·
🟢 fine to defer post-pilot.

## What v1.0 already covers well
- **The full decision loop** — Detect → Measure → Anticipate → Decide → Stress-test → Track (epics 03–15).
- **Real identity & tenancy** — real auth (00), multi-tenancy + audit log (01), RBAC (02), super-admin console (18 core).
- **SaaS foundation** — org isolation, system defaults + tenant override, global data-source mgmt.
- **UX** — theme, responsive baseline, i18n + Arabic/RTL (17).
- **Baseline platform** — production build, API contract, real-time, self-running pipelines, security baseline, CI (16).
- **AI** — tool-using copilot (10), NL what-if (09), news classification (08).

## Gaps that block or weaken production readiness

### A. Authentication completeness
| Gap | Sev | Currently | Why it matters |
|---|---|---|---|
| **Password reset / forgot-password** | 🔴 | **Not planned** | Without it, any user who forgets a password is locked out and needs manual DB intervention. Table-stakes for real auth. |
| **MFA / 2FA (TOTP)** | 🔴 | v1.1 | A ministry security review usually *requires* MFA before granting access to a system that recommends moving reserves. Pull into v1.0. |
| **Self-service change password / profile** | 🟡 | Partial (settings) | Users must be able to rotate their own credentials. |

### B. Communications
| Gap | Sev | Currently | Why it matters |
|---|---|---|---|
| **Email / notification delivery** | 🔴 | **Not planned** | User invites (NEX-02-02), password reset, and alert/briefing delivery all assume email exists. Nothing specs an email/notification service. Blocks admin-driven provisioning end-to-end. |
| **In-app / push notifications** | 🟢 | Not planned | Nice-to-have; alerts page + badge cover the minimum. |

### C. Reliability & operations
| Gap | Sev | Currently | Why it matters |
|---|---|---|---|
| **Backups + restore / disaster recovery** | 🔴 | **Not planned** | No backup = one bad migration or disk failure loses a ministry's data. Non-negotiable for production. |
| **Error tracking + APM** (e.g. Sentry/OpenTelemetry) | 🔴 | **Not planned** | The POC's one test rotted silently for weeks. In production you must *see* errors and latency, not discover them from users. |
| **Health/readiness probes** | 🟡 | Not planned | Needed for any orchestrated deploy and uptime checks. |
| **Centralized structured logging** | 🟡 | Not planned | Debugging a multi-tenant prod system without it is guesswork. |
| **Uptime monitoring + alerting/on-call** | 🟡 | Not planned | Someone must be paged when it's down. |
| **DB migration & rollback strategy in prod** | 🟡 | Partial (`db:deploy`) | Have a tested forward+rollback path, not ad-hoc. |
| **HA / redundancy / scale-out** | 🟢 | v2.0 | Single-node is acceptable for one pilot; needed later. |

### D. Security & compliance (heightened for government)
| Gap | Sev | Currently | Why it matters |
|---|---|---|---|
| **Security review / pen test before go-live** | 🔴 | v2.0 | v2.0 is far too late — a gov buyer will require this *before* production access. Line it up for v1.0 go-live. |
| **Data-at-rest encryption + KSA data residency (PDPL)** | 🔴 | **Not planned** | Saudi PDPL + gov procurement typically require data hosted in-Kingdom and encrypted at rest. This is a deploy/infra decision that must be made now. |
| **Rate limiting / brute-force protection / WAF** | 🟡 | **Not planned** | Protects auth and AI-cost endpoints from abuse. |
| **Dependency / vulnerability scanning** | 🟡 | CI exists (16-07), no scan | Add SCA to CI; supply-chain is a standard checklist item. |
| **PDPL data handling** (retention, subject rights, consent) | 🟡 | Not planned | Formal data-lifecycle policy for personal data. |
| **TLS termination** | ✅ | Covered (Cloudflare, deploy guide) | — |
| **Secrets from env, no secrets in repo** | ✅→🟡 | Baseline (16-06) | Good baseline; add rotation/vault for full marks. |

### E. Product/UX completeness
| Gap | Sev | Currently | Why it matters |
|---|---|---|---|
| **Accessibility (WCAG 2.1 AA)** | 🟡 | Partial (contrast only, 17-01) | Government software is frequently *legally* required to be accessible. Spec it beyond contrast. |
| **Standardized empty / error / loading states** | 🟡 | Implied per story | Consistency across pages; part of feeling "finished". |
| **Onboarding / demo-data toggle** | 🟢 | v1.1 | Helps first pilots; not a blocker. |

### F. Data credibility (not a feature gap — a data-partnership gap)
| Item | Sev | Currently | Note |
|---|---|---|---|
| **Authoritative feeds** (SAGO/GASTAT/MEWA/SFDA) | 🟡 | When-ready track | Headline numbers stay proxy until these land; depends on the authorities, not engineering. Proxy labeling is already specced (NEX-13-01). |

## Recommendation — a "v1.0 production-hardening" bundle
The functional product is done at v1.0. To make it *deployable to a real pilot*, add these
before go-live (most are small-to-medium, none are research):

**Must add to reach production (🔴):**
1. Password reset + self-service password change
2. Email/notification delivery service (unblocks invites, reset, alerts)
3. MFA/TOTP — pull from v1.1
4. Backups + tested restore/DR
5. Error tracking + APM + health probes
6. Book a security review/pen test for go-live; decide KSA data residency + at-rest encryption now

**Strongly recommended (🟡, fast-follow):** rate limiting, structured logging + uptime alerting,
dependency scanning in CI, accessibility pass, migration/rollback runbook.

**Fine to defer (🟢):** HA/scale-out (v2.0), in-app notifications, onboarding polish (v1.1),
credits/billing (v1.2).

## Bottom line
- **"Complete" as a product?** Yes — the loop, tenancy, admin, AI, and UX are all there.
- **"Production-ready" for a government pilot?** Not yet — ~6 blockers, several unplanned.
- **Effort to close:** the hardening bundle is mostly plumbing, not new product surface. It's
  the difference between *demoable* and *deployable*. Recommend adding it as a hardening track
  that must complete before the first real pilot goes live (not a 2028 item).

> **Status:** folded into the plan. Hardening track added to `release-roadmap.md` (🔒 go-live
> gates in v1.0 + fast-follow in v1.1) and specced as user-story epics **19** (auth completeness
> & communications), **20** (operations & observability), **21** (security & compliance).
