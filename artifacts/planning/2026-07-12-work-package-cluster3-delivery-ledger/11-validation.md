# Validation — Cluster 3 Delivery Ledger (#189)

> **Activity:** validate · **Branch:** `feat/189-cluster3-delivery-ledger` · **HEAD:** `a0e35c39` · **Base:** `0ea367b9` · **PR:** [#223](https://github.com/m2ux/workflow-server/pull/223)
> Change commits: `1c2d379f` (impl) + `d55cae8d` (lean shrink) + `a0e35c39` (post-review fixes).

## Verdict: **PASS**

The C2 block-level delivery ledger and C12 `get_workflow` ops-bundle slimming are validated against the design spec's acceptance criteria and the test plan. Typecheck, build, and the authoritative functional suite are all green. The single full-suite failure is confirmed pre-existing baseline drift, independent of this change (evidence below).

## Gates run (target worktree)

Path: `/home/mike1/projects/work/workflow-server/2026-07-12-work-package-cluster3-delivery-ledger`

| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | ✅ exit 0, clean |
| Build | `npm run build` (`tsc`) | ✅ exit 0, clean |
| Functional (authoritative) | `vitest run tests/reference-delivery.test.ts` | ✅ **30 / 30 passed** |
| Full suite | `vitest run` | 564 passed, 14 skipped, **1 failed** (baseline — see below) |

Project type is `other` (Node/TypeScript); the activity's `rust-substrate`-gated steps (`preflight`, `run-suite`, and the fix/revalidate cargo loop) do not apply. `is_review_mode=false`, so the review-mode steps (`document-failures`, `assess-test-coverage`, `triage-reported-failures`) are also inactive. Validation therefore ran the Node/TS equivalents (typecheck + build + vitest).

## Acceptance-criteria coverage (test plan `06-test-plan.md`)

Every acceptance criterion maps to passing test cases in `tests/reference-delivery.test.ts`:

| Requirement | Criterion | Tests | Status |
|-------------|-----------|-------|--------|
| C2 block-level dedup | Already-delivered contract/rules blocks collapse to markers; core stays full | `block-level delivery ledger (C2)` › collapses…blocks to markers; records `technique:<block>:<hash>`; helpers `recordDeliveries`/`unchangedMarker`/`contentHash` | ✅ |
| Escape path | `full:true` / `bundle:"full"` re-delivers every block full | `full: true re-delivers every block full`; `get_activity` eager-bundle collapse test (bundle path) | ✅ |
| Fresh-mode invariance | Fresh/default sessions never markered | `fresh mode never markers blocks` | ✅ |
| C12 ops-bundle slimming | Ops bundle collapses on resume under persistent; full in fresh | `get_workflow ops-bundle slimming (C12)` › collapses on second call; never markers in fresh; records `workflow_bundle:<hash>` | ✅ |
| No regression | Existing dedup cases green; snapshots structurally unchanged | Whole-technique / whole-bundle B1 cases (same file, all green); binding-provenance snapshots unchanged | ✅ |

TEST-1 (the `get_activity` eager-bundle instance of `dedupTechniqueBlocks`) was the one coverage gap found in test-suite review; it was closed in fix commit `a0e35c39`, taking the suite from 29→30 green. Confirmed present: `collapses shared blocks inside get_activity eager step_techniques entries`.

## Baseline failure — confirmed NOT caused by this change

**Failing test:** `tests/binding-fidelity.test.ts › binding-fidelity drift guard › introduces no NEW binding-fidelity violations beyond the baseline` (1 violation over baseline).

**The single "new" violation:**
```
[dead-output] workflow-design/techniques/derive-design-dimensions.md —
output 'design_dimensions' is declared but nothing outside its own file consumes it …
```

**Root cause — `workflows` submodule pointer drift:**

| | Commit | Notes |
|---|--------|-------|
| Committed `workflows` pointer (at HEAD **and** base) | `05d1f812` | The baseline fixture was captured against this. |
| Working-tree `workflows` checkout (drifted, `+` in `submodule status`) | `1e25e5ee` | `v0.26.0-40-g1e25e5ee`, +40 commits; includes PR #220 `workflow-design-self-review` (v1.7.0) where `derive-design-dimensions.md` lives. |

The binding-fidelity guard reads the **checked-out** working-tree workflows content (`1e25e5ee`), but the committed baseline was snapshotted against the committed pointer (`05d1f812`). The drift alone produces the one extra violation.

**Independence proof (this WP's three commits vs. the failure):**

- `git diff --name-only 0ea367b9..HEAD` touches only: `docs/api-reference.md`, `site/api/tools.html`, `src/tools/resource-tools.ts`, `src/tools/workflow-tools.ts`, `src/utils/delivery.ts`, `tests/reference-delivery.test.ts`.
- The change touches **none** of: `tests/binding-fidelity.test.ts`, `scripts/check-binding-fidelity.ts`, any baseline fixture, any `workflow-design/` content, or the `workflows` submodule pointer.
- `git diff 0ea367b9..HEAD -- workflows` is **empty** — the committed pointer is byte-identical at base and HEAD. Therefore the failure reproduces identically on the clean base commit `0ea367b9`; it is orthogonal to this change.

**Disposition:** Per the WP's known-baseline guidance, the committed baseline regen (262→254, reconciling to the current `workflows` tip) is a **separate, already-tracked follow-up** — deliberately out of scope for this WP. No baseline regeneration performed. No action taken in the target worktree.

## Prior-review findings status (folded in)

- Code review (`10-code-review.md`): 0 Critical/Major/Minor; 3 Informational (INFO-1..3), all no-action. Confirmed still accurate.
- Test-suite review (`10-test-suite-review.md`): TEST-1 (Minor) **resolved** in `a0e35c39`; TEST-2 (Nit) optional, not required. Induced `site/api/tools.html` staleness from description trims **resolved** via `npm run build:site` — `tests/site.test.ts` green in this run.

## Recommended next transition

`strategic-review` (the activity's default transition).
