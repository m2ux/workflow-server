# Assumptions Log

> Condition not met when gated checkpoints · #338 / PR #373 · updated 2026-08-01

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | The three PR #373 deliverables (condition_not_met for `when`, activity-rule fragment refs, AP-134 citation-grain guard) are the full review scope for this work package — PR title/body and README executive summary name exactly those three; no fourth deliverable is in scope for disposition. | Code: PR #373 body + planning README | Validated |
| DP-2 | Design Philosophy | Complexity Assessment | L | Complexity is moderate (multi-area server change) rather than complex (no open product contradiction; fix shape is specified) — schema already documents the legacy exclusivity; work is parity + refs + guard. | Agent: design-philosophy classify | Validated |
| DP-3 | Design Philosophy | Workflow Path | L | Review mode correctly skips elicitation and research; comprehension remains mandatory — `is_review_mode` true and user request is start WP for the PR URL. | Session variables + activity path action | Validated |
| DP-4 | Design Philosophy | Problem Interpretation | M | Linked tracker #338 is primarily corpus backlog; server acceptance detail for this PR lives in the PR body and #358 — reviewers should not expect #338 alone to carry server AC for the three items. | Code: issue #338 scope vs PR #373 body | Validated (gap noted for ticket completeness) |
| DP-5 | Design Philosophy | Problem Interpretation | M | Branch may still be pre-implementation (opening chore only at design-philosophy time) — review must measure the live worktree/PR diff, not the PR narrative alone. | Code: `git log origin/main..HEAD` shows single chore open commit at ingest | Validated |
| DP-6 | Design Philosophy | Ticket Completeness | M | Tracker #338 acceptance criteria and user stories do not enumerate the three server deliverables of PR #373; goal/scope for this review live primarily on the PR body and #358 — proceed with gaps noted unless ticket refactor is chosen. | User: refactor-ticket | Corrected: ticket_refactor_needed=true — update #338 (or companion) so server AC covers condition_not_met/`when` parity, activity-rule fragment refs, and AP-134 citation-grain guard |

## Open Assumptions

_None — DP-6 resolved at ticket-completeness (refactor-ticket)._

## Wrap-Up

6 assumptions at design-philosophy — DP-1–DP-5 validated; DP-6 corrected (ticket refactor required). Gaps remain tracked in the Log row for DP-6.
