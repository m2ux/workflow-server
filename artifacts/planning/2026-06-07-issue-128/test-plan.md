# Test Plan: Canonical Naming Convention for Technique Inputs/Outputs and Rules

**Issue:** [#128](https://github.com/m2ux/workflow-server/issues/128)  
**PR:** [#129](https://github.com/m2ux/workflow-server/pull/129)

---

## Overview

This work package adds a **naming-structure convention** (AP-60 + spec section + audit heuristic) and migrates the genuinely-deviating identifiers in the definition corpus into conformance. It is a **definition-corpus + documentation change with no runtime feature** and **no automated naming-grammar guard** — the loader (`TechniqueSchema`, zod) validates structure only, and `getVariableValue` resolves state vars by exact-string match with no alias layer ([05-implementation-analysis.md](05-implementation-analysis.md#baseline-metrics), IA-4). A botched rename is therefore a **silent transition mis-fire, not an error**.

Consequently there are **no new unit/integration/e2e tests to author.** Validation is **mechanical grep-parity per renamed identifier** (old-name occurrences → 0, new-name occurrences == captured prior old count, across every binding surface), backed by the existing structure validator and the e2e walker. `npm run typecheck` / `npm test` cover `src/` only and will NOT catch a botched TOON rename — they are advisory regression checks here, not the guard.

Key changes to validate:
1. `AP-60` (anti-patterns catalog) - convention present, four sub-rules, composes-with cross-references resolve
2. Spec §3.2 / §3.4 / §8 - convention stated, AP-60 ↔ spec cross-references resolve both ways
3. `workflow-design` step-8 audit bullet - present, same shape as AP-55/57/59, tests *affirmative* not *prefixed*
4. `{lens-name}` → `{lens_name}` - binding defect closed (2 occurrences)
5. The 2 boolean technique-I/O id renames - all binding surfaces swept, grep-parity holds
6. Judgement-bounded rule-slug positive-assertion subset - converted slugs swept; held-back slugs intentional

---

## Planned Verification Cases

> These are mechanical verification objectives, not source-linked test functions: this work package authors **no test source**, so there is no test file/line to hyperlink. Per the finalize step, each case instead links to where its evidence was recorded — the [validation artifact](10-validation.md) (with the concrete file:line citations confirmed during the validate activity) and the AP-60 audit reports. "Manual" type denotes agent/human-run mechanical checks. All cases passed; see [10-validation.md](10-validation.md) for the consolidated verdict (`validation_passed = true`, `has_failures = false`).

| Verification ID | Objective | Type | Evidence source |
|---|---|---|---|
| PR129-VC-01 | Verify AP-60 is present in `anti-patterns.md`, covers all four sub-rules, and cross-references AP-42/52/55/57 + the spec section | Manual | [10-validation.md §3 Count consistency](10-validation.md#checks-run); [ap60-corpus-compliance-audit.md](ap60-corpus-compliance-audit.md) |
| PR129-VC-02 | Verify the spec (§3.2/§3.4/§8) states the convention and AP-60 ↔ spec cross-references resolve in both directions | Manual | [10-validation.md §4 Spec coherence](10-validation.md#checks-run) |
| PR129-VC-03 | Verify the `workflow-design` step-8 audit bullet is present, matches the AP-55/57/59 bullet shape, and tests for *affirmative* (not *prefixed*) booleans, singular iterated collections, direction-encoded I/O, representation-suffixed ids, and non-assertive rule slugs | Manual | [10-validation.md §3 Count consistency](10-validation.md#checks-run); [ap60-bare-identifier-audit.md](ap60-bare-identifier-audit.md) |
| PR129-VC-04 | Verify `{lens-name}` count → 0 in the prism path and the token binds to the `lens_name` symbol (`portfolio-analysis.md:71`) | Manual | [10-validation.md §2 Grep-parity](10-validation.md#checks-run) — `01-structural-pass.toon:14,118`; binds to `portfolio-analysis.md:71` |
| PR129-VC-05 | Verify each renamed boolean technique-I/O id: old-name count → 0 across all surfaces (`### ` decl, `{designator}` reads, `workflow.toon variables[]`, activity `set`/`setVariable`, condition/transition `variable`, READMEs); new-name count == captured prior old count | Manual | [10-validation.md §2 Grep-parity](10-validation.md#checks-run) — `squash_merge_available`→`squash_merge_supported`: decl `workflow.toon:296`, producer `01:86`, consumer `12:156`; [ap60-referential-integrity-scan.md](ap60-referential-integrity-scan.md) |
| PR129-VC-06 | Verify each converted rule slug: old-slug count → 0 (heading + dotted citations + `<group>-*` expansions); new-slug count == prior; held-back slugs explicitly listed so the residual is intentional | Manual | [10-validation.md §2 Grep-parity](10-validation.md#checks-run) — 5 slugs (`no-false-positives`→`confirmed-flow-only`, `no-context-leakage`→`isolated-context`, `no-reassignment`→`severities-inherited`, `no-analysis`→`dispatch-only`, `no-narration`→`synthesize-directly`); held-back list in [ap60-proposed-changes.md](ap60-proposed-changes.md) |
| PR129-VC-07 | Verify target-name non-collision pre-check passed for every rename, and `{old}` token sweep is clean for any renamed scalar that is also an artifact-name template token | Manual | [ap60-referential-integrity-scan.md](ap60-referential-integrity-scan.md) |
| PR129-VC-08 | Verify the TOON structure validator structure-validates the changed activities and the e2e walker passes the paths it traverses | Manual | [10-validation.md §1 TOON structure validation](10-validation.md#checks-run) — `scripts/validate-activities.ts`, 34 activities passed; walker/`validate-workflow-toon.ts` environment caveat in [10-validation.md Environment notes](10-validation.md#environment-notes-honest-record) |
| PR129-VC-09 | Verify result flags (`worktree_created` as a state var, `review_passed`, `validation_passed`, `*_confirmed`) were NOT mechanically re-prefixed (R-1 / IA-1 — out of scope) | Manual | [ap60-bare-identifier-audit.md](ap60-bare-identifier-audit.md) |

---

## Acceptance Criteria Matrix

Maps the [design-philosophy success criteria](02-design-philosophy.md#success-criteria) / gaps (G1–G5) to verification cases.

| Requirement (Gap) | Acceptance Criterion | Verifying Cases |
|-------------------|----------------------|-----------------|
| G1 — Convention defined | AP-60 present, four sub-rules, composes with AP family | PR129-VC-01 |
| G2 — Spec captures convention | §3.2/§3.4/§8 state it; cross-refs resolve | PR129-VC-02 |
| G3 — Audit heuristic exists | step-8 bullet present, affirmative-not-prefixed | PR129-VC-03 |
| G4 — Corpus conforms | binding defect closed; I/O ids + agreed rule slugs migrated; references intact | PR129-VC-04, VC-05, VC-06, VC-09 |
| G5 — No silent binding break | per-surface grep-parity + non-collision + token sweep + structure/e2e | PR129-VC-05, VC-06, VC-07, VC-08 |

---

## Running Tests

Confirmed grep-parity counts and the validator invocation that actually ran are recorded in [10-validation.md](10-validation.md). `validate-workflow-toon.ts` could not run on the reference checkout (missing `skill.schema.ts` on `main`); the lighter `validate-activities.ts` provided the equivalent structure signal — see [10-validation.md Environment notes](10-validation.md#environment-notes-honest-record).

```bash
# Structure validation that ran (validate-workflow-toon.ts unavailable on this checkout)
npx tsx scripts/validate-activities.ts   # 34 activities across work-package/prism/cicd — passed

# Regression (covers src/ only — advisory for this corpus change)
npm run typecheck                        # PASS (clean)
npm test                                 # PASS — 371 passed / 2 skipped / 0 failed
```
