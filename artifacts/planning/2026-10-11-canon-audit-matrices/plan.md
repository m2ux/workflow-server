# Canon Audit Matrix Plan

## Status

Design and planning review are complete. This record specifies the skill change; implementation has not started.

Planning root: `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-audit-matrices/`, on the existing engineering worktree.

## Progress

- [x] Inspect the current audit, authoring, scope and reporting instructions.
- [x] Settle the scope, applicability, verification and supporting-script decisions through one question at a time.
- [x] Settle the identifier gap found during source inspection.
- [x] Complete the design, delivery breakdown and acceptance criteria.
- [x] Review the plan against the confirmed requirements.
- [x] Prepare the reviewed planning record for commit and push.

## Requested Requirements

| ID | Requirement |
| --- | --- |
| R1 | Create change-surface Markdown documents in the planning folder before an audit pass, one for each element type: workflow, technique, routine and activity. |
| R2 | Each document contains section-specific tables, including inputs, outputs, rules and the other sections its element type defines. |
| R3 | Tables map element item identifiers on one axis to AP and DP identifiers on the other, showing which criteria apply to each part of the change surface. |
| R4 | Check the completed maps for accuracy before agents evaluate violations. |
| R5 | Use the maps to assign agents the evaluation and authorized resolution of violations. |
| R6 | Calculate the number and distribution of agent assignments for a large surface. |
| R7 | Make the method available both to agents authoring changes and agents auditing existing changes. |
| R8 | Resolve open questions through the Work Planner interview style, one question at a time; unanswered questions remain open. |
| R9 | An audit is complete only when the entire mapped change surface has been verified. |

## Confirmed Decisions

| ID | Decision | Evidence |
| --- | --- | --- |
| D1 | The maps cover whole-element checks and affected relationships, including callers and consumers outside the changed files. | User selected option 1 in the scope interview on 2026-10-11. |
| D2 | Any unverified portion of the mapped change surface keeps the audit incomplete. | User stated the completion requirement on 2026-10-11. |
| D3 | Every matrix row accounts for every AP and DP criterion with an applicable, not-applicable-with-reason, or unresolved disposition. | User selected option 1 in the applicability interview on 2026-10-11. |
| D4 | Independent agents verify the entire applicability mapping, including exclusions; discrepancies are resolved before the audit starts. | User selected option 1 in the mapping-verification interview on 2026-10-11. |
| D5 | The planned change includes skill instructions and supporting scripts for inventories, matrix generation, coverage checks and assignment sizing; agents judge applicability and violations. | User selected option 1 in the implementation-scope interview on 2026-10-11. |
| D6 | Use native identifiers where available and deterministic audit-local identifiers bound to the source revision for other items. | User selected option 1 in the identifier interview on 2026-10-11. |

## Current Evidence

The inspected skill revision is `741626a96d9e854429798b68b05ae73d012d1ce5` on the workspace branch.

| Source | Observation | Planning consequence |
| --- | --- | --- |
| `skills/workflow-canon/references/audit-mode.md:15–28` | The procedure enumerates criteria and splits unread paths when the surface cannot be read in one pass. | Specify how validated mappings drive assignment size and boundaries. |
| `skills/workflow-canon/references/audit-mode.md:41–52` | Criterion dispositions and whole-file reads are tracked separately. | Define explicit applicability and evaluation coverage at section-item grain. |
| `skills/workflow-canon/references/definition-scope.md:8–20` | The surface list omits routines; closure descriptions name activities and techniques. | Include routine structure and its relationships in the shared scope definition. |
| `skills/workflow-canon/references/canon-map.md:31–33` | Author selects units by construct, while Audit walks every unit regardless of Fires-on. | Set a shared mapping contract that preserves exhaustive audit coverage. |
| `skills/workflow-canon/references/reporting.md:48–81` | The coverage ledger lists divergences; blocked criteria keep report status in progress. | Reconcile map coverage with report completion and preserve unresolved work. |
| `skills/workflow-canon/references/author-mode.md:17–50` | Author walks drafts, checks written changes and follows changed contracts. | Define how maps relate to drafts and how edits invalidate affected evidence. |

## Design

The [design](design.md) specifies the artifacts, identities, complete matrix, independent verification, agent assignments, authoring cycle and completion gates. Supporting resources and READMEs have explicit rows in the workflow document's supporting-material section, grouped by their actual workflow, corpus namespace or repository owner; their callers have relationship rows. This preserves the existing audit surface within the four requested type documents.

The implementation belongs to the workspace branch's `skills/workflow-canon/`. Existing engine parsers and corpus definitions supply read-only inputs. Persistent definition identifiers, engine/schema changes, corpus migrations and autonomous publication by audit workers are outside this skill change.

## Acceptance Criteria

All criteria describe planned behavior. None is marked implemented or tested by this planning record. The named instruments are specified in the [validation plan](validation.md) and delivered with the task that introduces the behavior.

| ID | Observable condition | Instrument |
| --- | --- | --- |
| AC1 | Every audit run identifies the exact source, canon and tool bytes on which its evidence depends. | T1 snapshot identity cases |
| AC2 | The inventory accounts for the complete scoped source surface, including the four element types, supporting material, whole-element rows and affected relationships. | T2 independently enumerated inventory fixtures |
| AC3 | The criterion inventory accounts for every AP and DP at the captured canon revision. | T3 canonical inventory comparison |
| AC4 | The four type documents contain section tables whose cells exactly cover their row-by-criterion products. | T4 rendered matrix reconciliation |
| AC5 | Each mapping disposition identifies the source evidence and criterion wording that justify it, or identifies what remains unresolved. | T5 mapping receipt cases |
| AC6 | The audit-start gate opens only after independent verification of the entire inventory and applicability mapping, including exclusions, with all discrepancies resolved. | T6 adversarial mapping verification |
| AC7 | The audit-completion gate opens only when the entire current mapped surface and retained audit obligations have been verified. | T7 completion refusal cases |
| AC8 | An accepted evaluation result carries valid assignment ownership, current revision identity and evidence for its cell. | T8 worker result ingestion cases |
| AC9 | Every dispatched assignment fits the declared context and work budgets while retaining the context needed for its checks. | T9 bounded assignment fixtures and calibration walk |
| AC10 | The primary assignments in each phase cover that phase's required cell set exactly once. | T10 exact assignment coverage checks |
| AC11 | Interrupted, failed or unavailable workers leave their unresolved work visibly incomplete until valid results arrive. | T11 interrupted dispatch and resume walk |
| AC12 | Author and Audit use the same mapping and verification lifecycle within their existing edit authority. | T12 fresh-context Author and Audit walks |
| AC13 | Changes to a result's source, relationships, canon or mapping dependencies invalidate that result before it can support completion. | T13 source, canon and mapping mutation cases |
| AC14 | Repeated representative agent runs satisfy independently specified expected findings and clean controls. | T14 seeded behavior evaluation |

## Work Breakdown

Each row is a reviewable implementation unit with its own observing checks. Dependencies name the artifacts consumed by the next unit; all rows form one chain, so there are no independent pairs requiring a join decision.

| Task | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [W01](w01.md) | Complete source and criterion inventories | AC1, AC2, AC3 | | |
| [W02](w02.md) | Section matrices and mapping evidence | AC4, AC5 | W01 | |
| [W03](w03.md) | Independent verification and coverage gates | AC6, AC7, AC8 | W02 | |
| [W04](w04.md) | Bounded assignments and durable worker results | AC9, AC10, AC11 | W03 | |
| [W05](w05.md) | Shared authoring and retrospective audit lifecycle | AC12, AC13, AC14 | W04 | |

## Requirement Coverage

| Requirement or decision | Plan coverage |
| --- | --- |
| R1, R2, R3, D3 | AC2–AC5; four generated type documents, section tables and complete criterion accounting |
| R4, D4 | AC5, AC6; complete independent mapping verification before auditing |
| R5 | AC8, AC12, AC13; cell-level findings, authorized fixes and re-verification |
| R6 | AC9–AC11; measured assignment sizing, explicit seams and durable dispatch |
| R7 | AC12–AC14; shared lifecycle exercised through both modes |
| R8 | D1–D6; every question has a user answer recorded above |
| R9, D2 | AC7, AC11, AC13; no incomplete or stale evidence supports audit completion |
| D1 | AC2, AC9; whole-element and affected relationship coverage |
| D5 | W01–W05; supporting scripts and skill instructions |
| D6 | AC1, AC2; native IDs and qualified audit-local addresses |

## Remaining Decisions

The interview has no unanswered question. Runtime context limits, available concurrency and measured per-assignment work costs are inputs to each audit run, not fixed values inferred during planning. Qualification measures suitable working limits before the skill claims reliable dispatch at that scale.
