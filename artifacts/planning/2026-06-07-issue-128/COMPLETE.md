# Work Package: Canonical Identifier Naming Convention (Issue #128) - Complete (pending merge)

**Date:** 2026-06-08
**Type:** Enhancement (definition-corpus + documentation; no runtime/source change)
**Status:** IMPLEMENTED, REVIEWED, VALIDATED — **awaiting merge** (PR #129 intentionally a draft)
**Branches:** `chore/128-canonical-naming-convention` (→ `main`), `chore/128-workflows-naming-convention` (→ `workflows`)
**PRs:** [#129](https://github.com/m2ux/workflow-server/pull/129) (spec + submodule pointer, **draft**), [#130](https://github.com/m2ux/workflow-server/pull/130) (workflow content)

> **Completion timing note.** Per the `completion-timing` rule, `COMPLETE.md` records the *final delivered state* and is normally created after merge. Both PRs are pushed but **not yet merged**, and PR #129 is deliberately held as a draft for review. This document therefore captures the fully implemented/reviewed/validated state as of pre-merge; the merge-dependent fields (merged SHAs, final ADR acceptance, plan status flip to Complete) are confirmed after merge. No further implementation work remains.

---

## Summary

Settled the missing **naming-structure convention** for technique inputs/outputs and rules: identifier *grammar* (affirmative-predicate booleans, plural-collection/singular-map, qualified-noun-phrase head-noun-last, positive-assertion rule slugs), layered on top of the already-landed case/reference conventions. The convention was written into the anti-patterns catalog as a single new entry (AP-60), mirrored into the technique-protocol specification (§3.2/§3.4/§8), wired into the `workflow-design` step-8 audit as the sole mechanical enforcement, and the genuinely-deviating identifiers across the corpus were migrated into conformance. The change is documentation + workflow-definition only — no `src/`, `schemas/`, or runtime behaviour is touched.

---

## What Was Implemented

### Task 1: AP-60 naming-structure convention in the anti-patterns catalog ✅
**Deliverables:**
- `workflows/workflow-design/resources/anti-patterns.md` — new AP-60 entry stating all four sub-rules and explicitly composing with AP-42/52/55/57.

**Key features:** affirmative-predicate boolean (prefix value-gated; past-participle result flags conformant); plural-collection / singular-map with no representation suffix (same rule as AP-42); qualified-noun-phrase head-noun-last (enum `_mode`/`_type` exempt); positive-assertion rule slug.

### Task 2: Convention stated in the technique-protocol specification ✅
**Deliverables:**
- `docs/technique-protocol-specification.md` — naming-structure subsection at §3.2 (Inputs/Output), positive-assertion paragraph at §3.4 (Rules), and §8 authoring-rules summary bullet, all cross-referencing AP-60.

### Task 3: Naming-grammar audit heuristic in `workflow-design` ✅
**Deliverables:**
- `workflows/workflow-design/techniques/workflow-design.md` — step-8 ("Audit Anti Pattern Scan") bullet of the same shape as the AP-55/57/59 bullets; tests for *affirmative* (not merely *prefixed*) booleans, singular iterated collections, direction-encoded I/O, representation-suffixed ids, and non-assertive rule slugs; entry-count note bumped 59 → 60.

### Task 4: `{lens-name}` → `{lens_name}` binding-defect fix ✅
**Deliverables:**
- `workflows/prism/activities/01-structural-pass.toon` — both occurrences (lines 14, 118) fixed so the token binds to the `lens_name` symbol declared at `prism/techniques/portfolio-analysis.md:71`.

### Task 5: Boolean technique-I/O id rename ✅
**Deliverables:**
- `squash_merge_available` → `squash_merge_supported` swept across all binding surfaces: `work-package/techniques/manage-git/detect-merge-strategy.md`, `work-package/workflow.toon`, `work-package/activities/01-start-work-package.toon`, `work-package/activities/12-submit-for-review.toon`, and `work-package/activities/README.md`. Old name → 0 evaluated references; one intentional survivor remains as the AP-60 bad-name example.

### Task 6: Positive-assertion rule-slug pass + qualified-identifier sweep ✅
**Deliverables:**
- 5 negation-shaped rule slugs converted: `no-false-positives`→`confirmed-flow-only`, `no-context-leakage`→`isolated-context`, `no-reassignment`→`severities-inherited`, `no-analysis`→`dispatch-only`, `no-narration`→`synthesize-directly` (headings + dotted citations + group-expansion references).
- A broader qualified-identifier conformance sweep across the `prism*`, `cicd-pipeline-security-audit`, `meta`, and `remediate-vuln` workflows, scoped by the [ap60-proposed-changes](ap60-proposed-changes.md) and [ap60-corpus-compliance-audit](ap60-corpus-compliance-audit.md) reports. Held-back slugs (where the negation reads more clearly) are listed in those reports rather than mechanically rewritten.

---

## Test Results

No test source was authored — this is a definition-corpus + documentation change with no runtime feature and no automated naming-grammar guard. Verification is mechanical, recorded in [10-validation.md](10-validation.md) (`validation_passed = true`, `has_failures = false`):

| Check | Result |
|-------|--------|
| TOON structure validation (`scripts/validate-activities.ts`) | 34 activities (work-package 14, prism 13, cicd 7) — PASS |
| Grep-parity (every renamed id: old → 0 evaluated, new present at all sites) | PASS |
| Count consistency (one AP-60; step-8 reads "60 entries") | PASS |
| Spec coherence (§3.2/§3.4/§8 ↔ AP-60 cross-refs resolve both ways) | PASS |
| `npm run typecheck` (advisory, unchanged `src/`) | PASS (clean) |
| `npm test` (advisory, unchanged `src/`) | PASS — 371 passed / 2 skipped / 0 failed |

See the source-linked verification matrix in [test-plan.md](test-plan.md).

---

## Files Changed

**PR #129 (→ `main`, 2 files, +40/-1):**
- `docs/technique-protocol-specification.md` — naming-structure convention at §3.2/§3.4/§8.
- `workflows` — submodule pointer bump to the content commit.

**PR #130 (→ `workflows`, 91 files, +216/-178):** the convention-defining edits (AP-60 in `anti-patterns.md`, `workflow-design.md` step-8 bullet) plus the migration/qualified-identifier sweep across `work-package`, `prism`, `prism-audit`, `prism-evaluate`, `prism-update`, `cicd-pipeline-security-audit`, `meta`, and `remediate-vuln`. Full list: `gh pr diff 130 --name-only`.

---

## Success Criteria Results

*Targets from the [implementation plan](06-work-package-plan.md#success-criteria) / [design philosophy](02-design-philosophy.md#success-criteria).*

| Criterion (Gap) | Target | Actual | Status |
|-----------------|--------|--------|--------|
| G1 — Convention defined | AP-60, four sub-rules, composes with AP family | AP-60 present, self-consistent | ✅ Met |
| G2 — Spec captures convention | §3.2/§3.4/§8, cross-refs resolve | Present, bidirectional | ✅ Met |
| G3 — Audit heuristic | step-8 bullet, affirmative-not-prefixed | Present, AP-55/57/59 shape | ✅ Met |
| G4 — Corpus conforms | deviating ids migrated; references intact | binding defect closed; boolean + slug renames swept | ✅ Met |
| G5 — No silent binding break | grep-parity old→0 / new==prior; structure validates | grep-parity + structure validator PASS | ✅ Met |
| No regressions | typecheck/test green | green (advisory; `src/` unchanged) | ✅ Met |

---

## What Was NOT Implemented

- ❌ **`planning_folder_path` and other high-fan-out `_path` state-var renames** — Deferred (out of scope). Highest blast radius (hoisted, read across nearly every activity), high silent-mis-fire risk for low convention payoff; easily reversible later.
- ❌ **Mechanical 22-for-22 rule-slug rewrite** — Out of scope by design; only the judgement-bounded subset where the positive form reads at least as clearly was converted.
- ❌ **A loader/schema or runtime guard for the convention** — Out of scope; the engine resolves identifiers by exact-string match with no alias layer. Enforcement is the authoring-time audit only.

---

## Known Limitations & Caveats

- ⚠️ **The audit certifies shape, not meaning** — a shape-conformant boolean whose meaning silently inverted still passes. Structural residual, documented (G6), assigned to author responsibility.
- ⚠️ **No runtime guard** — a partial/botched rename is a silent transition mis-fire, not a load/typecheck error; correctness rests on grep-parity discipline at authoring time. `typecheck`/`test` cover `src/` only.
- ⚠️ **Held-back negation slugs remain** — a subset of negation-shaped slugs is intentionally left as-is; the corpus is not 100% positive-assertion by design (residual explicitly listed in the AP-60 reports).
- ⚠️ **`validate-workflow-toon.ts` could not run on the reference checkout** (missing `skill.schema.ts` on `main`); the lighter `validate-activities.ts` provided the equivalent structure signal. See [10-validation.md Environment notes](10-validation.md#environment-notes-honest-record).

---

## Design Decisions

### Decision 1: Single new AP-60 entry rather than extending AP-42/55
**Context:** The convention's four sub-rules could live as a new entry or be folded into the existing representation/duplication entries.
**Decision:** One new AP-60 entry, explicitly composing with AP-42/52/55/57.
**Rationale:** A single citable unit ("the naming-structure convention") keeps the catalog coherent and the plural-collection rule identical to AP-42's no-representation-suffix rule; extending in place would scatter four rules across two entries and muddy AP-42's focus.

### Decision 2: Affirmative predicate, not mandatory prefix
**Context:** Whether every boolean must carry `is_`/`has_`/`can_`/`should_`.
**Decision:** Require an affirmative phrase; treat the prefix as value-gated (optional).
**Rationale:** Microsoft FDG — prefix "only where it adds value"; mechanically re-prefixing conformant past-participle result flags would harm readability. The heuristic tests for *affirmative*, not *prefixed*.

### Decision 3: Two PRs split by base branch
**Context:** Spec lives on `main`; workflow content lives on the `workflows` orphan branch.
**Decision:** PR #129 (spec + submodule pointer → `main`, held as draft), PR #130 (workflow content → `workflows`).
**Rationale:** The two bases require separate PRs; keeping #129 a draft lets the human review the coordinated pair before either lands.

*Full architectural rationale and alternatives: [ADR-0005](../../adr/0005-canonical-identifier-naming-convention.md).*

---

## Lessons Learned

### What Went Well
- Framing AP-60 as *composing with* the AP-42/52/55/57 family kept the convention coherent rather than introducing a competing rule.
- Per-surface grep-parity caught the only real failure mode (silent transition mis-fire) that no automated guard covers.
- The migration was correctly scoped "broad but shallow" — the dominant shape was already conformant, so the convention codified it rather than imposing churn.

### What Could Be Improved
- The qualified-identifier sweep expanded to 91 files in PR #130, materially broader than the original plan's targeted set; the AP-60 audit reports drove that expansion mid-implementation. Earlier corpus-wide auditing would have sized the migration up front.
- The reference checkout could not run `validate-workflow-toon.ts`; aligning validator availability across branches would remove the need for the lighter-validator substitution.

---

**Status:** IMPLEMENTED, REVIEWED, VALIDATED — awaiting merge (PR #129 draft). Update to COMPLETE on merge.
