# Nexagon — GitHub Setup Guide

Concrete steps to put the repo on GitHub and enforce the gates in
`testing-and-branching-strategy.md`. The v2 folder is its own git repo (`v2/.git`, branch `main`),
so **the GitHub repo root = `v2/`** — workflow paths are `backend/` and `frontend/`. `gh` is
authenticated as `aymanausa`. Replace `aymanausa/nexamind` if you pick another name.

> Order: (1) create repo + branches → (2) add workflow files + traceability script → (3) add
> secrets → (4) turn on branch protection last (so the required checks already exist to select).

## 1. Create the repo and branches
```bash
cd v2
# private repo (government project), push current main
gh repo create aymanausa/nexamind --private --source=. --remote=origin --push

# integration + release branches off main
git checkout -b development && git push -u origin development
git checkout development && git checkout -b release && git push -u origin release
git checkout development

# make development the default branch (feature PRs target it)
gh repo edit aymanausa/nexamind --default-branch development
```

## 2. Add the CI workflows
Create these under `v2/.github/workflows/`. Prerequisites they assume (the 5 setup tasks): the 2
`tsc` errors fixed, a frontend Jest+RTL harness (`npm test` in `frontend/`), Playwright installed
under `e2e/`, and the traceability script from §3. Steps that depend on not-yet-built pieces are
marked — wire them as those land.

### `.github/workflows/ci.yml` — Gate 1 (every push / PR): build, typecheck, unit
```yaml
name: CI
on:
  push:
    branches: ["feature/**", "hotfix/**"]
  pull_request:
    branches: [development, release, main]
jobs:
  build:
    name: Build & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: "**/package-lock.json" }
      - name: Backend build (fails on tsc errors)
        working-directory: backend
        run: npm ci && npm run build
      - name: Frontend build
        working-directory: frontend
        run: npm ci && npm run build
  unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: "**/package-lock.json" }
      - name: Backend unit tests
        working-directory: backend
        run: npm ci && npm test
      - name: Frontend unit tests   # requires frontend Jest+RTL harness
        working-directory: frontend
        run: npm ci && npm test --if-present
```

### `.github/workflows/integration.yml` — Gate 2 (PR → development): integration + traceability
```yaml
name: Integration
on:
  pull_request:
    branches: [development, release]
jobs:
  integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres, POSTGRES_DB: ews_test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres" --health-interval 5s
          --health-timeout 5s --health-retries 10
      redis:
        image: redis:7
        ports: ["6379:6379"]
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ews_test
      REDIS_URL: redis://localhost:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: "**/package-lock.json" }
      - name: Migrate test DB
        working-directory: backend
        run: npm ci && npx prisma migrate deploy
      - name: Integration + acceptance tests
        working-directory: backend
        run: npm run test:e2e --if-present   # Nest's supertest suite (API+DB)
  traceability:
    name: Story Traceability
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - name: Every in-scope story has a test
        run: node scripts/traceability.mjs
```

### `.github/workflows/release.yml` — Gate 3 (PR → release): full regression + E2E
```yaml
name: Release Checks
on:
  pull_request:
    branches: [release]
jobs:
  regression:
    name: Regression
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres, POSTGRES_DB: ews_test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres" --health-interval 5s
          --health-timeout 5s --health-retries 10
      redis: { image: redis:7, ports: ["6379:6379"] }
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ews_test
      REDIS_URL: redis://localhost:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: "**/package-lock.json" }
      - name: Full backend suite + migration/rollback check
        working-directory: backend
        run: |
          npm ci
          npx prisma migrate deploy
          npm test && npm run test:e2e --if-present
  e2e:
    name: E2E (Playwright)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: "**/package-lock.json" }
      - name: Run Playwright against the stack   # requires e2e/ Playwright project
        working-directory: e2e
        run: |
          npm ci
          npx playwright install --with-deps
          npm test
```

> **Gate 4 (release → main / deploy):** add `deploy.yml` on `push: branches: [main]` to build+push
> images and deploy to prod, then `gh release create vX.Y.Z`. Deploy target (VPS) specifics belong
> with `deployment-guide.md`.

## 3. Traceability script (`scripts/traceability.mjs`)
Scans the story files for `NEX-XX-YY` ids and the test files for the ids they reference; fails if
any story has no test. Non-code stories are exempted via `scripts/traceability-exempt.txt`
(one id or `NEX-19`-style prefix per line).
```js
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ID = /NEX-\d{2}-\d{2}/g;
const read = (p) => readFileSync(p, "utf8");
const walk = (d, out = []) => { for (const f of readdirSync(d)) {
  const p = join(d, f); const s = statSync(p);
  s.isDirectory() ? (f === "node_modules" ? null : walk(p, out)) : out.push(p);
} return out; };

// stories → set of all ids
const stories = new Set();
for (const f of walk("docs/user-stories")) if (f.endsWith(".md"))
  for (const m of read(f).matchAll(ID)) stories.add(m[0]);

// tests → ids referenced in test files
const tested = new Set();
for (const d of ["backend/src", "backend/test", "frontend", "e2e"]) {
  try { for (const f of walk(d))
    if (/\.(spec|test)\.(ts|tsx)$/.test(f))
      for (const m of read(f).matchAll(ID)) tested.add(m[0]);
  } catch {}
}

// exemptions (non-code / manual-verify stories)
let exempt = [];
try { exempt = read("scripts/traceability-exempt.txt").split(/\r?\n/).map(s => s.trim()).filter(Boolean); } catch {}
const isExempt = (id) => exempt.some((e) => id === e || id.startsWith(e));

const missing = [...stories].filter((id) => !tested.has(id) && !isExempt(id)).sort();
console.log(`stories=${stories.size} tested=${tested.size} exempt=${exempt.length} missing=${missing.length}`);
if (missing.length) { console.error("Stories with no test:\n  " + missing.join("\n  ")); process.exit(1); }
console.log("✓ every in-scope story has at least one test");
```
Seed the exemptions with the ops/manual stories:
```
# scripts/traceability-exempt.txt  — verified by drill/manual, not unit tests
NEX-20-01
NEX-21-01
NEX-21-02
NEX-21-05
NEX-21-06
```

## 4. Secrets & variables
```bash
gh secret set ANTHROPIC_API_KEY --repo aymanausa/nexamind   # tests stub Claude, but staging/e2e may need it
# add deploy/staging secrets as those pipelines land (registry creds, VPS SSH key, etc.)
```

## 5. PR hygiene
- `.github/pull_request_template.md`:
```markdown
## Story
Closes NEX-XX-YY — <title>

## Acceptance criteria covered
- [ ] AC1 … (test: <name>)
- [ ] Tenancy (G1) / Audit (G5) / RBAC (G6) where applicable
- [ ] No mock data / faked auth (G3); builds clean; tests tagged NEX-XX-YY
```
- `.github/CODEOWNERS` (require review): `* @aymanausa`
- Enforce Conventional Commits + story id in PR titles (optional: a lint action).

## 6. Turn on branch protection (do this LAST)
The required check names must match the job `name:` values above: **Build & Typecheck**,
**Unit Tests**, **Integration Tests**, **Story Traceability**, **Regression**, **E2E (Playwright)**.

`protection-development.json`:
```json
{
  "required_status_checks": { "strict": true,
    "contexts": ["Build & Typecheck", "Unit Tests", "Integration Tests", "Story Traceability"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 1 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```
`protection-release.json` — same shape, contexts also include `"Regression"` and `"E2E (Playwright)"`.
`protection-main.json` — contexts `["Build & Typecheck", "Unit Tests"]`, reviews required, admins enforced.

Apply:
```bash
gh api -X PUT repos/aymanausa/nexamind/branches/development/protection --input protection-development.json
gh api -X PUT repos/aymanausa/nexamind/branches/release/protection      --input protection-release.json
gh api -X PUT repos/aymanausa/nexamind/branches/main/protection         --input protection-main.json
```
(Or GitHub UI: Settings → Branches → Add rule → pick the branch → require PR + require status
checks → select the check names above.)

## One-time checklist
- [ ] Repo created, `main`/`development`/`release` pushed, default = `development`
- [ ] Workflow files committed on `development`; a first PR shows the checks running
- [ ] Traceability script + exemptions committed
- [ ] Secrets set
- [ ] PR template + CODEOWNERS added
- [ ] Branch protection applied to all three protected branches (required checks selected)
