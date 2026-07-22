---
name: readme-seed
description: Work-package planning-folder README seed profile — Progress inventory, classifier vocabulary, and mode-exclusion map for create-readme.
metadata:
  version: 1.0.0
---

# Work Package README Seed

Fill data for [create-readme](../../meta/techniques/workflow-engine/create-readme.md). Layout and policy live in [Planning Folder README Guide](../../meta/resources/planning-readme.md) ([Template](../../meta/resources/planning-readme.md#template)).

## Classifier

Header-line kind labels: `Feature`, `Bug-Fix`, `Enhancement`, `Refactor`.

Lifecycle **Status** values: `Planning`, `Ready`, `In Progress`, `Complete`.

## Links defaults

| Resource | Link shape |
|----------|------------|
| Jira Ticket | `[PROJ-N](https://{jira_host}/browse/PROJ-N)` |
| Parent Epic | `[PROJ-N](https://{jira_host}/browse/PROJ-N) — [Epic title]` |
| PR | `[#N](https://{repo_host}/{org}/{repo}/pull/N)` |

## Progress inventory

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Start work package | Issue, branch, worktree, planning folder | 20-40m | ⬚ |
| 2 | 01 | [Prior feedback triage](prior-feedback-triage.md) | Review-mode prior feedback ingest | 15-30m | ⊘ |
| 3 | 02 | [Design philosophy](design-philosophy.md) | Problem classification, workflow path | 15-30m | ⬚ |
| 4 | 02 | [Assumptions log](assumptions-log.md) | Tracked assumptions across activities | 10-15m | ⬚ |
| 5 | 03 | [Requirements elicitation](requirements-elicitation.md) | Scope, success criteria, boundaries | 30-60m | ⬚ |
| 6 | 04 | [KB research](kb-research.md) | Knowledge-base and web synthesis | 20-45m | ⬚ |
| 7 | 05 | [Implementation analysis](implementation-analysis.md) | Baselines, gaps, measurement | 20-45m | ⬚ |
| 8 | 06 | [Work package plan](work-package-plan.md) | Tasks, estimates, dependencies | 20-45m | ⬚ |
| 9 | 06 | [Test plan](test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ |
| 10 | 06 | [Deferred items](deferred-items.md) | Out-of-scope deferral register | 5-10m | ⬚ |
| 11 | 06 | [Follow-ups](follow-ups.md) | In-task follow-ups register | 5-10m | ⬚ |
| 12 | 07 | Assumptions review | Converge open assumptions | 20-40m | ⬚ |
| 13 | 08 | Implementation | Code changes per plan | 1-4h | ⬚ |
| 14 | 08 | [Provenance log](provenance-log.md) | Per-task AI-assistance provenance | 5-15m | ⬚ |
| 15 | 09 | Lean-coding audit | Ponytail lean lens on the change | 15-30m | ⬚ |
| 16 | 09 | [Code review](code-review.md) | Consolidated review findings home | 15-30m | ⬚ |
| 17 | 09 | [Debt ledger](debt-ledger.md) | Harvested ponytail debt markers | 10-20m | ⬚ |
| 18 | 09 | [Lean change](lean-change.md) | Applied lean simplifications record | 10-20m | ⬚ |
| 19 | 10 | Post-implementation review | Quality review before validation | 30-60m | ⬚ |
| 20 | 10 | [Change block index](change-block-index.md) | Indexed diff hunks for review | 5-10m | ⬚ |
| 21 | 10 | [Test suite review](test-suite-review.md) | Test quality and coverage | 10-20m | ⬚ |
| 22 | 10 | [Structural analysis](structural-analysis.md) | Prism L12 when written standalone | 15-30m | ⬚ |
| 23 | 10 | [Architecture summary](architecture-summary.md) | Stakeholder architecture overview | 15-30m | ⬚ |
| 24 | 11 | Validation | Build, test, lint verification | 15-30m | ⬚ |
| 25 | 12 | [Strategic review](strategic-review-1.md) | Scope/minimality series (`strategic-review-{n}`) | 15-30m | ⬚ |
| 26 | 13 | Submit for review | PR review lifecycle / stealth push | 30-60m | ⬚ |
| 27 | 14 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, limitations, retrospective; ADR when owed | 10-20m | ⬚ |
| 28 | 14 | [Token usage](token-usage.md) | Session token and cost summary | 5-10m | ⬚ |
| 29 | 14 | [Session trace](session-trace.md) | Lean mechanical execution trace | 5-10m | ⬚ |
| 30 | 15 | Codebase comprehension | Persistent knowledge under comprehension/ | 20-45m | ⬚ |

Initial Status icons are from [Status vocabulary](../../meta/resources/planning-readme.md#status-vocabulary). Row 2 starts as cancelled/N/A in the implement/create seed (review-only).

## Mode exclusion map

Mode key: `{is_review_mode}` (boolean).

### Implement / create (`is_review_mode` false)

Leave Progress Status as authored in [Progress inventory](#progress-inventory) (review-only rows already cancelled/N/A; optional-path rows stay pending).

### Review (`is_review_mode` true)

Set cancelled/N/A on rows whose `@` is `03`, `04`, or `08`. Flip Item containing `prior-feedback` (`@` `01`) from cancelled/N/A to pending. Do not overwrite unrelated pending / in-progress / complete cells.
