# Test Suite Review — Issue #128: Canonical Identifier Naming Convention

**Work Package:** Issue #128
**Branch:** `chore/128-canonical-naming-convention` vs `main`
**PR:** [#129](https://github.com/m2ux/workflow-server/pull/129) (draft)
**Reviewer:** post-impl-review (automated test-suite review)
**Date:** 2026-06-07
**Changed files:** 14 (1 in `docs/`, 13 in `workflows` submodule) — **no test source modified**

---

## Nature of the Change (coverage frame)

This is a **definition-corpus + documentation change with no runtime feature**. Per [test-plan.md](test-plan.md) and [05-implementation-analysis.md](05-implementation-analysis.md), the loader (`TechniqueSchema`, zod) validates structure only, and state-variable resolution is exact-string-match with no alias layer. The implication for testing is precise:

- **There is no new code path to unit-test.** Renames are in-place string substitutions inside already-validated TOON/markdown fields; AP-60 and the spec additions are prose.
- **`npm run typecheck` / `npm test` cover `src/` only** and would not catch a botched TOON rename — they are advisory regression checks here, not the guard.
- **The real guard is mechanical grep-parity** per renamed identifier (old occurrences → 0; new occurrences == prior old count; designator binds), backed by the TOON structure validator and the e2e walker.

Coverage is therefore assessed **relative to the change** (the renamed/added identifiers), not against absolute project coverage.

## Diff-Aware Coverage Map

`gitnexus_detect_changes` (scope=all) maps the diff to **0 affected execution flows** and **0 changed indexed symbols** belonging to this work package (the only symbols it sees are unrelated uncommitted `AGENTS.md`/`CLAUDE.md` edits in the main checkout). There is no changed-symbol set in the indexed TypeScript graph for which to find test callers — consistent with the change living entirely in `docs/` and the `workflows` submodule, neither of which is indexed code. No coverage gaps or stale-test update-candidates arise in the call graph.

## Verification Executed (the actual guard)

| Verification | Result |
|--------------|--------|
| PR129-VC-04 — `{lens-name}` → 0, `{lens_name}` binds | ✅ 0 kebab; 4 snake sites consistent across `01-structural-pass.toon`, `portfolio-analysis.md`, `orchestrate-prism.md`. Binding defect closed. |
| PR129-VC-05 — `squash_merge_available` → 0 functional; `squash_merge_supported` swept all surfaces | ✅ Old name: 1 occurrence, the AP-60 didactic defect example (intentional). New name: 13 occurrences across declaration + producer + all read/condition/context sites. Grep-parity holds. |
| PR129-VC-06 — 5 rule slugs converted; old slugs → 0 | ✅ 0 old slugs (no headings, no dotted citations); 5 new slugs present as `###` headings, bodies unchanged. |
| PR129-VC-01/02/03 — AP-60 + spec §3.2/§3.4/§8 + audit bullet present, cross-refs resolve | ✅ AP-60 is highest entry (60); "60 entries" count updated; cross-references to AP-42/52/55/57/59 and §3.2/§3.4/§8 all resolve. |
| Changed `.toon` files still parse | ✅ Inspected headers/fields of the 4 changed TOON files — well-formed; renames are in-place token substitutions within intact fields. |

## Test-Infrastructure Notes (not work-package defects)

- **TOON structure validator could not be run in this worktree.** `npx tsx scripts/validate-workflow-toon.ts` fails with `ERR_MODULE_NOT_FOUND` for `src/schema/skill.schema.js`, and `node_modules` is absent in the worktree. Both are **worktree environment/build-state artifacts** — the worktree has no installed deps and no compiled output, and the validator script references a `skill.schema` module not present on this branch. **Neither is caused by, nor touches, the #128 diff** (which modifies no `src/` and no `scripts/`). The structure preservation is instead confirmed by direct inspection: every change is an in-place substitution inside an already-valid field, so no structural invariant of the definitions is disturbed. This is recorded as an environment observation, not a finding against the work package.

## Anti-Pattern Scan

No test anti-patterns to assess — no tests were added or modified. The work package correctly **declined to author tests** for a change whose only failure mode (a silent designator mis-bind) is caught by grep-parity, not by any test the project's harness can express. This is the right call, not a coverage gap.

## Findings

No Critical, Major, or Minor findings.

### Informational

- **INFO-1 — No automated naming-grammar guard ships with the convention.** AP-60's enforcement is the human/agent-run `workflow-design` step-8 audit heuristic, not an executable check. This is a deliberate, documented design choice (see [structural-findings.md](09-structural-findings.md): the convention sits at the legibility pole of the legibility/verifiability trade). A future enhancement could add a lightweight grep/AST lint for the *shape* defects (negated stems, `_list`/`_status` suffixes) the heuristic enumerates — but the semantic obligation (affirmative *meaning*) is structurally unmechanizable and would remain author responsibility. Logged for the user's backlog triage; no fix required for this work package. (Severity: Informational.)

## Severity Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| Major | 0 |
| Minor | 0 |
| Nit | 0 |
| Informational | 1 |

**Test-suite outcome:** No findings at Minor or above. `needs_test_improvements` = **false**. The change correctly authors no tests; the mechanical grep-parity guard passes on every renamed identifier.
