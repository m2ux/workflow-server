# Design Philosophy

> design-philosophy · Condition not met when gated checkpoints · #338 Corpus backlog unfinished work / PR #373 · 2026-08-01

## Problem Statement

Checkpoint dismissal via `respond_checkpoint` `condition_not_met` only accepts checkpoints that carry a structured `condition` field; checkpoints gated solely by the preferred inline `when` expression cannot be dismissed and remain active when their gate is false. Activity-file rules cannot reference shared rule fragments the way workflow-level rules already can, so authors keep duplicating rule text. There is no automated guard for the AP-134 citation-grain defect (a technique citing a resource whole and also citing its sections). This work package reviews open PR #373, which is meant to close those three server gaps so the corpus migration and authoring path can rely on one gate style, fragment refs in activity rules, and a hard-zero citation-grain check.

### System Context

| Component | Role |
|-----------|------|
| `respond_checkpoint` / session advance | Records checkpoint resolution; `condition_not_met` dismisses gated checkpoints |
| Activity schema (`when` / `condition`) | Step gates; agent-evaluated; schema marks structured `condition` as legacy except for dismissal |
| Workflow / activity rule loaders | Materialize fragment references into rule text |
| Guard suite (`check:all`) | Binding-fidelity, fragments, and (target) citation-grain hard-zero |
| Corpus workflows | Consumers of `when` gates, activity-rule fragments, and technique resource citations |
| PR #373 worktree | `feat/when-merge-rule-fragments-ap134-guard` under the session target path |

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

**Complexity:** Moderate

**Rationale:** Root cause is named in schema copy and `respond_checkpoint` (`condition_not_met` requires `checkpoint.condition`). The PR bundles three coordinated deliverables (dismissal parity, activity-rule fragment refs, AP-134 guard) with clear acceptance surfaces (tests, loader, hard-zero guard). Not a greenfield product problem; review-mode work package against an open implementation PR. Multi-area touch (tools, schema, guards) keeps complexity above simple single-site fix.

## Workflow Path Decision

**Selected Path:** Direct to planning (skip optional discovery) — review mode

**Activities Included:**
- [ ] Requirements Elicitation
- [ ] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** `is_review_mode` is true for PR #373. Problem and intended fix are stated on the PR and linked issues (#338, #358); no requirements discovery or external research path is warranted. Codebase comprehension remains mandatory before plan/review depth. Elicitation is forced off by the review-mode path action; research and optional discovery stay skipped.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Review and disposition of an open PR; implementation may still be pending on the branch |
| Technical | Work only in the provisioned worktree; do not edit server source unless a later activity explicitly requires it |
| Dependencies | Corpus migration PR waits on this server half; companion corpus items gated on schema/dismissal landing |
| Resources | Local worktree `2026-08-01-when-merge-rule-fragments-ap134-guard`; planning under this folder |

## Success Criteria

Success criteria: recorded in review close-out and implementation-analysis measurements once those artifacts exist. For this classification gate: (1) design philosophy and assumptions log committed under the planning folder; (2) path gates set for review (`needs_elicitation` false, comprehension on); (3) subsequent activities can judge PR #373 readiness against the three named deliverables.

## Notes

Branch currently shows an opening chore commit only relative to `main` at ingest — implementation may still be pending; review activities must verify diff content against the PR claim set rather than assuming code has landed.
