---
name: readme-seed
description: Work-package planning-folder README seed profile — Progress inventory, classifier vocabulary, and mode-exclusion map for create-readme.
metadata:
  version: 1.3.0
---

# Work Package README Seed

Fill data for the planning-folder README. Layout and policy live in [Planning Folder README Guide](../../meta/resources/planning-readme.md) ([Template](../../meta/resources/planning-readme.md#template)).

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

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Start work package | Issue, branch, worktree, planning folder | 20-40m | ⬚ |
| 2 | [Design philosophy](02-design-philosophy.md) | Problem classification, workflow path | 15-30m | ⬚ |
| 3 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across activities | 10-15m | ⬚ |
| 4 | Codebase comprehension | Persistent knowledge under comprehension/ | 20-45m | ⬚ |
| 5 | [Requirements elicitation](03-requirements-elicitation.md) | Scope, success criteria, boundaries | 30-60m | ⬚ |
| 6 | [KB research](04-kb-research.md) | Knowledge-base and web synthesis | 20-45m | ⬚ |
| 7 | [Implementation analysis](05-implementation-analysis.md) | Baselines, gaps, measurement | 20-45m | ⬚ |
| 8 | [Work package plan](06-work-package-plan.md) | Tasks, estimates, dependencies | 20-45m | ⬚ |
| 9 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ |
| 10 | [Deferred items](deferred-items.md) | Out-of-scope deferral register | 5-10m | ⬚ |
| 11 | [Follow-ups](follow-ups.md) | In-task follow-ups register | 5-10m | ⬚ |
| 12 | Assumptions review | Converge open assumptions | 20-40m | ⬚ |
| 13 | Implementation | Code changes per plan | 1-4h | ⬚ |
| 14 | [Provenance log](08-provenance-log.md) | Per-task AI-assistance provenance | 5-15m | ⬚ |
| 15 | Lean-coding audit | Ponytail lean lens on the change | 15-30m | ⬚ |
| 16 | [Code review](09-code-review.md) | Consolidated review findings home | 15-30m | ⬚ |
| 17 | [Lean change](09-lean-change.md) | Applied lean simplifications record | 10-20m | ⬚ |
| 18 | Post-implementation review | Quality review before validation | 30-60m | ⬚ |
| 19 | [Change block index](10-change-block-index.md) | Indexed diff hunks for review | 5-10m | ⬚ |
| 20 | [Code review method](10-code-review-method.md) | What the code review walked and swept | 5-10m | ⬚ |
| 21 | [Test suite review](10-test-suite-review.md) | Test quality and coverage | 10-20m | ⬚ |
| 22 | [Test suite review method](10-test-suite-review-method.md) | Suite baseline, coverage map, sweeps | 5-10m | ⬚ |
| 23 | [Structural analysis](10-structural-analysis.md) | Prism L12 when written standalone | 15-30m | ⬚ |
| 24 | [Architecture summary](10-architecture-summary.md) | Stakeholder architecture overview | 15-30m | ⬚ |
| 25 | Validation | Build, test, lint verification | 15-30m | ⬚ |
| 26 | [Strategic review](12-strategic-review-1.md) | Scope/minimality series (`strategic-review-{n}`) | 15-30m | ⬚ |
| 27 | [Strategic review method](12-strategic-review-1-method.md) | Scope, conformance, minimality and delivery passes | 5-10m | ⬚ |
| 28 | Submit for review | PR review lifecycle / stealth push | 30-60m | ⬚ |
| 29 | [Close-out](14-COMPLETE.md) | Deliverables, limitations, retrospective; ADR when owed | 10-20m | ⬚ |
| 30 | [Token usage](14-token-usage.md) | Session token and cost summary | 5-10m | ⬚ |
| 31 | [Session trace](14-session-trace.md) | Lean mechanical execution trace | 5-10m | ⬚ |

Rows run in the order the activities execute, which is the order a reader watches them complete in. Codebase comprehension therefore sits third, between design philosophy and requirements elicitation, though its artifact prefix is the highest of the set — the prefix follows the definition file, the row follows the run.

Link targets are minted filenames per [Item cell](../../meta/resources/planning-readme.md#item-cell). Deferred items and Follow-ups are the cross-activity registers, minted by whichever activity defers or logs first and therefore unprefixed.

Initial Status icons are from [Status vocabulary](../../meta/resources/planning-readme.md#status-vocabulary). Prior feedback triage starts as cancelled/N/A in the implement/create seed (review-only).

## Row ownership

Which activity owns which rows, per [row-ownership map](../../meta/resources/planning-readme.md#row-ownership-map). Values are Item labels.

| @ | Rows |
|---|------|
| 01 | Start work package |
| 02 | Design philosophy · Assumptions log |
| 03 | Requirements elicitation |
| 04 | KB research |
| 05 | Implementation analysis |
| 06 | Work package plan · Test plan · Deferred items · Follow-ups |
| 07 | Assumptions review |
| 08 | Implementation · Provenance log |
| 09 | Lean-coding audit · Code review · Lean change |
| 10 | Post-implementation review · Change block index · Code review method · Test suite review · Test suite review method · Structural analysis · Architecture summary |
| 11 | Validation |
| 12 | Strategic review · Strategic review method |
| 13 | Submit for review |
| 14 | Close-out · Token usage · Session trace |
| 15 | Codebase comprehension |

## Mode exclusion map

Mode key: `{is_review_mode}` (boolean).

### Implement / create (`is_review_mode` false)

Leave Progress Status as authored in [Progress inventory](#progress-inventory) (review-only rows already cancelled/N/A; optional-path rows stay pending).

### Review (`is_review_mode` true)

Set cancelled/N/A on the rows owned by `03`, `04`, and `08`. Do not overwrite unrelated pending / in-progress / complete cells.
