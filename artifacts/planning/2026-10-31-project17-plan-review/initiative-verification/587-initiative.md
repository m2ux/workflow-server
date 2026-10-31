## Overview

This initiative is the home for work-package workflow refinements that are too large for another epic's work item, and whose scope has to be settled before they can be estimated.

## Problem

The work-package workflow is the busiest definition in the corpus — sixteen activities, thirty-five bindings into the code knowledge graph, and the workflow every other one borrows from. When it needs to understand a part of a codebase, it writes what it learned into one file per area inside that run's planning folder. The next run over the same area starts again.

A wiki already exists to hold that knowledge across sessions, but its operations are not bindable as they stand. They read two values that are not their inputs, and the comprehension artifact is an input or output on five operations across two stages. A later run pays to understand an area a previous run already covered.

## Proposal

Write three decisions before any binding is applied: whether the work-package workflow pins a citation baseline and to what; how a caller that is not the wiki workflow seeds the wiki operations' scope; and what the assumption-reconciliation step appends to once there is no single file. Then bind comprehension to the wiki operations so a later run reads what an earlier run already learned.

Further refinements to this workflow join here as they are identified.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/945) | Compounding Comprehension | AC1, AC2, AC3, AC4, AC5 | | |

## Acceptance Criteria

- [ ] **AC1.** Every wiki operation the work-package workflow binds declares each value it reads as an input, as `check:binding` reports with the work-package workflow as the caller.
- [ ] **AC2.** Each operation that reads or writes comprehension, the reconciliation step included, names the wiki pages it reads or writes, shown by `check:binding` reporting those pages among its declared inputs and outputs.
- [ ] **AC3.** No work-package activity reads or writes a per-area comprehension file, as the work-package snapshot walk shows.
- [ ] **AC4.** A second work-package run over an area starts from the wiki pages the first run wrote, as a successive-run smoke run of the work-package workflow over one area shows by its later run writing only what the earlier run's pages lack.
- [ ] **AC5.** Binding the wiki costs comprehension none of its behaviour, as the work-package snapshot walk and a successive-run smoke run exercising the deep-dive loop, the comprehension-sufficient checkpoint, the lens passes and every declared outcome of the comprehension activity show.

## Non-goals

- Porting comprehension files written by earlier runs into the wiki.
- Changing the wiki's page format, citation rules or confidence scoring.
- Changing what comprehension analyses, or the depth it analyses to.
- Shared-capability and delivery-grain debt.

## References

- **R1.** [Shared capability](https://github.com/m2ux/workflow-server/issues/539) — I01's shared-capability epic, which frames the three decisions.
- **R2.** [Workflow optimisation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-18-optimisation-of-meta-and-work-package-workflows) — Fan-out survey and reuse breaches behind the item.
