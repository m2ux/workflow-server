## Overview

Work Planner is used through prosiform: a session starts by running `pf`, follows the bundle of the mode it selects, and hands a sub-agent its work as a dispatched bundle of its own. Every mode compiles within prosiform's default output budget with no warning, a link stands only where the reader must have its content and names the section it needs, and the shared skill guidelines and check state and enforce those rules. The goal the reviews test against is the four clauses the planning record holds.

## Problem

Work Planner is written for a reader who follows links one at a time, while prosiform compiles every local link into one bundle, so the skill's link forms carry the wrong meaning under compilation.

- **Five modes overflow the default budget.**
  At [785a5ee8c](https://github.com/m2ux/workflow-server/tree/785a5ee8c/skills/work-planner), Deliver compiles to 353717 bytes, Plan 328950, Advance 314874, Standup 273929 and Sync 264276, against a default output budget of 262144.
- **A mode's prerequisites compile other modes whole.**
  [Plan Mode's Prerequisites](https://github.com/m2ux/workflow-server/blob/785a5ee8c/skills/work-planner/modes/plan-mode.md#L11-L27) link Propose Mode and Sync Mode, so the Plan bundle carries both procedures although its steps run each in only one case.
- **Hand-offs are prose.**
  [Deliver Mode](https://github.com/m2ux/workflow-server/blob/785a5ee8c/skills/work-planner/modes/deliver-mode.md#L101-L105) starts a unit's session through a sentence about sub-agent dispatch, and no Work Planner link carries a dispatch or deferral operator.
- **Links name whole files.**
  245 of Work Planner's 1075 internal links name a whole file whose content carries sections, and each compiles that whole file into the bundle.
- **The rules describe reading, not compiling.**
  The [shared Links rules](https://github.com/m2ux/workflow-server/blob/785a5ee8c/skills/guidelines.md#L105-L118) type links for a reader who chooses what to open, and say nothing of a bundle, an operator or a budget.
- **Nothing compiles the skill.**
  The [shared skill-file check](https://github.com/m2ux/workflow-server/blob/785a5ee8c/skills/scripts/check_skill_files.py#L1025-L1029) reads link resolution and placement, so a mode that overflows the budget or reaches another mode whole draws no finding.
- **A check is named by its path.**
  The shared guidelines' [Verified rule](https://github.com/m2ux/workflow-server/blob/785a5ee8c/skills/guidelines.md#L198) names the shared check as a code span, and their [Files rule](https://github.com/m2ux/workflow-server/blob/785a5ee8c/skills/guidelines.md#L27-L28) says where checks sit without saying what any of them decides.

## Proposal

- **The entry point bootstraps through prosiform.**
  SKILL.md tells the reader to run `pf` and follow it, and selects a mode by a link prosiform compiles.
- **A link is content the reader must have.**
  A link names the section its reader needs wherever the target carries one, and prose that only names another mode or file is plain text.
- **Operators carry hand-offs and conditional reads.**
  A sub-agent hand-off is a dispatch, `⇉`, or `⫽` for a set run together; material a step reads only in some cases is a deferral, `¬`.
- **Each mode fits one bundle.**
  Every mode compiles within prosiform's default output budget with no warning, and its bundle size is recorded against a fixed baseline revision.
- **The shared guide states the rules and the shared check enforces them.**
  The guidelines bind every skill; the check holds to the prosiform rules only the skills named to it.
- **A check is defined where prose names it.**
  The shared guide defines each check the workspace runs, and prose names a check by linking to that definition.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](#e00) | Shared Prosiform Rules | AC6, AC7 | | |
| [E01](#e01) | Check Definitions | AC8 | | |
| [E02](#e02) | Work Planner Links | AC3, AC4 | [E00](#e00) | |
| [E03](#e03) | Use Through Prosiform | AC1, AC2, AC5 | [E02](#e02) | |

## Acceptance Criteria

- [ ] **AC1.** Every Work Planner mode compiles under prosiform within its default output budget with no warning, as the shared skill-file check's compile run reports over the skill.
- [ ] **AC2.** A session given a Work Planner request runs prosiform from the entry point and follows the bundle of the mode it selects, as a walk of a representative request from the entry point records.
- [ ] **AC3.** No Work Planner link compiles content its reader need not have, whether a whole file whose target carries sections or another mode reached outside a dispatch or a deferral, as the shared skill-file check reports over the skill.
- [ ] **AC4.** Each Work Planner hand-off to a sub-agent dispatches the procedure followed, and each citation a step reads only in some cases is deferred, as the hand-off and conditional-citation inventories the planning record holds show against the compiled bundles.
- [ ] **AC5.** No Work Planner mode's compiled bundle is larger than at the baseline revision the planning record fixes, as the bundle-size comparison records using one prosiform version on both revisions.
- [ ] **AC6.** The shared skill guidelines state the rules a skill used through prosiform follows — its bootstrap, its links, its operators and its budget — as a read of the guidelines shows.
- [ ] **AC7.** The shared skill-file check reports a violation of each prosiform rule it decides in a skill named to it, and none in a skill not named, as the check's own test suite shows against specimen skills.
- [ ] **AC8.** Prose in Work Planner and the shared guide reaches each check the workspace runs through a definition stating what it decides, which skills it binds, how it is run and where its tests live, as the shared skill-file check reports over those files.

## Non-Goals

- It does not edit the gitnexus, workflow-canon or server-in-the-loop skills.
- It does not change prosiform or its default budgets.
- It does not generate or check a read-set manifest for any skill.
- It does not walk retrieval order or citation efficacy, which compilation settles.

## References

- **R1.** **Source.** [Confirmed goal](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-i16-work-planner-through-prosiform/goal.md) — the four goal clauses the user confirmed, which the criteria answer to.
- **R2.** [Planning record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-02-i16-work-planner-through-prosiform) — the baseline revision, the measurements, the decisions and each review.
- **R3.** [Binding Citations](https://github.com/m2ux/workflow-server/issues/1427) — a plan for Work Planner citations under link-following reading; its section-link, mention, hand-off and check-definition evidence feeds this initiative's Problem.
- **R4.** [Prosiform references](https://github.com/m2ux/prosiform/blob/23882b7d/docs/references.md) — what makes a link a dependency, and the deferral and dispatch operators.
- **R5.** [Prosiform dispatch](https://github.com/m2ux/prosiform/blob/23882b7d/docs/dispatch.md) — the bundle a dispatch publishes and the protocol a sub-agent follows.
- **R6.** [Prosiform validation](https://github.com/m2ux/prosiform/blob/23882b7d/docs/validation.md) — the budgets each bundle is held to and the warnings a run reports.
