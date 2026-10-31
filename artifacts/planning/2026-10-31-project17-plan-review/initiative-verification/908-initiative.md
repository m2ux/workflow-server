## Overview

This initiative settles where an agent's standing contract lives. A definition describes work and stays corpus content. A role contract describes how to be the agent that walks a definition, is identical on every run of every workflow, and belongs in the mechanism a host already keeps standing instruction in — a skill, one per role. What that leaves the technique system holding is definitions and nothing else.

## Problem

Both kinds of content arrive the same way, as techniques resolved into a workflow-server tool response, because the technique is the only construct those responses carry. The opening `get_workflow` call is therefore 163,684 characters of role contract around 1,595 characters of workflow, against a stated budget of 172,000 and a 60,000-character bound on a single tool result that the call exceeds and the server only logs. A worker pays a separate 47,650-character baseline, once per identity a run dispatches under.

The cost is structural rather than untidy. The channel that delivers the contract needs a session, and opening a session is itself part of the contract, so the server breaks the circle by returning one corpus resource raw and a guard polices what that text may contain — on that one surface a corpus link, a dotted rule address and a bare rule name are all refused, though the house style sanctions each of them everywhere else. All four harness adapters ship on every run, 11,276 characters of them describing a host the run is not on, because the value that would select one has no producer anywhere except the running agent's own observation. And a single fact cannot be sent to a single reader at all: a rule cannot be requested by reference, so selective delivery exists only as resource section citation, and a 2,993-character file costs 7,449 characters to deliver. Several server mechanisms — a delivery ledger, conditional bundles, a withheld fan-only rule, a fetch bound — are progressive disclosure hand-built inside a channel with no native form of it.

## Proposal

State the cut in writing, with the separating question being whether a workflow author could ever write the content differently. Deliver the two role contracts as one skill per role, shipped as a skill directory per host format through the install path the workspace template already has. Give the shared operations that client workflows genuinely bind a library at the corpus root. Keep the one guarantee server delivery gives for free — a contract that cannot disagree with the server serving it — through a version handshake at bootstrap. Guard role content where it lives, and retire the server mechanism that exists only to deliver it.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/868) | Role Skills | AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC9 | | |
| [E01](https://github.com/m2ux/workflow-server/issues/954) | Host Smoke Runs | AC6, AC7 | [E00](https://github.com/m2ux/workflow-server/issues/868) | |

## Acceptance Criteria

- [ ] **AC1.** The fixed block an orchestrator reads before its first decision holds only the workflow definition plus the session response, as the budget test measures it against the baseline.
- [ ] **AC2.** The opening `get_workflow` call stays under the single-tool-result bound, as the budget test measures it.
- [ ] **AC3.** No run receives adapter text for a host it is not on, as the budget test shows the fixed block carrying none.
- [ ] **AC4.** The technique system holds definitions and nothing else, as the binding-census guard reports no technique bound only by the meta workflow and the conformance specimens.
- [ ] **AC5.** Every operation a client workflow binds resolves outside the meta workflow, as the binding-census guard reports.
- [ ] **AC6.** Every host format on the supported-hosts list runs from role skills the workspace deploy installs, as a smoke run on each listed host shows.
- [ ] **AC7.** The workspace deploy's refresh brings every installed role skill to the version its server requires, as a smoke run after a refresh shows the bootstrap handshake passing.
- [ ] **AC8.** No run proceeds on a role skill older than the version its server requires, as the bootstrap walk against a lagging skill shows.
- [ ] **AC9.** Every guard whose subject is role content fails on a violation seeded in a role skill file, as each such guard's test shows.

## Non-goals

- Changing how any expression is evaluated, any gate is decided, or any activity is walked.
- Replacing the agent that walks a definition with a program.
- The duplicated ancestor-group contract.
- Changing the domain technique files, which stay definitions.
- The workflow-design skill and the definition language it describes.

## References

- **R1.** [Roles as skills](https://github.com/m2ux/workflow-server/issues/868) — E00, the epic this initiative opens with.
- **R2.** [Measurements, census and method](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-09-21-roles-as-skills/survey.md) — The delivery figures, the per-operation marginals and the technique census.
- **R3.** [Vocabularies as techniques](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-09-21-vocabularies-as-techniques/survey.md) — The survey whose findings E00 builds on.
- **R4.** [Workflow Runner](https://github.com/m2ux/workflow-server/issues/527) — I00, whose runner does most of what an orchestrator skill teaches, while a worker skill keeps its job under it.
- **R5.** [Workflow Design](https://github.com/m2ux/workflow-server/issues/936) — I07, whose workflow-design skill reuses this initiative's skill install path and version check.
