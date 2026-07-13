# Strategic Review

> strategic-review · cluster 3 delivery ledger (#189) · `main` → `feat/189-cluster3-delivery-ledger` · 2026-07-13 · Agent

**Diff:** 6 files, +367 / -29 (three-dot against `main`, HEAD `a0e35c39`)

Lens: strategic / scope-vs-issue-fit — does the change fully and appropriately address the C2 + C12 design-spec scope, with no scope creep and no strategic gaps? The over-engineering / minimality lens was applied separately by the lean-coding audit ([09-review-findings.md](09-review-findings.md), net −1 line applied in `d55cae8d`); it is not re-litigated here.

## Findings Summary

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Investigation Artifacts | 0 | — |
| Over-Engineering | 0 | — |
| Orphaned Infrastructure | 0 | — |
| **Total** | **0** | |

No strategic findings. All changes map to a design-spec deliverable and a plan task.

## Scope Assessment

All changes in scope — minimal and focused. Every changed file maps to a plan task ([06-work-package-plan.md](06-work-package-plan.md)) and a design-spec deliverable ([design spec](../2026-07-12-workflow-design-cluster3-delivery-ledger/06-design-spec.md)):

| File | Plan task | Deliverable |
|------|-----------|-------------|
| `src/utils/delivery.ts` | Task 1 | C2 `dedupTechniqueBlocks` + `DEDUP_BLOCKS` + key-namespace header |
| `src/tools/resource-tools.ts` | Task 2 | C2 `get_technique` full-branch wire-in |
| `src/tools/workflow-tools.ts` | Tasks 3, 4 | C2 `get_activity` eager-bundle wire-in + C12 ops-bundle slimming |
| `tests/reference-delivery.test.ts` | Task 5 | 9 new cases (C2 marker/cross-technique/escape/fresh-mode + channel-key + C12) |
| `docs/api-reference.md` | Task 6 | block-level delivery + C12 notes |
| `site/api/tools.html` | Task 6 | build-regenerated from `get_technique`/`get_activity` description trims |

**No scope creep.** The spec's five explicit deferrals are all respected — the diff touches none of: `projectTechnique` (CRITICAL blast radius), eager-budget accounting of block savings, C12 per-technique cross-channel reuse, schema files (`technique`/`session`/`state`), or the empirical re-walk. The one adjacent edit — refreshing the stale `bundle:rules` header line to `bundle:rules:<hash>` — was pre-authorised as "small, in-scope" in design spec §5.

**No strategic gap.** Both design-approval open items (spec §8) are honoured: the C2 block set is contract + rules only (not protocol/core), and C12 uses a single content-keyed `workflow_bundle:<hash>` key rather than the more aggressive per-technique cross-channel reuse. The projected ~+13% (C2) / C12 resume-delta measurement is a documented post-merge validation note (spec §7), a deliberate deferral rather than an omitted requirement.

**Orphan check.** Both introduced symbols have live consumers in the same commit: `dedupTechniqueBlocks` (two callers — `get_technique` full-branch and `get_activity` eager bundle) and `DEDUP_BLOCKS` (consumed inside the helper). No introduced-but-unreferenced symbols. (GitNexus orphan-scan not run against the branch: the index predates these not-yet-merged symbols; verified by direct diff inspection instead.)

## PR Body Conformance

| Finding | Detail |
|---------|--------|
| Stale "coming next" framing | PR [#223](https://github.com/m2ux/workflow-server/pull/223) Changes section is headed **"Implementation (coming next):"** — written when the PR was opened ahead of the impl commits. All code is now committed (`1c2d379f` + `d55cae8d` + `a0e35c39`); the future-tense framing misdescribes the change as pending. Recommend re-tensing to present and ticking the submission checklist (backward-compatible, self-reviewed, docs updated) during the update-PR / submit step. Body structure (Summary, Motivation, Changes, checklist, engineering + issue links) otherwise conforms. Minor — cosmetic body accuracy, addressed at PR-update time; no code impact. |

## Minimality Assessment

All 5 minimality checks pass. Every changed file is necessary; every added line supports C2 or C12 (helper, two wire-ins, C12 block, tests, docs); no new dependencies (no `package.json` change); no configuration changes.

## Changes Folder

The target repository (`workflow-server`) has no root `changes/` folder — it uses the PR-checklist "change file, or skipped for this reason" convention instead. No changelog fragment created or required (`fragment_references_issue = null`; the `verify-fragment` validate action passes trivially).

## Review Result

**Outcome:** Passed — clean review.

**Rationale:** The change fully and appropriately addresses the C2 + C12 design-spec scope. It is additive, semver-minor, no schema change, and byte-for-byte invariant for fresh/default sessions and dispatched workers. All spec deliverables are present, all five deferred items are respected, and both design-approval open items are honoured. No investigation artifacts, over-engineering, orphaned infrastructure, or scope creep. The sole observation is a cosmetic PR-body tense ("coming next") to correct at PR-update time — not a code or scope finding. The known pre-existing `binding-fidelity` baseline drift is independent of this change and tracked as a separate follow-up.

**Next Step:** Proceed to `submit-for-review`.
