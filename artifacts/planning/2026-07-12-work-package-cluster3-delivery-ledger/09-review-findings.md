# Over-Engineering Review — Cluster 3 Delivery Ledger

Lens: ponytail over-engineering taxonomy only. Correctness, security, and
performance are safety-floor concerns and out of scope here. Intensity: standard.

Scope: the 3 source files in commit `1c2d379f`
(`src/utils/delivery.ts`, `src/tools/resource-tools.ts`,
`src/tools/workflow-tools.ts`). Docs and tests reviewed for bloat but carry no
over-engineering findings (the 7 test cases are the required runnable check, not
bloat; safety floor).

## Findings

- src/tools/resource-tools.ts:L605-608: shrink `text` re-projects the technique a second time. `projectTechniqueToYaml(technique)` internally calls `projectTechnique(technique)`, which the branch already computed as `ordered` one line above. Replace `const text = projectTechniqueToYaml(technique)` with `const text = stringifyForResponse(ordered)` (drop the now-unused `projectTechniqueToYaml` import if no other caller remains in the file). Removes one redundant projection pass. -1 line.

## Not flagged (deliberately)

- `dedupTechniqueBlocks` + `DEDUP_BLOCKS` (delivery.ts): NOT yagni. The helper has two present concrete callers (get_technique full-branch and get_activity bundling), so the abstraction is earned per ladder rung 2/7 — extracting once for two sites beats duplicating the loop. The in-call `newDeliveries[key] === hash` idempotence check is a present need: get_activity dedups sibling bundled steps in one pass sharing one accumulator.
- C12 inline block (workflow-tools.ts): NOT yagni. Single call site, inlined directly rather than extracted — correct per ladder rung 7 (no abstraction before a second concrete case). Reuses the shared `contentHash`/`deliveredHash`/`recordDeliveries`/`unchangedMarker` helpers rather than hand-rolling.
- Comments: the long block comments explain WHY (CRITICAL blast-radius avoidance, advance-ordering constraint, channel isolation) — rationale, not narration. Not `delete`-able restatement under the taxonomy.
- C12 marker `note` field vs. bare `unchangedMarker` elsewhere: user-facing guidance string, not an over-engineering construct; left to safety-floor/clarity judgment, not this lens.

## Scoreboard

net: -1 line possible.

## Applied (simplification-apply-cycle, 1 iteration)

Checkpoint resolved `apply-simplifications`. The single finding was applied in
worktree commit `d55cae8d`:

- src/tools/resource-tools.ts L609: `text = projectTechniqueToYaml(technique)` → `text = stringifyForResponse(ordered)`, reusing the already-computed `ordered = projectTechnique(technique)`; dropped the now-unused `projectTechniqueToYaml` import. Byte-identical output (`projectTechniqueToYaml` ≡ `stringifyForResponse(projectTechnique(...))`), one fewer projection pass. net applied: **-1 line** (2 changed lines, net -1 counting the removed import token vs. added stringify call — the substantive saving is one eliminated projection).

Safety floor: intact — pure refactor, no validation/error-handling/security/required-behaviour touched. Runnable check `tests/reference-delivery.test.ts` green (29/29); `npm run typecheck` and `npm run build` clean.

Re-score after applying: no accepted-but-unapplied simplifications remain that hold the safety floor. `needs_simplification` → false; loop exits after 1 iteration.

Note on the full suite: 12 pre-existing failures (binding-fidelity / fragments / review-mode-gating / e2e snapshot + walk) are corpus/baseline drift guards tied to the worktree's `workflows` submodule pointer, NOT regressions from this edit — confirmed by re-running them with the change stashed (identical failures on base commit `1c2d379f`).
