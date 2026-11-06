## Overview

The work-planner skill gains SOLID guidelines fitted to its architecture, and the whole skill is audited and fixed against them in workflow-server before the skill's extraction is cut. Artifact and protocol files own their subjects, callable operations and command specifications; links select those capabilities and their required context. Each rule has one owning file or script module, and no general file names a specific kind of work, so the skill moves to prosiform-skills already separated.

## Problem

- **No separation grain is defined.** The guidelines define an artifact as one shape and a protocol as one change. They say nothing of how files encapsulate, extend or depend on one another.
  - Open–closed is stated only for the issue-body family: "the common file names no kind".
- **General files enumerate kinds of work.** The delivery plan, Deliver mode, pull request, board queue and Task Merge each name hot-fixes and branch on them.
  - Adding a kind means editing every general file again.
- **Scripts branch on kinds inline.**
  The delivery and board-queue scripts run hot-fix paths beside the epic paths.
- **Fields carry hidden behavior.**
  Board Delivery’s Status Changes computes status and membership decisions from delivery evidence and restricts permitted writes inside a field definition. Similar sections can conceal derivation or execution behind declarative wording.
- **Required reads are circular and broad.**
  A prerequisite cycle spans Board Delivery, Board Queue, Delivery Branches, Delivery Plan and related artifact modules. Whole-file imports pull unrelated command bodies into Standup and Understand before their selected operations run.
- **Retained preparation can reach creation.**
  Unit Dispatch accepts retained preparations but its session-preparation step calls Create Task Worktree unconditionally. A capacity-only resume can attempt to recreate the recorded branch and checkout.
- **Policy contexts can disagree.**
  Advance decision recording, backlog cascades, diagram sizing and hot-fix finding scope have competing readings. An ownership move alone cannot settle which inputs and outcomes a rule governs.
- **No map of the breaches.**
  Nobody has audited the whole skill, so the remaining breaches and their owning homes are unknown.

## Proposal

- **Files own subjects and capabilities.** An artifact or protocol file owns one subject or coordinated change, and callers select its operations or command specifications by link.
  - Commands precedes Fields and owns the enriched invocation and explicit I/O contract. Callers Run command specifications directly where no substantive procedure is needed.
  - Fields are the file's state and public shape. Nested calls keep selections, conditions and continuation without repeating I/O inventories.
  - In-text links select required context at its point of use, with common context separated from context selected by a particular operation.
- **SOLID guidelines first.** The first task adds a SOLID section to the skill's guidelines.
  - Single responsibility: one reason to change per file.
  - Open–closed: a new kind is a new file, and general files name no kind.
  - Liskov substitution: every kind fills an interface operation with the same contract.
  - Interface segregation: small callable capabilities, common prerequisites justified for every entry they govern, and conditional context reached at its point of use.
  - Dependency inversion: general files never link down to a kind, and kinds are listed in one registry.
  - Each file-type section links that section rather than restating it.
  - Define the required-before-use context graph separately from execution calls and ordinary field references. Its edges name their entry condition, required content and reason; the graph is acyclic. A selected link sets the reading boundary; linked modes execute only at explicit calls. Ordinary cross-reference cycles do not imply before-use ordering cycles.
  - Fields define shapes and invariants; operations own derivation, execution, refusals and continuation. The audit distinguishes legitimate conditional constraints from hidden transformations.
- **Audit against the guidelines.** The second task reviews every artifact, mode, protocol and script against the guidelines' audit questions.
  - It records each breach in the planning record with its file, the guideline it breaks and the home that owns it. Every Fields section is classified; Board Delivery’s Status Changes is the confirmed starting finding. Candidates record the supplied evidence, produced decision, owning subject and disposition.
  - Classify every prerequisite edge by source section, target boundary, entry condition and necessity. Record required common context, context selected by a call, field definitions read at use and redundant preloads. Trace Standup, Revise and Understand from stable source revisions, including their consumer-specific context.
- **Fix rows from the audit.**
  The fix tasks take the audit's findings by concern, and each is split into one row per implementation component before dispatch. Each row carries its observing regressions, and parallel rows never edit the same file.
- **Bounded prerequisite reads.** Apply the reviewed edge dispositions to remove circular and unrelated preload requirements while retaining necessary common context, selected command contracts, authorization and evidence gates. Keep each rule at its owning subject; a visited-set workaround or an instruction to ignore an import does not settle an ownership or read-boundary defect.
  - Fixed routes supply complete, untruncated common and selected-operation context before use. Paired fresh-context trials use pinned source and executable captured fixtures; each trial records actual reads, omissions, unrelated content and prerequisite reuse.
- **Board Status artifact.** A new `board-status.md` owns the proposed status-change shape and the operations that derive and validate that change. Board Delivery gathers evidence, applies changes and confirms saved state. Board Queue retains priority/readiness decisions; lifecycle rules stay with their owning subjects.
  - The audit separately checks for a shared ordered sequence changing several artifacts. A lifecycle protocol requires that concrete sequence and its callers, reconciled with Issue Delivery and Issue Closure; decision rules alone remain with their owning artifacts.
  - The artifact, Board Delivery and Hot-fix consumer changes share one pull request so moved contracts, caller links and `○`, `●`, `ƒ` roles remain valid together. Existing status, membership, assignee, review-evidence and write-scope behavior is preserved.
- **Candidate detection and regression evidence.** Checker fixtures include the actual Status Changes text, structurally different hidden-transform examples and valid conditional field constraints. Diagnostics identify file, heading, evidence and candidate operation/owner; semantic classification is confirmed in the audit.
  - Extracted behavior and prerequisite fixes carry regression coverage in their own pull requests. The final checker task adds reusable candidate detection and prerequisite diagnostics with positive/negative fixtures; wording keywords alone do not establish a violation.
  - Cycle diagnostics name source/target sections and a closed witness path. Scope diagnostics are conservative review candidates unless a declared context contract proves the mismatch. Valid conditional prerequisites, ordinary definition cycles and intentional execution retries are controls.
- **Verified retained-preparation route.** After the separation diagnostics are available, reconcile Unit Dispatch with the existing automatic-dispatch correction in #1631 and [PR #1645](https://github.com/m2ux/workflow-server/pull/1645). Creation records the preparation head; a retained preparation selects the owning read-only worktree validation, using the recorded checkout identity and current hold/start evidence. Keep that identity contract and its executable validation in Delivery Branches, with selection and continuation in Unit Dispatch.
  - Verify the separated route with the completed prerequisite diagnostics and capacity-wait/resume fixtures. A mismatch retains the checkout and hold, blocks that unit, and starts no worker. Successful reuse reaches the existing start gate once; new work still follows creation.
  - Reuse the upstream implementation and observing tests. Defects in that implementation are corrected in its owning pull request; this task reconciles its protocol calls and verifies their composition with the separated skill.
- **Policy clarification decisions.** The audit includes the four inherited ambiguities in the [policy clarification plan](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/policy-clarifications.md). Each candidate has its exact context, current prose and observed behavior, recommended interpretation, owning contract and distinguishing scenarios.
  - Audit and proposed interpretations are authorized; each policy interpretation is confirmed before its fix is dispatched. Distinguish a wording conflict from different rules governing different contexts.
  - The ownership fixes apply confirmed interpretations and their observing regressions together, with one canonical rule and links from callers. Split fixes into exact component rows before dispatch and reconcile shared files with the delivery-recovery plan.
  - Use the Style epic's field ledger and review evidence as the starting inventory, then refresh against its delivered revision; a resolved presentation or field-boundary issue is not repeated as an open defect.
- **Behaviour.**
  Ownership-only fixes preserve outcomes. A confirmed policy clarification records its permitted outcome differences and observing scenarios before implementation; extraction regressions compare against that clarified baseline.

- **Backlog pause has its own delivery.**
  The audit records its selected cascade and cooperative pause/resume policy. The separate Backlog Pause concern implements that behavior after the separation and recovery contracts integrate; ownership-only fixes retain the audited runtime baseline.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Lane | Done |
| --- | --- | --- | --- | --- | --- | --- |
| [W01](https://github.com/m2ux/workflow-server/pull/1656) | SOLID guidelines, Fields and read-context boundaries | AC1 | [E01:W08](https://github.com/m2ux/workflow-server/issues/1616) | | | ✓ |
| [W02](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and/) | Audit ownership, Fields and prerequisite boundaries | AC2, AC10, AC17 | W01 | | | |
| W03 | Generic prose in general artifacts and modes | AC3 | W02 | | | |
| W04 | Generic interfaces in general scripts | AC4 | W02 | | | |
| W05 | Rule ownership and bounded prerequisite reads | AC5, AC11, AC12 | W02 | | | |
| [W06](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/w06.md) | Board Status artifact and transformations | AC6 | W03, W04, W05 | W07, W08 | | |
| [W07](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/w07.md) | Board Delivery calls the status operations | AC7 | W03, W04, W05 | W06, W08 | | |
| [W08](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/w08.md) | Hot-fix uses the extracted status contract | AC8 | W03, W04, W05 | W06, W07 | | |
| [W09](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/w09.md) | Detect Fields behavior and prerequisite violations | AC9, AC13 | W06, W07, W08 | | | |
| [W10](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/w10.md) | Retained preparations select verified worktree reuse | AC14, AC15, AC16 | W09, [#1631](https://github.com/m2ux/workflow-server/issues/1631) | | | |

## Acceptance Criteria

- [x] **AC1.** The skill's guidelines state each SOLID principle for artifact, protocol and mode files, including the boundary between field constraints and transformations, and every file-type section links to their owning definitions, read in the skill guidelines.
- [ ] **AC2.** Every breach of those guidelines in the skill's artifacts, modes, protocols and scripts is listed with its file, its guideline and its owning home, as the audit in the planning record shows.
- [ ] **AC3.** No general artifact, mode or protocol names a specific kind of work as a case it handles, checked by a search of the skill.
- [ ] **AC4.** No general script branches on a kind of work, and each kind's logic lives in its own module, checked by a search of the scripts.
- [ ] **AC5.** Each rule retained in this epic's ownership-fix scope is stated in its owning home alone, and every consumer follows that linked contract, as source searches and approved scenario fixtures show.

- [ ] **AC6.** Board Status owns the proposed status-change contract and its callable transformations in its own artifact, checked by the installed model and document readers.
- [ ] **AC7.** Board Delivery obtains status decisions through the owning operations with the same status, membership, assignee and write-scope outcomes for identical evidence, as its extraction regression fixtures and caller checks show.
- [ ] **AC8.** Hot-fix consumes the extracted status contract through its owning operation with the same closure and status outcomes for identical evidence, as its extraction regression fixtures and field/caller checks show.
- [ ] **AC9.** The Work Planner checks identify the actual Status Changes example and representative hidden transformations in Fields as review candidates while accepting legitimate schemas, conditional invariants and literal examples, as positive/negative fixtures and semantic review show.
- [ ] **AC10.** Every Fields section has a classified boundary/ownership disposition in the audit, including Status Changes and recorded similar candidates.

- [ ] **AC11.** The required-before-use context graph is acyclic for every supported Work Planner entry path, as the audited prerequisite graph and cycle regression fixtures show.
- [ ] **AC12.** Each representative reading trace conforms to its reviewed per-entry context contract, as repeated fresh-context Standup, Revise and Understand trials with pinned sources and captured inputs show.
- [ ] **AC13.** The prerequisite checks distinguish invalid before-use graphs from valid scoped reads, as positive/negative fixtures containing the measured artifact cycle, conditional prerequisites, field-reference cycles and execution retries show.

- [ ] **AC14.** Unit Dispatch selects the owning worktree-validation capability for a retained preparation and creation for a new unit, preserving each retained checkout's recorded branch and full preparation head, as protocol-routing checks and real-git reuse fixtures show.
- [ ] **AC15.** An absent or mismatched repository registration, branch, full preparation head, or clean tracked/untracked state blocks retained reuse without changing the checkout or starting a worker, as negative fixtures and before/after repository snapshots show.
- [ ] **AC16.** A capacity-only wait resumes with the same published planning record, retained unit context and confirmed hold, and starts exactly one worker only after current batch/session/capacity validation passes, as an ordered wait/resume event fixture and the separated route's prerequisite checks show.

- [ ] **AC17.** Every policy ambiguity in the clarification catalog has an approved decision record, as the ownership audit and its linked decision evidence show.

## References

- **R1.** [Planning record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes) — the decisions, the audit and each task's work item.
- **R2.** [SOLID guidelines draft](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/solid-guidelines.md) — the guidelines the first task lands, with the class model and the audit questions.
- **R3.** [Delivery Units](https://github.com/m2ux/workflow-server/issues/1614) — the delivery-path breach that prompted this review.
- **R4.** [Work Planner at the planned revision](https://github.com/m2ux/workflow-server/tree/756aaf9f53f884b1da120e990ec9524a936aa4b2/skills/work-planner) — the skill the review audits.

- **R5.** [Fields and transformations plan](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/fields-and-transformations.md) — confirmed finding, ownership, candidate audit, atomic extraction and regression matrix.

- **R6.** [Prerequisite cleanup plan](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/prerequisite-cleanup.md) — measured cycle, per-entry context contracts, task allocation and structural/live verification.

- **R7.** [Retained preparation plan](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/retained-preparation.md) — owning capabilities, upstream reconciliation, criterion ownership and safe-resume regression matrix.

- **R8.** [Delivery failure recovery design](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-delivery-failure-recovery/design.md) — the ownership audit incorporates these planned Deliver Mode, Pull Request and Epic Integration corrections and resolves shared-file contention when its fix rows acquire exact components.

- **R9.** [Policy clarification plan](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/policy-clarifications.md) — the four inherited ambiguities, decision gates, canonical owners, task allocation and distinguishing scenario matrix.

- **R10.** [Backlog pause design](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/design.md) — the selected runtime policy and its separate implementation boundary.
