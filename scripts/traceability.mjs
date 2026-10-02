// Fails if any in-scope user story has no referencing test. See docs/testing-and-branching-strategy.md.
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
try { exempt = read("scripts/traceability-exempt.txt").split(/\r?\n/).map(s => s.trim()).filter((s) => s && !s.startsWith("#")); } catch {}
const isExempt = (id) => exempt.some((e) => id === e || id.startsWith(e));

const missing = [...stories].filter((id) => !tested.has(id) && !isExempt(id)).sort();
console.log(`stories=${stories.size} tested=${tested.size} exempt=${exempt.length} missing=${missing.length}`);
if (missing.length) { console.error("Stories with no test:\n  " + missing.join("\n  ")); process.exit(1); }
console.log("✓ every in-scope story has at least one test");
