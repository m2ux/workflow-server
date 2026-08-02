# Design Philosophy

> design-philosophy · Condition not met when gated checkpoints · #338 / #358 · PR #373 · 2026-08-02

## Problem Statement

Checkpoint dismissal via `respond_checkpoint` `condition_not_met` only accepts checkpoints that carry a structured `condition` field; checkpoints gated solely by an inline `when` expression cannot be dismissed and remain active when their gate is false. Activity-file rules cannot reference shared rule fragments the way workflow-level rules already can, so authors keep duplicating rule text. There is no automated guard for the AP-134 citation-grain defect (a technique citing a resource whole and also citing its sections). This work package continues open draft PR #373 to close those three server gaps so corpus migration and authoring can rely on one gate style, fragment refs in activity rules, and a hard-zero citation-grain check.

### System Context

| Component | Role |
|-----------|------|
| `respond_checkpoint` / session advance | Records checkpoint resolution; `condition_not_met` dismisses gated checkpoints |
| Activity schema (`when` / `condition`) | Step gates; agent-evaluated; structured `condition` is the legacy form that still owns dismissal |
| Workflow / activity rule loaders | Materialize fragment references into rule text |
| Guard suite (`check:all`) | Binding-fidelity, fragments, and (target) citation-grain hard-zero |
| Corpus workflows | Consumers of `when` gates, activity-rule fragments, and technique resource citations |
| PR #373 worktree | `feat/when-merge-rule-fragments-ap134-guard` at the session target path |

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High for workflow fidelity — false gates leave checkpoints hanging; Medium for authoring duplication and citation regression |
| Scope | Server schema, checkpoint tool path, activity rule loading, guard registration; unblocks corpus `when` migration |
| Business Impact | Reviews and migrations stay harder than needed; agents cannot treat `when` and `condition` as equivalent for dismissal; fragment and citation classes remain manual |

## Problem Classification

**Type:** Specific Problem

**Subtype:**
- [x] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [ ] Improvement goal
- [ ] Prevention goal

**Complexity:** Simple

**Rationale:** Root cause is named in schema copy and `respond_checkpoint` (`condition_not_met` requires `checkpoint.condition`). The PR bundles three coordinated deliverables with clear acceptance surfaces (tests, loader, hard-zero guard). Fix shape is specified on the PR body; no open product contradiction. User confirmed path via `skip-optional`, which sets complexity to simple for a well-defined issue needing no additional discovery. Multi-area touch remains, but the work is parity + refs + guard against a known baseline rather than architectural trade-off exploration.

## Workflow Path Decision

**Selected Path:** Direct to planning (skip optional discovery)

**Activities Included:**
- [ ] Requirements Elicitation
- [ ] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** User chose skip-optional at classification-and-path-confirmed. Problem and intended fix are stated on PR #373 and related issues (#338, #358); elicitation and research are off; optional discovery is skipped. Codebase comprehension remains mandatory before plan depth (`needs_comprehension: true`). Session is not in review mode (`is_review_mode: false`); issue creation was skipped (`issue_skipped: true`) with scope carried by the PR and linked issues.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Finish implementation on an open draft PR; branch currently holds an opening chore only relative to main |
| Technical | Work only in the provisioned worktree; do not edit server source unless a later activity explicitly requires it |
| Dependencies | Corpus migration PR waits on this server half; companion corpus items gated on schema/dismissal landing |
| Resources | Local worktree `2026-08-02-condition-not-met-when-gated-checkpoints`; planning under this folder |

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Dismissal parity | `condition_not_met` dismisses checkpoints gated by `when` and by structured `condition` | Both gate forms covered by tests |
| Activity-rule fragment refs | Activity-file rules accept and materialize the same fragment reference form as workflow rules | Loader + fragments guard treat activity rules as ref-capable |
| AP-134 citation-grain guard | Hard-zero guard flags technique that cites a resource whole and its sections in the same file | Registered in `check:all`; fixture coverage |
| Branch readiness | Implementation lands on PR #373 beyond the opening chore | Diff matches the three named deliverables |

## Notes

Branch at design-philosophy time shows a single opening chore commit (`chore(server): open work branch…`) relative to `main` — implementation is still pending. Later activities must measure the live worktree/PR diff against the PR claim set rather than assuming code has landed. Tracker #338 is primarily corpus backlog; server acceptance detail for this PR lives in the PR body and #358.
