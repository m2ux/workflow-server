# Assumptions Log

> Condition not met when gated checkpoints · #338 / #358 · PR #373 · updated 2026-08-02

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | The three PR #373 deliverables (condition_not_met for `when`, activity-rule fragment refs, AP-134 citation-grain guard) are the full implementation scope for this work package — PR title/body name exactly those three; no fourth deliverable is in scope. | Code: PR #373 body Summary + Changes sections | Validated |
| DP-2 | Design Philosophy | Complexity Assessment | L | User-confirmed path sets complexity simple (skip-optional) for a well-defined three-item parity/guard package — multi-area touch exists but fix shape is specified and solution patterns are known. | User: classification-and-path-confirmed / skip-optional | Confirmed |
| DP-3 | Design Philosophy | Workflow Path | L | Skip-optional correctly turns off elicitation and research while comprehension stays mandatory — path effects match bag (`needs_elicitation` false, `needs_research` false, `skip_optional_activities` true, `needs_comprehension` true). | Session bag after checkpoint replay + determine-path | Validated |
| DP-4 | Design Philosophy | Problem Interpretation | M | Linked tracker #338 is primarily corpus backlog; server acceptance detail for this PR lives in the PR body and #358 — planners should not expect #338 alone to carry server AC for the three items. | Code: issue #338 scope (workflows submodule) vs PR #373 body | Validated (gap noted; issue_skipped so no ticket-completeness gate) |
| DP-5 | Design Philosophy | Problem Interpretation | M | Branch is pre-implementation (opening chore only at design-philosophy time) — plan and analysis must measure the live worktree/PR diff, not the PR narrative alone. | Code: `git log origin/main..HEAD` shows single chore open commit | Validated |
| DP-6 | Design Philosophy | Workflow Path | L | Session is not review mode (`is_review_mode` false) with `issue_skipped` true — ticket-completeness steps are gated off; fresh-start path is intentional after user chose Start fresh. | Session bag + discover-session checkpoint fresh | Validated |
| PL-1 | Planning | Design Approach | L | Present-gate predicate is `condition` OR non-empty `when` without server-side expression evaluation — matches PR intent and comprehension rejected-paths table. | Code: comprehension Q8 + workflow-tools presence model | Validated |
| PL-2 | Planning | Design Approach | M | Activity-rule refs need typed materialize **and** raw get_activity rewrite — checkpoint dual path is the precedent; typed-only would leave workers seeing `{ ref }`. | Code: injectCheckpointFragmentBodies vs materializeActivityFragments | Validated |
| PL-3 | Planning | Task Breakdown | L | Three deliverable-shaped commits (dismissal, activity-rule refs, citation guard) keep PR reviewable and match three acceptance surfaces. | Plan task grain | Validated |
| PL-4 | Planning | Test Strategy | L | Corpus has 0 when-only checkpoints and 0 bare+section co-cites — tests/fixtures must supply positive cases; green corpus is expected after guard lands. | Code: worktree YAML/technique scan 2026-08-02 | Validated |
| PL-5 | Planning | Scope Decisions | L | Corpus when-migration and full AP-134 prose detect stay out of this package — server half only. | Deferred-items D-1, D-2 | Validated |
| PL-6 | Planning | Dependency Assumptions | M | Host gh/GPG may be unavailable in sandboxed workers — implement/submit use full host permissions; planning does not block on PR API. | Env: gh auth / gpg-agent failures this activity | Validated (process constraint) |

## Wrap-Up

12 assumptions — all validated or confirmed. No open stakeholder-dependent residue.
