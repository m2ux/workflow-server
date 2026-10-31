## Overview

This initiative pays down the cost the definitions carry: declarations a check reads that are missing or wrong, required inputs a container hands to operations that never read them, values a run reads that nothing produces, and findings two guards hold quiet by list. Every value a definition declares states its shape, and every value a run reads has a source.

## Problem

- **Declarations the checks read are missing or wrong.**
  Seven gitnexus operations declare [`#### entry`](https://github.com/m2ux/workflow-server/blob/6355c392/corpus/support/gitnexus/techniques/list-group-members.md). [`declared-type-mismatch` holds at 12](https://github.com/m2ux/workflow-server/blob/ab680d9d/guards/check-operation-contract.ts#L30).
- **Steps owe values nothing supplies.**
  The [inherited-input-never-spent](https://github.com/m2ux/workflow-server/blob/6fcee6ab/corpus/canon/resources/anti-patterns.md#L2429-L2441) entry finds [125 steps](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-05-706-unspent-inputs/sites.md) binding an operation that never reads a required input its container declares, with nothing holding that input.
- **Two guards are quiet by list.**
  Unproduced reads are suppressed when the [triage ledger](https://github.com/m2ux/workflow-server/blob/6355c392/ledgers/unproduced-read-triage.json) says `fix-later`. Review-mode accepts three headless checkpoints in [the guard](https://github.com/m2ux/workflow-server/blob/ab680d9d/guards/check-review-mode-gating.ts#L51-L66).

## Proposal

- **Shapes where the checks read them.**
  A list entry declares the fields a step may read, and a contract declares each value with the shape the operation publishes.
- **Every inherited required input has a source.**
  A container input an operation never reads gets a default, an optional marker or a narrower home, and the catalogue names the class.
- **The two guards report nothing.**
  The activity-variables guard and the review-mode-gating guard report no findings against the corpus, as the standard sweep shows.
- **Every read has a producer.**
  A value a corpus workflow reads is produced by a step that runs before it, and the triage ledger holds no deferred entry.
- **A description its readers accept.**
  An input's description satisfies every catalogue entry and every derivation that reads it, so the wording an author writes is the wording the checks expect.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/948) | Declared Shapes | AC1, AC2 | | |
| [E01](https://github.com/m2ux/workflow-server/issues/1138) | Unspent Inputs | AC3, AC4 | | |
| [E02](https://github.com/m2ux/workflow-server/issues/1116) | Red Guards | AC5 | | |
| [E03](https://github.com/m2ux/workflow-server/issues/1248) | Unproduced Reads | AC6 | | |
| [E04](https://github.com/m2ux/workflow-server/issues/1394) | Described Inputs | AC7 | | |
| [E05](https://github.com/m2ux/workflow-server/issues/1410) | Library Inputs | AC3 | | |

## Acceptance Criteria

- [ ] **AC1.** Every value a contract declares carries the shape the operation filling it publishes, as the operation-contract check reports in the standard sweep.
- [ ] **AC2.** Every input a technique declares is one the operation it binds accepts, as the tool-call-shape check reports in the standard sweep.
- [ ] **AC3.** No step outside the deprecated workflow-design binds an operation that leaves a required inherited input it never reads without a source, as the inherited-input-never-spent guard reports in the standard sweep.
- [ ] **AC4.** Each class these checks grade is named in the anti-pattern catalogue, with the sources that may hold it and the fix that re-homes it, as the catalogue shows.
- [ ] **AC5.** The activity-variables and review-mode-gating guards report no findings against the corpus, as the standard sweep reports.
- [ ] **AC6.** Every value a corpus workflow reads has a producer, with `ledgers/unproduced-read-triage.json` holding no `fix-later` entry, as the standard sweep reports.
- [ ] **AC7.** An input whose description must satisfy both the catalogue and the engine's derivation has one wording that satisfies both, as a rule-hygiene audit of that construct and an activity-variables run over it report.

## Non-Goals

- Removing version lines, or step ids the loader can derive.
- Retiring the step kind discriminator.

## References

- **R1.** [Element shape](https://github.com/m2ux/workflow-server/issues/874) — List entries described in prose that the binding check cannot read.
- **R2.** [Declared type](https://github.com/m2ux/workflow-server/issues/875) — Contracts that call a structure a string.
- **R3.** [Unspent inputs record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-05-706-unspent-inputs/README.md) — The firing sites and the decisions behind the inherited-input work.
- **R4.** [Replan record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-03-706-i04-replan/README.md) — What the ledger and the acceptance list hold.
- **R5.** [Split record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-13-706-i04-split/README.md) — The areas debt is carried by, and the decisions that drew the boundary.
