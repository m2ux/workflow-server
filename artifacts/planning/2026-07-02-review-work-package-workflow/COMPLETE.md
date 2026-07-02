# Workflow Design: work-package — Complete

> Update · 2026-07-02

## Summary

Remediated the `work-package` workflow (v3.15.0 → **v3.16.0**) against 13 compliance findings (0 Critical, 2 High, 5 Medium, 6 Low) surfaced by a full-workflow review. All 13 were approved for fix and applied as a behavior-preserving pass: no activity, checkpoint, effect, condition, transition, or technique binding was removed — only anti-pattern narration was trimmed and two genuine binding gaps were closed. The committed state re-audited clean (0 new findings) with all three deterministic guards green.

## What Was Delivered

Framed as modifications against v3.15.0 (no files created or removed):

- **Activities (7 modified):** `01-start-work-package`, `02-design-philosophy`, `04-research`, `05-implementation-analysis`, `09-lean-coding-audit`, `10-post-impl-review`, `15-codebase-comprehension`
- **Techniques (3 modified):** `respond-to-pr-review.md` (H-1: jq token anchoring), `implement-task.md` (H-2: `target_symbol` producer + normalized reads), `create-issue.md` (RE-1: added `jira_project` input)
- **Resources:** none changed
- **Variables / rules:** `01-start-work-package.yaml` `jira-project-selection` options gained a load-bearing `setVariable: jira_project` (RE-1); `04-research.yaml` shed a value-less `declare-context-scope` set (M-2)
- **Root:** `workflow.yaml` version bump 3.15.0 → 3.16.0

## Design Decisions

Canonically recorded in the [assumptions log](assumptions-log.md) (RE-1, RE-2, RE-3) and the planning [README](README.md). Two carry design weight:

- **RE-1 (M-4 disposition)** — Instead of demoting the `jira-project-selection` checkpoint to a message, KEEP it as a real gate AND add a `jira_project` input to `create-issue` so the option's `setVariable` effect is consumed downstream. Impact analysis confirmed no existing consumer, so the input had to be added for the effect to be load-bearing. Alternative rejected: demote to `action: message` (would have removed a genuine user decision) or leave a bare dead `setVariable` (AP-82).
- **RE-2 (L-6 disposition)** — Leave the `review-received` polling checkpoint unchanged. Alternative rejected: demote to message + proceed — declined because the loop-back models a real external-state poll ("reviewer hasn't responded yet"); a demote would only be safe with run traces proving the waiting branch is never exercised, and that trace verification was deferred rather than assumed.

## Scope Outcome

All 11 manifest items delivered, no drift ([manifest](06-scope-and-draft.md)). The committed diff `35b35b86` touches exactly the 11 manifest files — no unplanned changes, no unaddressed items. `08-implement.yaml` was correctly excluded from L-3 (verified: no "during this phase" tail present).

## Known Limitations & Deferrals

<!-- Canonical home. Other artifacts link here; do not duplicate this list elsewhere. -->
- **RE-2 trace verification deferred** — the `review-received` gate was kept on the judgement that its waiting branch is real; a future trace audit could still justify a demote if runs prove the loop-back is never exercised.
- **No behavior-change validation beyond guards** — remediation correctness rests on the three deterministic guards (validator, refs, binding-fidelity) plus a fresh five-pass compliance re-audit; no runtime agent walk of v3.16.0 was performed this session.

## Lessons Learned

- The two open judgement calls (RE-1, RE-2) were both AP-82-family "does this checkpoint record anything" questions, and both resolved toward *preserving or adding* a structural record — consistent with the remediation's no-behavior-change purpose. A demote-first instinct would have been wrong for both.

## Workflow Retrospective

[messages: ~6 substantive user turns · session quality: Minor friction]

### Observations

<!-- One line per signal, only for categories that occurred. -->
- [process correction] Early in the run the orchestrator over-resolved several genuine design/decision checkpoints (RE-1, RE-2, fix-disposition) under delegated authority instead of surfacing them — corrected mid-run to present all genuine decision gates to the user while continuing to auto-resolve mechanical/deterministic gates. Root cause: the delegated-authority boundary between "internal technical checkpoint" and "material outward-facing decision gate" was applied too aggressively at the start.
- [decision] Fix-all disposition on 13 findings — user chose update mode over accept-as-is; clean, no friction.
- [clarification] RE-1 required an impact-analysis round-trip (interview → verify no `create-issue` consumer → user decision) before the "add `jira_project` input" resolution could be finalized — the initial "bare setVariable, fallback to demote" framing was superseded.
- [checkpoint anomaly] Bootstrap checkpoints (`resolve-target-repo-type-confirmed`, `resolve-target-submodule-selection`) fired and were answered as expected; no unexpected or defaulted checkpoints in the design phases.

### Recommendations

<!-- Prioritized, specific, actionable. -->
1. **High:** Orchestrator over-resolved design checkpoints early → tighten the delegated-authority guidance so AP-82-family disposition decisions (demote vs. keep vs. make-load-bearing) and mode/scope dispositions are always surfaced as decision gates, never self-resolved. This is orchestration-prompt guidance, not a `work-package` YAML change — the workflow's checkpoints behaved correctly; the issue was in how they were presented.
2. **Medium:** RE-1's resolution changed shape after impact analysis (demote-fallback → add-consumer) → when a checkpoint-necessity assumption depends on whether a downstream consumer exists, run the impact-analysis consumer check *before* presenting disposition options, so the user chooses among accurate branches rather than a framing that later gets superseded.

**Key takeaway:** The `work-package` workflow itself needs no further change from this session — the friction was in orchestration judgement (over-eager checkpoint self-resolution), which was caught and corrected mid-run.
**Action required:** no — the actionable item is orchestration-prompt guidance, not a workflow-definition change; no issue filed.
