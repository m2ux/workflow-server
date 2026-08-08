---
name: readme-seed
description: Work-package planning-folder README seed profile — Progress inventory, classifier vocabulary, and mode-exclusion map for create-readme.
metadata:
  version: 1.3.0
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

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Start work package | Issue, branch, worktree, planning folder | 20-40m | ⬚ |
| 2 | [Prior feedback triage](01-prior-feedback-triage.md) | Review-mode prior feedback ingest | 15-30m | ⊘ |
| 3 | [Design philosophy](02-design-philosophy.md) | Problem classification, workflow path | 15-30m | ⬚ |
| 4 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across activities | 10-15m | ⬚ |
| 5 | Codebase comprehension | Persistent knowledge under comprehension/ | 20-45m | ⬚ |
| 6 | [Requirements elicitation](03-requirements-elicitation.md) | Scope, success criteria, boundaries | 30-60m | ⬚ |
| 7 | [KB research](04-kb-research.md) | Knowledge-base and web synthesis | 20-45m | ⬚ |
| 8 | [Implementation analysis](05-implementation-analysis.md) | Baselines, gaps, measurement | 20-45m | ⬚ |
| 9 | [Work package plan](06-work-package-plan.md) | Tasks, estimates, dependencies | 20-45m | ⬚ |
| 10 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ |
| 11 | [Deferred items](deferred-items.md) | Out-of-scope deferral register | 5-10m | ⬚ |
| 12 | [Follow-ups](follow-ups.md) | In-task follow-ups register | 5-10m | ⬚ |
| 13 | Assumptions review | Converge open assumptions | 20-40m | ⬚ |
| 14 | Implementation | Code changes per plan | 1-4h | ⬚ |
| 15 | [Provenance log](08-provenance-log.md) | Per-task AI-assistance provenance | 5-15m | ⬚ |
| 16 | Lean-coding audit | Ponytail lean lens on the change | 15-30m | ⬚ |
| 17 | [Code review](09-code-review.md) | Consolidated review findings home | 15-30m | ⬚ |
| 18 | [Debt ledger](09-debt-ledger.md) | Harvested ponytail debt markers | 10-20m | ⬚ |
| 19 | [Lean change](09-lean-change.md) | Applied lean simplifications record | 10-20m | ⬚ |
| 20 | Post-implementation review | Quality review before validation | 30-60m | ⬚ |
| 21 | [Change block index](10-change-block-index.md) | Indexed diff hunks for review | 5-10m | ⬚ |
| 22 | [Code review method](10-code-review-method.md) | What the code review walked and swept | 5-10m | ⬚ |
| 23 | [Test suite review](10-test-suite-review.md) | Test quality and coverage | 10-20m | ⬚ |
| 24 | [Test suite review method](10-test-suite-review-method.md) | Suite baseline, coverage map, sweeps | 5-10m | ⬚ |
| 25 | [Structural analysis](10-structural-analysis.md) | Prism L12 when written standalone | 15-30m | ⬚ |
| 26 | [Architecture summary](10-architecture-summary.md) | Stakeholder architecture overview | 15-30m | ⬚ |
| 27 | Validation | Build, test, lint verification | 15-30m | ⬚ |
| 28 | [Strategic review](12-strategic-review-1.md) | Scope/minimality series (`strategic-review-{n}`) | 15-30m | ⬚ |
| 29 | [Strategic review method](12-strategic-review-1-method.md) | Scope, conformance, minimality and delivery passes | 5-10m | ⬚ |
| 30 | Submit for review | PR review lifecycle / stealth push | 30-60m | ⬚ |
| 31 | [Close-out](14-COMPLETE.md) | Deliverables, limitations, retrospective; ADR when owed | 10-20m | ⬚ |
| 32 | [Token usage](14-token-usage.md) | Session token and cost summary | 5-10m | ⬚ |
| 33 | [Session trace](14-session-trace.md) | Lean mechanical execution trace | 5-10m | ⬚ |

Rows run in the order the activities execute, which is the order a reader watches them complete in. Codebase comprehension therefore sits third, between design philosophy and requirements elicitation, though its artifact prefix is the highest of the set — the prefix follows the definition file, the row follows the run.

Link targets are minted filenames per [Item cell](../../meta/resources/planning-readme.md#item-cell). Deferred items and Follow-ups are the cross-activity registers, minted by whichever activity defers or logs first and therefore unprefixed.

Initial Status icons are from [Status vocabulary](../../meta/resources/planning-readme.md#status-vocabulary). Prior feedback triage starts as cancelled/N/A in the implement/create seed (review-only).

## Row ownership

Which activity owns which rows, per [row-ownership map](../../meta/resources/planning-readme.md#row-ownership-map). Values are Item labels.

| @ | Rows |
|---|------|
| 01 | Start work package · Prior feedback triage |
| 02 | Design philosophy · Assumptions log |
| 03 | Requirements elicitation |
| 04 | KB research |
| 05 | Implementation analysis |
| 06 | Work package plan · Test plan · Deferred items · Follow-ups |
| 07 | Assumptions review |
| 08 | Implementation · Provenance log |
| 09 | Lean-coding audit · Code review · Debt ledger · Lean change |
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

Set cancelled/N/A on the rows owned by `03`, `04`, and `08`. Flip Prior feedback triage from cancelled/N/A to pending. Do not overwrite unrelated pending / in-progress / complete cells.
