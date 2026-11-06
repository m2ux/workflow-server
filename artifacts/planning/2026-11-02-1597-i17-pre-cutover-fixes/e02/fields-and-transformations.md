# Fields and Transformations

## Confirmed Scope

The user asks E02 to plan the Board Delivery Status Changes extraction and make the guidelines and tests identify this and similar candidates. This revises planning only. E01 implementation, its open review and the existing E02 producer dependency remain in place. The Board Status boundary is refined within existing W02 and W06–W08. Task/criterion identities, priority, dependencies, joins and unlaned assignments are retained.

## Evidence and Ownership

At workflow-server fbce2c7535b1518dd3ebb4dbe845b67576186d94, board-delivery.md#status-changes combines closure-to-placement rules, open lifecycle derivation, reservation/dependency decisions and restrictions on permitted writes. board.py derives statuses; statuses.py validates write jurisdiction and renders changes; deliver.py uses that renderer for dispatch. Record Epic Review and Hot-fix’s Board Status cite the field directly.

| Finding or candidate | Disposition |
| --- | --- |
| F01: Board Delivery / Status Changes | Confirmed mixed behavior and policy under Fields. Extract the cohesive proposed status-change contract and transformations into board-status.md; place subject-specific lifecycle rules with their owners. Remove the field and fix callers in the same joined unit. |
| Board Queue / Initiative Status, Epic Status, Backlog Cascade | Audit candidates: distinguish priority/state invariants from algorithms that derive or perform transitions. Do not mechanically extract conditional prose. |
| Eligibility, delivery/completion and review-evidence Fields throughout artifacts | Audit candidates: record whether each defines a condition/result or gathers evidence, computes a decision, executes work or routes continuation. |
| Enum/type declarations, conditional invariants, linked result shapes and literal examples | Required acceptance counterexamples. Field complexity or an if/when sentence alone is not a finding. |

The new artifact’s Fields describe issue/item identity, current and desired status or removal, permitted write scope, reason and blockers. Its operations derive/validate a proposed change from supplied state and subject-owned decisions. Board Delivery gathers evidence, applies changes and confirms live state. Board Queue retains priority/readiness. Assignee rules retain their existing Board home. No shared status file gains a switch over initiative/epic/task/hot-fix lifecycle policies.

## Board Status and Lifecycle Boundary

The reviewed Style source is `c3d4f5b7bafba00096f71c8f53f213e57a264cba`. Status Changes is shared Guidance in Board Delivery; its earlier Fields placement below is historical evidence. The remaining issue is ownership of board-state derivation and permitted writes, not a missing field-format migration.

| Concern | Owning home | Extraction boundary |
| --- | --- | --- |
| Completion, readiness, review eligibility and unit-specific lifecycle conditions | Their subject artifacts | Supply confirmed subject decisions and evidence; the shared Board Status artifact gains no issue-kind switch. |
| Proposed board status or membership change and allowed write jurisdiction | Board Status artifact | Derive and validate a named change object from supplied state/decisions, with reason and blockers. |
| Evidence acquisition, applying calls, retries, readback and convergence | Board Delivery | Consume the public result and confirm saved board state. |
| Priority and readiness placement | Board Queue | Keep queue policy separate from delivery-derived lifecycle placement. |

W02 inventories the exact current clauses and consumers and records a destination for each. W06 defines the data shape and substantive derivation/validation capabilities; W07 and W08 consume them in the same joined change. Field links describe actual data, Commands owns enriched invocations and I/O contracts, and nested calls retain only selections, conditions and continuation. Context is linked at use, with no Prerequisites section or command invocation in a procedural step.

The audit assesses any remaining lifecycle coordination separately. A proposed protocol must identify one shared ordered sequence that changes several artifacts, its real callers, and its boundary with Issue Delivery and Issue Closure. If that sequence exists, plan its exact component and observing cases before dispatch. No umbrella `issue-lifecycle.md` is presumed merely to hold status rules; duplicating existing delivery/closure sequencing is not an extraction.

The observing cases retain completed versus other closure, review evidence, active versus inactive work, reservations, absent membership and subsequent-pass status, dependency blockers, and each write jurisdiction. Tests compare decisions and applied calls, including blocked/no-write results; they accompany the joined fixing PR. Any extra script or consumer component found by the audit receives its own row before dispatch, preserving the existing atomic contract/caller boundary.

## Audit Output

The full skill audit inventories every Fields section with file/heading, classification (shape, invariant, transformation or mixed), source evidence, supplied inputs, produced decision, proposed owner and disposition. It includes prose with no explicit step numbering or action verb. Confirmed extractions get owning component rows and observing tests before dispatch; valid constraints get an explicit acceptance rationale. New consumers found by the exhaustive caller search are added as one-component joined rows before the extraction starts.

## Delivery

The guideline row defines the boundary and owning audit questions. The audit applies them before the existing prose/script/one-home fixes. W06 creates Board Status, W07 rewires Board Delivery, and W08 fixes the known Hot-fix field consumer. These three rows are joined with identical external prerequisites and no Depends on edges between their members. Each declares one implementation file. They ship contracts, calls and regressions together. W09 consumes the completed extraction and supplies reusable candidate checking with its own fixtures; extraction regression tests are part of the joined extraction, not deferred to W09.

The audit resolves the shared script interfaces and subject-owned policy homes before implementation; reuse existing status functions where adequate. Any required additional implementation component receives its own row before dispatch. No new CLI, registry or abstraction is presumed by this plan.

## Verification

| Concern | Observing check |
| --- | --- |
| Guideline boundary | Review distinguishes schemas/invariants from derivation and execution; file-type sections link the one definition. |
| Candidate recall | Actual Status Changes text, paraphrased status derivation and a different subject’s multi-stage derivation under Fields are reported with file/heading and evidence, without hardcoding these heading names. |
| False positives | Valid enums/types, conditional invariants, IO/result definitions and fenced/HTML specimens remain accepted. Do not equate if/when, a sentence count or a keyword list with hidden behavior. |
| Structural enforcement | The shared checker fixtures reject executable calls, numbered procedures and command invocations under Fields; the installed Work Planner model selects the checks. Other skills are outside this acceptance scope. |
| Semantic coverage | The complete audit classifies every Fields section; review settles ambiguous candidates and records an owner/disposition. Automated candidate reporting does not claim complete semantic proof. |
| Call/contract integrity | Installed document/checkout readers resolve all new operations and Fields, ○/●/ƒ roles, linked context and executing commands. No old Status Changes anchor or forwarding declaration remains. |
| Status outcomes | Existing test_board.py, test_statuses.py, test_deliver.py and test_board_queue.py cases retain observed results for completed/non-completed closure, absent item/addition, active/inactive and review-ready state, reservations, dependency gates and incomplete/stale review evidence. |
| Write scope | Delivery cannot move initiatives/epics between Ready and Backlog; dispatch cannot remove items or set other statuses; task In Review remains refused. Membership, assignee calls, blockers, retry/readback and convergence are preserved. |
| Required completion | Full Work Planner and affected shared-checker suites, installed model check, source/caller preservation review and required disclosure verification. Tests observe decisions, calls and diagnostics rather than checking for copied prose. |

## Goal Trace

The added scope delivers initiative AC1 through E02 AC1/AC2/AC10 (rule and exhaustive audit), AC5 (one owning home), AC6–AC8 (artifact and unchanged caller behavior) and AC9 (candidate detection with valid counterexamples). Existing AC3/AC4 retain their general-file separation scope. E02 remains blocked on E01 W08 reaching workspace; this plan starts no delivery session.
