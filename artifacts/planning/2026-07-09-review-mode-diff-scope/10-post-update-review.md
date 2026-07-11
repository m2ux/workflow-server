# Post-Update Review — Review-Mode Diff-Scope Fix

**Session:** HS4VHZ · **Workflow:** workflow-design · **Activity:** post-update-review
**Date:** 2026-07-09 · **Mode:** UPDATE · **Target:** `work-package` (v3.25.0 → 3.26.0)
**Committed state audited:** commit `166eae73` on `workflow/203-review-diff-scope`
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-09-review-mode-diff-scope`
**PR:** [#204](https://github.com/m2ux/workflow-server/pull/204) (draft) · 8 files, +67/−23

---

## Verdict

The committed update is **substantially clean** but carries **one new Medium compliance finding** (AP-58 unbound protocol-local in `review-scope.md`). The documentation-voice re-screen is **CLEAN**. All mechanical guards pass. Scope discipline is clean (committed files exactly match the confirmed scope manifest).

## Findings summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 0 |

### F-PU1 (Medium) — AP-58 unbound protocol-local `{$base_branch}` in `review-scope.md`

- **File:** `work-package/techniques/strategic-review/review-scope.md`
- **Location:** Protocol step 1 (lines 39, 40, 44) — reads `{$base_branch}` in prose and in `git diff {$base_branch}...HEAD`.
- **Defect:** `{$base_branch}` is a step-local sigil that is **read but never produced**. No protocol step binds `{$base_branch}`, and `base_branch` is not a declared Input (Inputs are `branch_name`, `requirements`, `changed_files`, `pr_number`). It is also not an ambient value — absent from the `strategic-review` group root `TECHNIQUE.md`, from `workflow.yaml` variables, and from any `set` at activity 12. This is an AP-58 **unbound local**.
- **Why mechanical guards missed it:** `check-binding-fidelity.ts` treats any `$`-prefixed token as a valid step-local producer form and does not verify a `$`-local is produced before it is read. That produce-before-read/existence check is exactly the AP-58 audit heuristic, not the mechanical baseline. So binding-fidelity is green (0 new drift) while AP-58 still flags.
- **Contrast:** `review-diff.md` introduces the same `{$base_branch}` correctly — its step 1 produces it (`Identify the base branch ({$base_branch}) as the PR's target branch: gh pr view {pr_number} --json baseRefName ...`) before the reads. `review-scope.md` reproduces the reads with only a parenthetical gloss ("the PR's target branch"), omitting the resolving step.
- **Recommended fix (adopt the review-diff pattern):** add a producing bullet in review-scope step 1 that binds `{$base_branch}` from the PR target — `Resolve the base branch {$base_branch} as the PR's target branch: gh pr view {pr_number} --json baseRefName --jq .baseRefName` — placed before the diff commands (`pr_number` is already a declared input). Alternatively declare `base_branch` as an Input and read it as `{base_branch}`; the producing-step form is preferred for parity with `review-diff` / `review-baseline-state`.

## Audit passes

| Pass | Result |
|------|--------|
| Documentation-voice re-screen (added criterion) | **CLEAN** — mandated marker scan returns no hits; broadened evolution-marker scan yields only false positives ("used to read/resolve/enforce" = verb, not "used to [do X]") |
| Expressiveness (prose-vs-construct) | CLEAN — all edits use inputs/outputs/rules/protocol constructs; no ordered-procedure prose added to any activity/step `description` |
| Conformance (reference conventions) | CLEAN — version bumps `X.Y.Z`, minor bumps proportionate; `findings-constraint` rule byte-identical across the three techniques that carry it |
| Rule-to-structure | CLEAN — `findings-constraint` is a review-discipline rule (agent-enforced by nature, no structural gate applicable); consistent with existing review-mode rules |
| Anti-pattern | **1 finding (F-PU1, AP-58)**. Otherwise clean: AP-55 (snake symbols / kebab rule-names), AP-49/59 (designators braced, CLI backticked), AP-60 (rule slug `findings-constraint` assertive; `changed_files` correct plural collection; `pr_number`/`base_pr_diff` fine) |
| Schema validation | CLEAN — worktree `work-package` reports version 3.26.0; all 15 activity YAMLs + workflow.yaml valid; `check-all-refs` 0 unresolved; `check-binding-fidelity` 268 baselined, 0 NEW |

## Scope-discipline audit (`scope_drift_findings`)

**CLEAN — no drift.** The committed diff touches exactly the 8 files in the confirmed scope manifest (`06-scope-manifest.md`):

1. `techniques/review-baseline-state.md` (1.0.0 → 1.1.0)
2. `techniques/strategic-review/review-scope.md` (1.1.0 → 1.2.0)
3. `techniques/review-diff.md` (1.1.0 → 1.2.0)
4. `techniques/review-code.md` (2.0.0 → 2.1.0)
5. `techniques/review-test-suite.md` (2.0.0 → 2.1.0)
6. `techniques/review-summary.md` (1.1.0 → 1.2.0)
7. `resources/review-mode.md` (1.4.0 → 1.5.0)
8. `workflow.yaml` (3.25.0 → 3.26.0)

No file changed outside the manifest; no manifest item left unaddressed. No activity YAML touched (confirmed: `review-baseline-state` binds bare-string at activity 05, `pr_number` resolves by same-name from the `review-mode-detection` output produced at activity 01 — no `step.technique.inputs` deviation needed).

## Producer→consumer binding verification (core of the change)

- `review-baseline-state` declares `changed_files` as an Output; the review-path consumers (`review-code`, `review-test-suite`, `review-scope`, `review-summary`) declare `changed_files` as an Input → resolves by implicit same-name binding, no per-call rename. ✅
- `pr_number` is a declared Output of `review-mode-detection` (activity 01, review path); `review-baseline-state`, `review-diff`, and `review-scope` add it as an Input and it lands by same-name binding well before activity 05/10/12. ✅
- `base_pr_diff` retained and repurposed to the corrected three-dot range; no signature deletion (`has_unflagged_removals = false`). ✅

## New compliance debt introduced by the update

- **1 Medium (F-PU1).** Everything else in the change is additive and conformant.

---

*Snapshot of committed state at `166eae73`. Compare future audits of `work-package` review-mode techniques against this baseline.*
