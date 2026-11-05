## Overview

The work-planner skill gains SOLID guidelines fitted to its architecture, and the whole skill is audited and fixed against them in workflow-server before the skill's extraction is cut. Artifact and protocol files are treated as classes, and their linked operations as method calls that encapsulate each file's state. Each rule has one owning file or script module, and no general file names a specific kind of work, so the skill moves to prosiform-skills already separated.

## Problem

- **No separation grain is defined.** The guidelines define an artifact as one shape and a protocol as one change. They say nothing of how files encapsulate, extend or depend on one another.
  - Open–closed is stated only for the issue-body family: "the common file names no kind".
- **General files enumerate kinds of work.** The delivery plan, Deliver mode, pull request, board queue and Task Merge each name hot-fixes and branch on them.
  - Adding a kind means editing every general file again.
- **Scripts branch on kinds inline.**
  The delivery and board-queue scripts run hot-fix paths beside the epic paths.
- **No map of the breaches.**
  Nobody has audited the whole skill, so the remaining breaches and their owning homes are unknown.

## Proposal

- **Files as classes, operations as methods.** An artifact or protocol file is a class, an operation is a public method, and a link to an operation heading is a method call.
  - Commands are private methods, reached only from their own file's operations.
  - Fields are the file's state and its public shape.
  - Prerequisites are its imports.
- **SOLID guidelines first.** The first task adds a SOLID section to the skill's guidelines.
  - Single responsibility: one reason to change per file.
  - Open–closed: a new kind is a new file, and general files name no kind.
  - Liskov substitution: every kind fills an interface operation with the same contract.
  - Interface segregation: small operations, and prerequisites that list only what is called.
  - Dependency inversion: general files never link down to a kind, and kinds are listed in one registry.
  - Each file-type section links that section rather than restating it.
- **Audit against the guidelines.** The second task reviews every artifact, mode, protocol and script against the guidelines' audit questions.
  - It records each breach in the planning record with its file, the guideline it breaks and the home that owns it.
- **Fix rows from the audit.**
  The fix tasks take the audit's findings by concern, and each is split into one row per group of files it touches, so parallel rows never edit the same file.
- **Behaviour.**
  Every fix moves where a rule is stated or implemented and keeps what the skill does.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Lane | Done |
| --- | --- | --- | --- | --- | --- | --- |
| W01 | SOLID guidelines for files and operations | AC1 | [E01:W08](https://github.com/m2ux/workflow-server/issues/1616) |  |  |  |
| W02 | Audit the skill against the guidelines | AC2 | W01 | | | |
| W03 | Generic prose in general artifacts and modes | AC3 | W02 | | | |
| W04 | Generic interfaces in general scripts | AC4 | W02 | | | |
| W05 | Each audited rule in one home | AC5 | W02 | | | |

## Acceptance Criteria

- [ ] **AC1.** The skill's guidelines state each SOLID principle for artifact, protocol and mode files, and every file-type section links to them, read in the skill guidelines.
- [ ] **AC2.** Every breach of those guidelines in the skill's artifacts, modes, protocols and scripts is listed with its file, its guideline and its owning home, as the audit in the planning record shows.
- [ ] **AC3.** No general artifact, mode or protocol names a specific kind of work as a case it handles, checked by a search of the skill.
- [ ] **AC4.** No general script branches on a kind of work, and each kind's logic lives in its own module, checked by a search of the scripts.
- [ ] **AC5.** Each rule the audit lists is stated in its owning home alone, and every other file links to it, checked by a search of the skill for each listed rule.

## References

- **R1.** [Planning record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes) — the decisions, the audit and each task's work item.
- **R2.** [SOLID guidelines draft](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/solid-guidelines.md) — the guidelines the first task lands, with the class model and the audit questions.
- **R3.** [Delivery Units](https://github.com/m2ux/workflow-server/issues/1614) — the delivery-path breach that prompted this review.
- **R4.** [Work Planner at the planned revision](https://github.com/m2ux/workflow-server/tree/9d71790c2668debbc03a2ba1d00509e8bea3bff6/skills/work-planner) — the skill the review audits.
