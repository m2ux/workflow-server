## Overview

Plan Mode publishes a new epic for an existing initiative, saves its parent row with the created identity, and validates fresh saved context before delivery preparation.

## Problem

The [publication procedure](https://github.com/m2ux/workflow-server/blob/3223aee0e83766bf9ef5727662ce3626115a27ae/skills/work-planner/modes/plan-mode.md#L68-L85) places epic creation and identity replacement under the new-initiative branch. The existing-initiative route reaches validation without an explicit save of its new epic or the parent's new row. The ambiguity predates the style migration.

## Proposal

Initiative creation is conditional; epic publication and confirmed identity substitution serve both new and existing parents. Plan Mode owns the sequencing and calls the existing save/readback capabilities. Fresh issue identities and bodies supply format, goal and dependency validation. Failed saves stop downstream preparation with their evidence.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Lane | Done |
| --- | --- | --- | --- | --- | --- | --- |
| [W01](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1641-integration-review/e05-w01.md) | Confirm epic and parent publication sequence | AC1, AC2, AC3 | [E01:W08](https://github.com/m2ux/workflow-server/issues/1616) | | | |

## Acceptance Criteria

- [ ] **AC1.** Planning a new epic under an existing initiative saves the epic before validating saved context, as an ordered route fixture shows.
- [ ] **AC2.** The parent Work Breakdown carries the saved epic identity and passes fresh saved-body and dependency checks, as a publication/readback fixture shows.
- [ ] **AC3.** A failed issue save blocks delivery preparation with the failure evidence, as injected-failure route fixtures show.

## References

- **R1.** [Publication design](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1641-integration-review/followups.md) — inherited source evidence, owning component and observing scenarios.
