# Ownership, Fields and Required Context Audit

This W02 audit covers the installed Work Planner architecture at `86df5e4c2ccc2516b46cb0be7cf89e1cc258480f`, including W01 guidelines and integrated E04 recovery/merge contracts. It supplies AC2's findings/owners, AC10's complete Fields classification and AC17's four individually confirmed policy decisions. It implements no source fix or pause behavior. Publication and saved tracker reconciliation belong to the coordinator.

## Source and Coverage

- [Source manifest](source-manifest.json): 84 governed files, comprising 58 Markdown documents, 23 scripts and three model declarations. This includes 35 artifacts, ten modes, seven protocols and five root documents. Tests are separate observing instruments, not counted as production skill contracts.
- [File ledger](file-ledger.json): every governed file has a source hash, reviewed responsibility and finding disposition. [Script index](script-index.json), [kind candidates](script-kind-candidates.json) and [exact clones](exact-function-clones.json) retain concrete source locations.
- [Fields ledger](fields-ledger.json): all 518 third-level Fields headings across 36 documents retain complete current text, line bounds, classification, owner and disposition. Classification is 490 shape, 27 invariant and one mixed boundary. The [readable ledger](fields-ledger.md) indexes every heading.
- 448 current field bodies match the prior reviewed contracts after whitespace normalization. The remaining 70 changed/new contracts were read separately, including E04's changed Merge Result and new Merge Response/Merge State shapes. Reuse is limited to matching current text; moved historical policies are not carried forward as present defects.
- [Refresh receipt](source-refresh.json): initial `3cf01bfe28cf16d24b823cd97bda907e85992dc8` evidence remains under [baseline receipts](baseline-3cf01bfe/). Both it and E04-integrated workspace `50da3794d96e816a1938e1643a0f79fc0596bc37` are verified ancestors. The seven-file tree delta changes three governed documents, all reviewed completely. E04's fixes are delivered. E05 publication correction remains separately under review, outside this source pin.

Review applies the delivered SOLID, rule ownership, Fields/callable transformation, required-context and script-module guidelines. Source inventories support the semantic review; counts of candidates are not counts of defects. A literal kind example, API direction, git object type, closure finding category or conditional schema is not automatically a violation.

## Findings and Owners

The [finding ledger](ownership-findings.json) retains exact source locations, the governing guideline, owner, concrete files and disposition for each entry. [Component map](component-map.md) connects these findings to the existing E02 rows and identifies necessary refinement before implementation dispatch.

| ID | Finding | Owner and disposition |
| --- | --- | --- |
| A01 | Board Delivery's Status Changes is Guidance, but combines lifecycle policy, proposed status derivation and write jurisdiction. | Subject owners supply lifecycle decisions; planned Board Status owns changes/jurisdiction; Board Delivery applies/readbacks. Preserve the joined W06–W08 boundary and explicitly cover necessary script components. The historical Fields placement is resolved. |
| A02 | General delivery, placement and merge prose enumerates concrete hot-fix alternatives. | General family contracts consume the existing kind registration's published operation; concrete kinds own additional rules. Refine W03 into exact files with callers/results preserved. |
| A03 | General scripts retain inline kind detection, grammar and policy branches. | One owning registration and kind modules expose the common interface; refine W04 by actual file. Existing hotfix.py is a concrete owner, not proof every caller is separated. |
| A04 | Tag parsing, completion predicates and issue identity have exact executable duplicates; priority is interpreted separately. | Reuse subject-owned capabilities. The inspected #1631/#1645 head already supplies priority.py; consume it after upstream refresh. Identical git wrappers alone are plumbing, not a confirmed policy defect. |
| A05 | Four inherited policy ambiguities require explicit decisions. | All four decisions are confirmed below. P1/P3/P4 remain E02 clarification fixes; P2 runtime delivery belongs to the dedicated concern. |
| A06 | Retained Unit Dispatch selects creation unconditionally at this pin. | Unit Dispatch chooses new/retained continuation; Delivery Branches validates identity. W10 consumes the existing upstream correction after W09, without duplicating its helper. |
| A07 | Dependency Graph's Edges field embeds reader reporting, row preservation and nonzero-exit behavior. | Keep shape/resolvability invariants in Fields; place observing behavior in the owning callable validation contract/shared subject Guidance. Preserve every reader and negative outcome. |
| A08 | Historical Fields/prerequisite inventories and their cycle were retired by delivered Style work. | Preserve provenance and regression examples. Do not reopen them as current findings or infer a preload from every link. |
| A09 | Normal code-PR dispatch has no honest workspace file for an engineering-only audit. | User approved W02's published engineering audit commit as a one-task delivery exception. Use its commit reference; introduce no artificial code change or global configuration. |
| A10 | The newly approved Backlog pause/cascade behavior is absent from the audited runtime. | Dedicated I17 E06 owns behavior, tests and integration. E02 owns the decision/evidence and retains its ownership-fix baseline. This approved feature gap is distinct from an introduced regression. |

## Required Context

[Context review](context-review.md) traces direct/nested Standup, Revise and Understand entry paths. [Context ledger](context-ledger.json) records 42 explicit before-use edges and all 22 read/before/whole sentence candidates. [Link inventory](links.json) records 2,209 local-link occurrences. A capability annotation denotes a capability; it does not by itself execute it or preload all siblings.

The refreshed explicit ordering graph has no cycle witness. The historical 242-edge/13-artifact prerequisite inventory belongs to earlier source and is retired. Ordinary definition links, conditional input resolution, explicit evidence-before-write contracts and bounded retry routes are valid controls, not automatic context cycles. A broad or truncated reader receipt alone proves neither a source-required cycle nor a performance improvement.

W05 fixes still require at least two independent fresh-context trials for each affected supported Standup, Revise and Understand route against final source and immutable inputs. This audit's structural route review is not relabeled as those future trials. W09 diagnostics must discriminate hidden transformations and explicit ordering cycles from valid schemas, definitions and retries.

## Approved Policy Decisions

[Decision packets](policy-decisions.md) retain the matching source/context, observed behavior, distinguishing scenarios, exact selections and P2 supersession. [Machine-readable decisions](policy-decisions.json) record confirmation for P1–P4.

| Policy | Final user selection | Delivery |
| --- | --- | --- |
| P1 automatic answers | “Save, verify, recompute, then continue (Recommended)” | Advance saves allowed automatic answers, reads back and recomputes; continue only with a complete refreshed queue. Held/unanswered remains pending. A recorded answer alone proves no saved/completed state. |
| P2 Backlog descendants | “in-progress work is paused and everything moves to backlog with its initiative”; “Completed children remain Done (Recommended)” | Backlog selects every unfinished descendant, including In Progress/In Review; ongoing work cooperatively pauses. Done remains terminal. This supersedes the earlier current-behavior selection and migrates to E06. |
| P3 diagram count | “Allow faithful smaller diagrams (Recommended)” | Five to ten is a readability target; faithful smaller measured structures are valid. Do not pad; split complex measured diagrams by concept. |
| P4 hot-fix scope | “Separate linked issue; fix change-related defects in the hot-fix (Recommended)” | Introduced defects and affected-caller risks compromising the change remain blocking and are fixed. Unrelated prior observations need scope evidence and a linked arising issue outside the finding collection. A real defect cannot be relabeled to pass. |

P4 is an ambiguity about collection membership, not a demonstrated same-input contradiction between validators. Its owner must preserve the actual validator rule that every in-scope hot-fix finding is fixed.

## Actual Observations

- [Queue captures](policy-observations.json) execute eighteen local scenarios against the actual queue code. Automatic ordering moves from unresolved decision to saved-priority proposal to converged current state. With protected work, displacement and explicit unplanning both retain an In Progress parent and park idle Ready siblings.
- The first audit inference that explicit unplanning preserved every sibling was incorrect: full `decide` invokes `wait` before `park`. The packet preserves that correction and the actual outputs rather than discarding the disagreeing observation.
- With an actual Backlog parent, current queue code backlogs a Ready child, leaves a Backlog child, and exempts In Progress/In Review; Done stays terminal. This state is distinguished from an attempted transition whose parent remains In Progress.
- [Pause captures](pause-observations.json) show that a passing task PR can remain a merge candidate under captured Backlog parent/epic state and that observed dispatch inventory rejects `paused`. They establish missing admission/session behavior, not an actual worker pause.
- [Review captures](agent-review-observations.json) use the real local checker on four concrete finding collections. [Diagram receipt](diagram-observations.json) measures the actual three-node template, grounding P3 in faithful source rather than invented padding.

All probes are offline over captured inputs. They perform no GitHub writes, real merge or worker cancellation. Recorded command proposals are output, not evidence that those mutations ran.

## Dedicated Backlog Pause Plan

[Pause design](pause-design.md) defines ordered admission blocking, cooperative checkpoint acknowledgement, readiness withdrawal, cascade/readback and same-session resume. Holds, record/worktree/branch/head/PR identity and owned work survive; a requested pause or state label supplies neither acknowledgement nor freed capacity. Missing sessions or changed checkpoints block without destructive repair or duplicate dispatch.

The [E06 epic draft](e06-epic-draft.md), [metadata](e06-metadata.json) and nineteen `e06-work-items/` documents provide exact one-file components and unique criteria in four joined units of six, six, four and three. There is no late validation-only task, feature flag or compatibility layer. Epic integration waits for the full behavior and current review evidence.

E06 is priority 6 within existing I17. It consumes finalized E02 separation/state/unit contracts and E04 merge/recovery outcomes. The coordinator derives final whole-epic edges from the refreshed complete task graph after E02 component refinement; E05 is not an implementation prerequisite. Same-file contention must be checked against actual producer ancestry before dispatch.

[E02 migration](e02-migration.md) and the [full body draft](e02-migration-body.md) narrow AC5 to rules retained in the ownership-fix scope while preserving its source-search and approved-scenario instruments, IDs, task rows and holds. This prevents E06 depending on E02 while E02 waits for E06. [Initiative addition](initiative-addition.md) supplies the parent row with a deliberate unresolved issue-URL placeholder for the coordinator to replace after record publication and issue creation. Refresh downstream extraction prerequisites after the new identity/final producer graph exists.

## Verification and Limits

Run `python3 verify.py --project /path/to/workflow-server` from any checkout containing the recorded commit. [Verification log](verification.log) verifies every source hash/line count, complete Fields coverage/classification fields, all four decisions, source ancestry and E06 component/criterion coverage. The installed skill checker result is recorded separately in [checker log](checker.log).

These checks prove inventory integrity and bounded coverage, not semantic correctness of every classification or every possible runtime path. The audit records no live tracker save, current PR readiness, measured token saving, implemented pause, or W02 completion before its engineering evidence is published. Final formatting/dependency validation and saved tracker readback use the actual new issue identity and freshly read bodies; draft placeholders are not fabricated saved state.
