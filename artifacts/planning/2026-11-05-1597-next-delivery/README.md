# I17 delivery continuation — November 2026

> Delivery · Created 2026-11-05

## Executive Summary

Deliver the next eligible I17 work from Project 17 after the lane integration reaches workspace. The requested command presentation is recorded in E01.

The coordinator refreshes delivery, reservations and live board state before each start and preserves required integration review gates.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Progress](progress.md) | Delivery checklist and evidence |
| [Lane closure](lane-closure.json) | Verified epic completion |
| [Authorization](authorization.json) | Scoped delivery authorization |

## Links

| Resource | Link |
| --- | --- |
| Initiative | https://github.com/m2ux/workflow-server/issues/1597 |
| Skill Style | https://github.com/m2ux/workflow-server/issues/1616 |

## Family Conversion Refill

W01 and W02 are delivered into the epic base. The live queue converges with five eligible unlaned family units and W08 waiting for them. Three observed free slots select W03, W04 and W05; W06 and W07 await capacity. The current survey has no held, invalid, missing-evidence or unrecorded unit. Work Planner alone supplies the zero-finding acceptance gate.

| Artifact | What it holds |
| --- | --- |
| [Family batch](family-batch.json) | Three selected units and two awaiting capacity |
| [Family survey export](family-survey-export.json) | All five eligible unit identities |

| [Family progress](family-progress.md) | Current tasks, validation model, reader ownership and capacity |
| [Family sessions](family-sessions.json) | Observed worker identities for the held units |

| [Artifact family ownership](artifact-family-ownership.json) | Exhaustive, disjoint W05–W07 source manifest |

| [Remaining family batch](tail-batch.json) | W06 and W07 selected for observed capacity |
| [Remaining family survey](tail-survey-export.json) | Fresh eligible unit identities |
| [Selection session inventory](tail-selection-sessions.json) | W03 complete, W04/W05 retained |
| [Parent family review](family-parent-review.md) | Composed-source review, DRY corrections and pending evidence gates |
| [Validation boundaries](validation-boundaries.md) | Completed reader review, instrument correction and final activation checks |
| [Checkout call review](checkout-call-review.md) | Integration-owned caller corrections and preserved reader assertions |
| [Checkout call patch](checkout-call-fixes.patch) | Exact three-line caller correction |
| [Checkout proof](checkout-call-proof.log) | Ten passing focused tests in the combined candidate |
| [Checkout proof identity](checkout-call-proof.json) | Combined-source and caller-patch identities |

## Final Model Activation Admission

All seven conversion tasks are delivered. W06 is PR1651, merged as dfb00380a58ab3346b77b7780424831b2a12fde2 with the tested tree unchanged and fresh merged criterion evidence. The exact board item reads In Progress after closeout; the refreshed queue places the free epic Ready. That transition is applied and the queue converges with no pending calls. The survey offers only the unlaned W08 within I17; no hold or evidence error remains. Three observed free slots admit its one worker.

| Artifact | What it holds |
| --- | --- |
| [Activation batch](activation-batch.json) | One authorized unit |
| [Activation export](activation-export.json) | Current free unit and branch/worktree identities |
| [Current queue](activation-queue-confirmed.txt) | Applied, complete queue |

## Integration Graph Preparation

| Artifact | What it holds |
| --- | --- |
| [Capability evidence](graph-capability.md) | Preliminary full-surface/flow recovery and interface limits |
| [Parent audit](graph-capability-audit.json) |1197contexts/33flows/144steps, identity and freshness checks |
| [Archive manifest](graph-capability-manifest.json) | Exact safe members and hashes |
| [Native measurements](graph-capability-preliminary.tar.gz) | Reproducible preliminary data and executed instruments |

## Step Instruction Review

| Artifact | What it holds |
| --- | --- |
| [Step instruction format](step-instruction-format.md) | User clarification, single-home rule and verification plan |

## Current Integration Evidence

| Artifact | What it holds |
| --- | --- |
| [Integration verification](integration-validation.md) | Current command checks, composed criterion review and explicit evidence boundaries |
| [Agent review](integration-agent-review.json) | Current head and target, composed review scope and finding dispositions |
| [Measured flow atlas](integration-flow-atlas.md) | Current-head sequences for every reported affected process |
| [Native graph measurements](integration-graph.tar.gz) | Complete contexts, raw relationships, ordered flows and instruments |
| [Measurement manifest](integration-graph-manifest.json) | Archive members and hashes |
| [Graph audit](integration-graph-audit.json) | Current-head context/flow order and freshness |
| [Step item inventory](step-item-audit.json) | Every step and exact bullet-prefix correction |
| [Step preservation](step-preservation.json) | Exact procedure text, payload and route preservation |
| [Work Planner result](integration-work-planner.log) | 934-test Work Planner run with one opt-in skip |
| [Shared checker result](integration-shared-checker.log) | 270-test shared checker run |
| [Installed model result](integration-installed-check.log) | 58 files and zero findings |
| [Final document result](step-document-check.log) | 13 affected document checks |
| [Delivery reconciliation](integration-sync.log) | Sole expected unmerged integration base |
| [Epic readback](integration-epic-readback.json) | Saved specification, eight delivered rows and checked criteria |
| [Human handoff](integration-handoff.json) | Ready PR, exact In Review item, target rules and blocked successor |

## Contextual Contract Example

| Artifact | What it holds |
| --- | --- |
| [Approved example](contextual-contract-example.md) | Natural input/output prose and tagged callable links |

Runtime meanings live in [Link Roles](https://github.com/m2ux/workflow-server/blob/00ec0b9dd516cf6031d44c1ac2184ca95d1e0a01/skills/work-planner/rules.md#link-roles); the migration record owns the completeness check. Performed-operation verification is a future feature.

## Contextual Contract Migration

| Artifact | What it holds |
| --- | --- |
| [Approved migration](context-contract-migration.md) | Ownership, complete IO audit and implementation/verification sequence |

## Contextual Contract Evidence

| Artifact | What it holds |
| --- | --- |
| [Coverage audit](context-contract-audit.json) | 237 artifact operations and expected versus observed role links |
| [Revise command audit](context-revise-contract-audit.json) | Three additional command operations and their actual results |
| [Published review gate](context-review-gate.log) | Current integration head and target match the fetched published review |
| [Independent obligations](context-contract-ledger.json) | Original declarations reconciled with actual command argument contracts |
| [Reading review](context-reading-review.md) | Six independent bounded plans, observed failures and evidence limits |
| [Reading receipts](context-reading-evidence.tar.gz) | Exact preserved plans, read accounts and source/tool receipts |
| [Reading manifest](context-reading-manifest.json) | Archive member identities |
| [Initial source identity](context-initial-manifest.json) | First reading round, 115 frozen files |
| [Final source identity](context-final-manifest.json) | Second reading round and definitive full-suite source |
| [Source preservation](context-source-preservation.json) | Unchanged frozen trees and final integration equality |

## Symbol Link Titles

| Artifact | What it holds |
| --- | --- |
| [Symbol notation](symbol-link-titles.md) | Approved symbol mapping, scope, preservation check and validation |
| [Symbol preservation](symbol-preservation.json) | Exact title-only substitution and explicit rule clarification |
| [Callable audit](symbol-callable-audit.json) | Every protocol, procedure and artifact-operation title |
| [Contract audit](symbol-contract-audit.json) | Retained IO obligations through the symbol parser |
| [Symbol source manifest](symbol-source-manifest.json) | Current commit and all 115 source hashes |
| [Final document result](symbol-final-documents.log) | 13 passing checks after the rule clarification |
| [Migration instrument](project17-symbol-links.py) | Executed notation conversion and inverse preservation check |
| [Callable audit instrument](project17-symbol-callable-audit.py) | Executed protocol/procedure/operation enumeration |
| [Rule clarification instrument](project17-symbol-rule-clarification.py) | Exact final runtime definition and recorded exception |
| [Symbol review gate](symbol-review-gate.log) | Fetched published review matches current head and target |

## Command Quoting

| Artifact | What it holds |
| --- | --- |
| [Command quoting](command-quoting.md) | Typed argument scope, required quotes and verification |
| [Command quote audit](command-quote-audit.json) | Every removed quote pair, typed rationale, argv comparison and retained quoting |
| [Command quote instruments](command-quote-instruments.tar.gz) | Executed inventory, conversion and exact-delta verification scripts |
| [Command source manifest](command-quote-source-manifest.json) | Current commit and 115 verified source hashes |
| [Final quote document check](command-quote-documents.log) | 13 passing document tests after the final guideline wording |
| [Command review gate](command-quote-review-gate.log) | Published current-head review matches the ready PR and target |

## Command Contracts

| Artifact | What it holds |
| --- | --- |
| [Command contracts](command-contracts.md) | Authoritative command links, prose deduplication and multiline shell verification |

| [Contract audit](command-contract-audit.json) | 240 operations, 824 inputs, 361 outputs and 204 preserved invocations |
| [Independent obligations](command-contract-ledger.json) | Baseline contracts reconciled independently from annotations |
| [Removed parameter lists](command-prose-removals.json) | Pure duplicate introductory lists |
| [Retained semantic prose](command-semantic-prose.json) | Sentence-level usage preservation and remaining intro review |
| [Flag prose review](command-flag-review.json) | Removed glosses and retained argument-use semantics |
| [Continuation audit](command-wrap-audit.json) | Readable wrapping and literal command preservation |
| [Branch prefix audit](command-branch-prefix-restoration.json) | Original unrelated branch-prologue bullets retained |
| [Source identity](command-contract-source-identity.json) | Reader snapshots, final commit equality and refinements |
| [Initial manifest](command-contract-initial-manifest.json) | Exact 115-file reader snapshot |
| [Final manifest](command-contract-final-manifest.json) | Exact 115-file committed source |
| [Reading review](command-contract-reading-review.md) | Two independent plans and explicit Partial limits |
| [Reading evidence](command-contract-reading.tar.gz) | Raw receipts, plans and frozen source trees |
| [Reading manifest](command-contract-reading-manifest.json) | Reading archive identities |
| [Executed instruments](command-contract-instruments.tar.gz) | Conversion, tests, preservation and publication instruments |
| [Instrument manifest](command-contract-instruments-manifest.json) | Exact instrument archive identities |
| [Published review gate](command-contract-review-gate.log) | Fetched current-head review matches the ready PR and target |

## Field Format Examples

| Artifact | What it holds |
| --- | --- |
| [Field format examples](field-examples.md) | Field-owned fenced examples, command specimen relocation and preservation checks |
