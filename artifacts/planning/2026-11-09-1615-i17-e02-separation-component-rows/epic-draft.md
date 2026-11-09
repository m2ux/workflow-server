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
  Each fix row extends one implementation component the audit names and carries its observing regressions; parallel rows never edit the same file.
- **Kind registration.**
  The entry point names each kind's artifact and the interface operations it supplies, and one script registry, `scripts/kinds.py`, maps each kind to its module. General prose and scripts reach a kind only through them; the hot-fix artifacts and module supply the operations.
- **Shared executable rules.**
  Title tag parsing lives in `scripts/board.py`, completion and issue identity in `scripts/sync.py`, and priority-label interpretation in the `scripts/priority.py` that #1631 delivers.
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
  The audit records the selected cascade: all unfinished descendants move to Backlog and active work pauses with its initiative; completed descendants remain Done. The dedicated Backlog Pause plan owns the runtime implementation. This epic's ownership fixes retain the audited runtime baseline and consume the other confirmed policy decisions.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Lane | Done |
| --- | --- | --- | --- | --- | --- | --- |
| [W01](https://github.com/m2ux/workflow-server/pull/1656) | SOLID guidelines, Fields and read-context boundaries | AC1 | [E01:W08](https://github.com/m2ux/workflow-server/issues/1616) | | | ✓ |
| [W02](https://github.com/m2ux/workflow-server/commit/40d65b7757717f6931dedec7a37243ffa9197db7) | Audit ownership, Fields and prerequisite boundaries | AC2, AC10, AC17 | W01 | | | ✓ |
| [W11](https://github.com/m2ux/workflow-server/pull/1663) | Automatic answers follow saved queue evidence | AC18 | W02 | | | ✓ |
| [W12](https://github.com/m2ux/workflow-server/pull/1664) | Diagram fidelity governs readable size | AC19 | W02 | | | ✓ |
| [W13](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1615-i17-e02-w13-review-findings-follow-the/) | Review findings follow the approved scope | AC20 | W02 | | | |
| [W14](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w14.md) | Kind registration names interface operations | AC21 | W13 | | | |
| [W15](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w15.md) | One script registry maps kinds to modules | AC22 | W13 | W16 | | |
| [W16](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w16.md) | Hot-fix module implements the kind interface | AC23 | W13 | W15 | | |
| [W17](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w17.md) | Board script owns title tag parsing | AC24 | W13 | | | |
| [W18](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w18.md) | Dependency Graph fields hold shapes only | AC25 | W13 | | | |
| [W19](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w19.md) | Required Criteria field holds the declaration | AC26 | W13 | | | |
| [W20](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w20.md) | Hot-fix supplies the registered interface operations | AC27 | W14 | | | |
| [W21](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w21.md) | Hot-fix Body owns body population | AC28 | W14 | | | |
| [W22](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w22.md) | Align Mode names no individual kind | AC29 | W14 | | | |
| [W23](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w23.md) | Board artifact names no individual kind | AC30 | W14 | | | |
| [W24](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w24.md) | deliver.py reaches kinds through the registry | AC31, AC32 | W15, W16, W17 | | | |
| [W25](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w25.md) | board-queue.py reaches kinds through the registry | AC33, AC34 | W15, W16, W17, [#1631](https://github.com/m2ux/workflow-server/issues/1631) | | | |
| [W26](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w26.md) | sync.py reaches kinds through the registry | AC35 | W15, W16 | | | |
| [W27](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w27.md) | progress.py reaches kinds through the registry | AC36, AC37 | W15, W16, W17, [#1631](https://github.com/m2ux/workflow-server/issues/1631) | | | |
| [W28](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w28.md) | format.py reaches kinds through the registry | AC38 | W15, W16 | | | |
| [W29](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w29.md) | agent_review.py reaches kinds through the registry | AC39 | W15, W16 | | | |
| [W30](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w30.md) | dispatch.py names no individual kind | AC40 | W15, W16 | | | |
| [W31](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w31.md) | orphans.py reaches kinds through the registry | AC41 | W15, W16 | | | |
| [W32](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w32.md) | Deliver Mode reaches kinds through registration | AC42 | W20 | | | |
| [W33](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w33.md) | Hoist Mode reaches kinds through registration | AC43 | W20, W21 | | | |
| [W34](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w34.md) | Unit Dispatch reaches kinds through registration | AC44 | W20 | | | |
| [W35](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w35.md) | Issue Delivery reaches kinds through registration | AC45 | W20 | | | |
| [W36](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w36.md) | Task Merge reaches kinds through registration | AC46 | W20 | | | |
| [W37](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w37.md) | Issue Closure names no individual kind | AC47 | W20 | | | |
| [W38](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w38.md) | Delivery Plan units name no kind | AC48 | W20 | | | |
| [W39](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w39.md) | Delivery Branches kind-free with bounded fields | AC49, AC50 | W20 | | | |
| [W40](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w40.md) | Delivery Brief kind-free with bounded fields | AC51, AC52 | W20 | | | |
| [W41](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w41.md) | Dispatch Batch names no individual kind | AC53 | W20 | | | |
| [W42](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w42.md) | Board Queue artifact names no individual kind | AC54 | W20 | | | |
| [W43](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w43.md) | Pull Request artifact names no individual kind | AC55 | W20 | | | |
| [W44](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w44.md) | Agent Review names no individual kind | AC56 | W20 | | | |
| [W45](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w45.md) | Standup Report names no individual kind | AC57 | W20 | | | |
| [W46](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w46.md) | statuses.py kind-free with one identity | AC58, AC59 | W24, W25, W27 | | | |
| [W47](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w47.md) | Board Status artifact and transformations | AC6 | W20, W46 | W48, W49 | | |
| [W48](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w48.md) | Board Delivery calls the status operations | AC7, AC60 | W20, W46 | W47, W49 | | |
| [W49](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w49.md) | Hot-fix uses the extracted status contract | AC8 | W20, W46 | W47, W48 | | |
| [W50](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w50.md) | Hot-fix module exports only its interface | AC61 | W26, W28, W29, W30, W31, W46 | | | |
| [W51](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w51.md) | Detect Fields behavior and prerequisite violations | AC9, AC11, AC13 | W47, W48, W49 | | | |
| [W52](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w52.md) | Retained preparations select verified worktree reuse | AC14, AC15, AC16 | W34, W51, [#1631](https://github.com/m2ux/workflow-server/issues/1631) | | | |
| [W53](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows/w53.md) | Fresh reading trials confirm bounded entry routes | AC12 | W19, W23, W35, W37, W39, W43, W45, W51 | | | |

## Acceptance Criteria

- [x] **AC1.** The skill's guidelines state each SOLID principle for artifact, protocol and mode files, including the boundary between field constraints and transformations, and every file-type section links to their owning definitions, read in the skill guidelines.
- [x] **AC2.** Every breach of those guidelines in the skill's artifacts, modes, protocols and scripts is listed with its file, its guideline and its owning home, as the audit in the planning record shows.

- [ ] **AC6.** Board Status owns the proposed status-change contract and its callable transformations in its own artifact, checked by the installed model and document readers.
- [ ] **AC7.** Board Delivery obtains status decisions through the owning operations with the same status, membership, assignee and write-scope outcomes for identical evidence, as its extraction regression fixtures and caller checks show.
- [ ] **AC8.** Hot-fix consumes the extracted status contract through its owning operation with the same closure and status outcomes for identical evidence, as its extraction regression fixtures and field/caller checks show.
- [ ] **AC9.** The Work Planner checks identify the actual Status Changes example and representative hidden transformations in Fields as review candidates while accepting legitimate schemas, conditional invariants and literal examples, as positive/negative fixtures and semantic review show.
- [x] **AC10.** Every Fields section has a classified boundary/ownership disposition in the audit, including Status Changes and recorded similar candidates.

- [ ] **AC11.** The required-before-use context graph is acyclic for every supported Work Planner entry path, as the audited prerequisite graph and cycle regression fixtures show.
- [ ] **AC12.** Each representative reading trace conforms to its reviewed per-entry context contract, as repeated fresh-context Standup, Revise and Understand trials with pinned sources and captured inputs show.
- [ ] **AC13.** The prerequisite checks distinguish invalid before-use graphs from valid scoped reads, as positive/negative fixtures containing the measured artifact cycle, conditional prerequisites, field-reference cycles and execution retries show.

- [ ] **AC14.** Unit Dispatch selects the owning worktree-validation capability for a retained preparation and creation for a new unit, preserving each retained checkout's recorded branch and full preparation head, as protocol-routing checks and real-git reuse fixtures show.
- [ ] **AC15.** An absent or mismatched repository registration, branch, full preparation head, or clean tracked/untracked state blocks retained reuse without changing the checkout or starting a worker, as negative fixtures and before/after repository snapshots show.
- [ ] **AC16.** A capacity-only wait resumes with the same published planning record, retained unit context and confirmed hold, and starts exactly one worker only after current batch/session/capacity validation passes, as an ordered wait/resume event fixture and the separated route's prerequisite checks show.

- [x] **AC17.** Every policy ambiguity in the clarification catalog has an approved decision record, as the ownership audit and its linked decision evidence show.

- [x] **AC18.** An allowed automatic answer continues only after saving, confirmed readback and complete recomputation, while held or unanswered decisions remain pending, as captured queue scenarios and a fresh-context procedure trace show.

- [x] **AC19.** A faithful measured diagram remains valid below five elements and complex structure splits by concept without padding, as its real consumer fixtures and documented route checks show.
- [ ] **AC20.** Introduced defects and change-compromising caller risks remain blocking review findings while unrelated prior observations require scope evidence and a linked arising issue, as its real consumer fixtures and documented route checks show.

- [ ] **AC21.** The entry point's kind registration names, for each kind of work, the artifact holding it and each general interface operation that artifact supplies, as the document readers show.
- [ ] **AC22.** One script registry maps each kind of work to its module and selects an issue's or pull request's kind from its title, as the registry tests show.
- [ ] **AC23.** The hot-fix module supplies every operation of the registry's kind interface with the general contract's inputs and results, as the registry substitution tests show.
- [ ] **AC24.** Title tag parsing has one implementation in board.py, and board.py reaches completion and issue identity through their single implementations in sync.py, as the shared-helper tests and a duplicate-function search show.
- [ ] **AC25.** Dependency Graph's Fields state edge and candidate shapes and invariants only, and its owning operations state each reporting, placement and exit outcome, as the field-boundary reader and invalid-reference fixtures show.
- [ ] **AC26.** Epic Issue Body's Required Criteria field states the declaration's shape and invariants only, and Validate Epic Body owns its evaluation, unevaluable and finding outcomes, as the field-boundary reader and required-criteria fixtures show.
- [ ] **AC27.** Hot-fix supplies, under the registration's names, each interface operation a general mode or protocol selects for it, with the general contract's inputs and results, as caller-contract checks show.
- [ ] **AC28.** Hot-fix Body owns the operation that populates a hot-fix body, selected through the kind registration, as caller-contract checks show.
- [ ] **AC29.** Align Mode names no individual kind of work and states its subjects as the registered kinds through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC30.** Board names no individual kind of work and states board membership for every kind through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC31.** deliver.py branches on no individual kind of work and reaches each kind's logic through the script registry, as a kind search and the delivery survey tests show.
- [ ] **AC32.** deliver.py carries no copy of title tag parsing or issue identity and imports their single implementations, as a duplicate-function search and its tests show.
- [ ] **AC33.** board-queue.py branches on no individual kind of work and reaches each kind's logic through the script registry, as a kind search and the queue tests show.
- [ ] **AC34.** board-queue.py interprets priority labels, title tags and issue identity only through their single implementations, as a duplicate-function search and the queue tests show.
- [ ] **AC35.** sync.py branches on no individual kind of work and reaches each kind's logic through the script registry, as a kind search and the sync tests show.
- [ ] **AC36.** progress.py branches on no individual kind of work and reaches each kind's logic through the script registry, as a kind search and the progress tests show.
- [ ] **AC37.** progress.py interprets priority labels, title tags and issue identity only through their single implementations, as a duplicate-function search and the progress tests show.
- [ ] **AC38.** format.py branches on no individual kind of work and reaches each kind's logic through the script registry, as a kind search and the format tests show.
- [ ] **AC39.** agent_review.py branches on no individual kind of work and reaches each kind's logic through the script registry, as a kind search and the agent review tests show.
- [ ] **AC40.** dispatch.py branches on no individual kind of work and reaches each kind's logic through the script registry, as a kind search and the dispatch tests show.
- [ ] **AC41.** orphans.py branches on no individual kind of work and reaches each kind's logic through the script registry, as a kind search and the orphans tests show.
- [ ] **AC42.** Deliver Mode names no individual kind of work and reaches each kind's hold release and pre-merge review through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC43.** Hoist Mode names no individual kind of work and reaches each kind's numbering, body population and board settlement through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC44.** Unit Dispatch names no individual kind of work and reaches each kind's dispatch status and hold through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC45.** Issue Delivery names no individual kind of work and reaches each kind's delivery record through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC46.** Task Merge names no individual kind of work and reaches each kind's merge record and board settlement through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC47.** Issue Closure names no individual kind of work and retains every unit's delivery result through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC48.** Delivery Plan names no individual kind of work and takes each kind's unit from its registered Delivery Unit operation through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC49.** Delivery Branches names no individual kind of work and takes each kind's branch through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC50.** Delivery Branches' Fields state branch declaration and topology constraints only, and its owning operations state each fetch, report and unevaluable outcome, as the field-boundary reader and acquisition fixtures show.
- [ ] **AC51.** Delivery Brief names no individual kind of work and takes each kind's identity through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC52.** Delivery Brief's Fields state the brief's content constraints only, and its owning operation states each caller finding and refusal, as the field-boundary reader and brief fixtures show.
- [ ] **AC53.** Dispatch Batch names no individual kind of work and validates each kind's unit through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC54.** Board Queue names no individual kind of work and places each kind through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC55.** Pull Request names no individual kind of work and opens and collects each kind's pull requests through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC56.** Agent Review names no individual kind of work and applies each kind's finding-fix rule through the registered interface operations, keeping the approved finding-scope rule, as a kind search and the review validator tests show.
- [ ] **AC57.** Standup Report names no individual kind of work and reports each kind through the registered interface operations, as a kind search and its route checks show.
- [ ] **AC58.** statuses.py branches on no individual kind of work and reaches each kind's logic through the script registry, as a kind search and the status tests show.
- [ ] **AC59.** Issue identity has one implementation, which statuses.py imports in place of its own key_of, as a duplicate-function search and the status tests show.
- [ ] **AC60.** Board Delivery names no individual kind of work, and the In Review membership it applies comes from Board Status, as a kind search and its caller checks show.
- [ ] **AC61.** The hot-fix module exports only the registry's kind interface and the constants it owns, and no general script imports it directly, as an import search and the hot-fix tests show.

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

- **R10.** [Backlog Pause design](https://github.com/m2ux/workflow-server/blob/40d65b7757717f6931dedec7a37243ffa9197db7/artifacts/planning/2026-11-06-1597-backlog-pause/design.md) — the confirmed cascade/pause behavior and dedicated implementation boundary; tracker publication awaits its exact producer graph.

- **R11.** [Component split record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows) — each separation fix row's work item, its producer edges and the split decisions.
