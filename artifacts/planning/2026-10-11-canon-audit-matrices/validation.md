# Canon Audit Matrix Validation Plan

## Evidence Status

This document specifies implementation checks. Current implementation results and retained evidence are recorded in [Implementation](implementation.md). Planning verification is recorded separately under [Planning Review](#planning-review).

## Inspected Inputs

| Input | Captured revision |
| --- | --- |
| Workspace skill | `741626a96d9e854429798b68b05ae73d012d1ce5` |
| Engine checkout | `2a7cd4be437dbfbba13ced7179fb2a9272769629` |
| Corpus checkout | `e70b44778f71d9d699f746f78a16b892531c82d3` |

The corpus has 161 AP entry headings and 47 numbered DP headings at this revision: 208 criterion columns for each logical row. These are measured counts, not dispatch defaults. The source identity and the criterion wording remain authoritative.

## Evidence and Design Consequences

| Observed source | Fact | Design consequence |
| --- | --- | --- |
| [Audit's walk and ledger](https://github.com/m2ux/workflow-server/blob/741626a96d9e854429798b68b05ae73d012d1ce5/skills/workflow-canon/references/audit-mode.md#walk) | Criteria and whole-file reads are tracked; the stop rule also accepts blocked entries. | The new gate distinguishes stopped work from complete verified coverage. |
| [Definition scope](https://github.com/m2ux/workflow-server/blob/741626a96d9e854429798b68b05ae73d012d1ce5/skills/workflow-canon/references/definition-scope.md#scope) | Resources and READMEs are in scope; routines are absent from the explicit path list. | Preserve supporting material and enumerate routines explicitly. |
| [Protocol and rules schema](https://github.com/m2ux/workflow-server/blob/2a7cd4be437dbfbba13ced7179fb2a9272769629/src/schema/technique.schema.ts#L45) | Protocol steps are strings and blocks are positional; rule groups may contain multiple strings. | Use qualified audit-local addresses and independently verified clause decomposition. |
| [Routine contract](https://github.com/m2ux/workflow-server/blob/2a7cd4be437dbfbba13ced7179fb2a9272769629/src/schema/routine.schema.ts#L90) | Routine sections differ from activity sections. | Derive section inventories per type rather than impose one fixed section list. |
| [Technique composition](https://github.com/m2ux/workflow-server/blob/2a7cd4be437dbfbba13ced7179fb2a9272769629/docs/technique.md#what-merges) | Ancestor inputs, outputs and rules contribute to the executing contract; Protocol is local. | Inventory declarations and affected composed relationships separately. |
| [DP identity](https://github.com/m2ux/workflow-server/blob/e70b44778f71d9d699f746f78a16b892531c82d3/corpus/canon/resources/design-principles.md#L11) and [AP identity](https://github.com/m2ux/workflow-server/blob/e70b44778f71d9d699f746f78a16b892531c82d3/corpus/canon/resources/anti-patterns.md#entry-identity) | DP ordinals are stable; AP numbers describe file order and citations use names. | Keep display aliases distinct from authoritative criterion identity. |
| [Author criterion routing](https://github.com/m2ux/workflow-server/blob/741626a96d9e854429798b68b05ae73d012d1ce5/skills/workflow-canon/references/canon-map.md#file-kinds) | The skill names Fires-on lookup; the inspected AP/DP files have no per-entry Fires-on lines, and this engine checkout has no `guards/list-fires-on.ts`. | Require full inventory from canon sources; optional routing metadata cannot determine matrix membership. |

The first evidence sweep ran as an independent read-only agent. The parent checked the protocol schema, routine schema, technique merge rules, criterion identity text and catalog counts directly before incorporating the findings.

## Planned Instruments

Each implementation unit carries the tests for its own behavior. A fixture's expected inventory, findings and exclusions are authored independently of the generator under test.

| ID | Method and meaningful cases | Coverage |
| --- | --- | --- |
| T1 | Capture two drafts at one Git commit, a canon edit at one path and modified tool bytes under the same version; prove distinct identities and reject result replay across them. | AC1 |
| T2 | Compare inventories with independently enumerated fixtures covering all four types, nested duplicate IDs, unidentified clauses, missing sections, malformed but addressable source, deleted targets, unresolved references, inherited contracts under two executing workflows, a parameterized routine invoked with two techniques, shared resources and a namespace README with no workflow definition. | AC2 |
| T3 | Independently enumerate the captured AP/DP headings; add, remove and reorder an AP entry and append a DP. Require complete identities and an explicit alias map without relying on Fires-on. | AC3 |
| T4 | Render small and wide matrices, including an empty type. Reconcile all table parts to the exact row–criterion product; introduce a missing cell, duplicate cell, missing band and stale Markdown to prove rejection. | AC4 |
| T5 | Submit A, N and U mappings with source and criterion evidence. Reject an unsupported exclusion, an unresolved reason presented as N, and a generic reason that does not cover every claimed row. | AC5 |
| T6 | Give fresh verifying agents a plausible map with a dropped source clause, omitted dependency, missing criterion and incorrect exclusions. Require full correction and independent receipts before evaluation dispatch. Reject self-verification and sampled verification as insufficient. | AC6 |
| T7 | Exercise completion with one unread file, one unverified N, one U, one unevaluated A, a blocked required check, an unverified High, and stale evidence. Each remains incomplete. A fully verified audit with a confirmed violation is complete coverage with a failing conformance verdict. | AC7 |
| T8 | Return valid, partial, duplicate, extra, stale and unsupported cell results. Only current owned evidence is accepted; useful partial results survive without completing missing obligations. | AC8 |
| T9 | Measure a representative pilot and partition heterogeneous local, whole-element and relationship work. Prove each dispatch respects context and effort budgets, retains relationship context, and identifies an indivisible over-budget bundle. Record estimates separately from observed costs. | AC9 |
| T10 | Independently compute the required sets for mapping, verification and evaluation. Compare unions and intersections of assignments; missing and overlapping primary ownership fail. | AC10 |
| T11 | Interrupt a worker mid-return; restart the coordinator with lower concurrency and a changed pending task. Complete the exact residual without losing receipts or counting retries twice. Exercise zero independent slots as a blocked map gate. | AC11 |
| T12 | Run fresh Author and retrospective Audit agents through the skill with realistic scope and authority. Inspect actual reads and tool returns, including independent verification and the bounded single-canon-question path. Repeat affected scenarios as skill disclosure guidelines require. | AC12 |
| T13 | After accepted results, edit an input contract, an inherited rule, a routine binding, a control-flow edge, a resource section and a canon criterion; reorder positional clauses; change a mapping decision or rationale without changing source bytes; and correct inventory membership. Dependent receipts and results become stale and completion waits for current verification. | AC13 |
| T14 | Run seeded and clean examples through both modes repeatedly. Expected defects cover a standalone item, a later compound clause, a whole-element invariant, an untouched consumer, a routine instance and an inherited contract. All seeded defects must be detected and confirmed; clean controls must remain clean before qualification passes. | AC14 |

## Behavioral Qualification

Use the same representative specimens, canon revisions, authority limits and runtime conditions for the existing skill and the proposed skill. Preserve actual source reads, verified mappings, assignments, worker returns and findings. Report seeded-defect recall, missed findings, false positives, coverage refusals, elapsed time and measured tool/context costs; do not infer model-token savings from source size.

Compare the completed first evaluation of a verified map with the known reference outcomes. A later pass discovering another seeded violation fails the first-pass qualification case and requires correcting the mapping, assignment or evaluation procedure responsible. Successful fixtures support claims about those cases; they do not prove that semantic judgment cannot miss an unknown defect.

Validation uses the completed CLI lifecycle and agent behavior, not a string test that merely finds the new wording. Run the skill's relevant existing checks, summary tests, edit-guard tests, local-link/frontmatter validation and fresh-context disclosure checks for every changed entry path. Broader engine or corpus checks apply only if implementation changes their consumers or invokes those checks as part of the run.

## Planning Review

| Review | Status | Evidence |
| --- | --- | --- |
| User decisions | Complete | D1–D6 in the [plan](plan.md) record each answer; no recommendation is treated as an answer. |
| Source evidence | Complete | Independent evidence sweep plus the parent's targeted source checks listed above. |
| Requirement trace | Complete | Every R1–R9 and D1–D6 maps to criteria and delivery work in the [plan](plan.md); every criterion has delivery and observing work. |
| Independent design review | Complete | The read-only reviewer confirmed the seven substantive corrections below. Its remaining optional sizing formula concern is also resolved. |
| Artifact links and task coverage | Passed | Read-only validation returned 9 Markdown artifacts, 18 valid local links, 14 criteria, 5 dependency-ordered tasks and 14 planned checks; README membership and criterion coverage reconcile exactly. |

### Review Corrections

| Finding | Resolution in the plan |
| --- | --- |
| Editing applicability or its rationale can leave source hashes unchanged. | Mapping fingerprints bind the decision, reason and dependencies; changes invalidate verification and dependent work. |
| Shared canon material can belong to no workflow. | Supporting rows admit workflow, namespace and repository owners while preserving the actual content type. |
| Invalid definitions still need an audit. | Raw-source spans and diagnostics preserve auditable defects; only unresolved inventory or applicability blocks the map gate. |
| Draft evaluation needs bytes before the working-tree edit. | Author captures candidate bytes, verifies and evaluates them, applies those exact bytes, then checks byte agreement and project checks. |
| Assignment estimates need units and a precise count. | Context/output use tokens, work uses measured seconds, phases calibrate independently, and assignment count comes from the final partition. |
| Technique composition and execution context both affect relationship evidence. | Relationship identity includes the defining namespace, executing workflow and full routine-site chain; the implementation checks actual engine composition and distinct caller contexts. |
| Tool version does not identify modified tooling. | Snapshot identity includes the tooling revision and modified-file hashes. |
| Shared context prevents an additive pre-packing estimate from being a guaranteed lower bound. | The optional work-count formula is absent; final budget-compliant assignments determine the count. |

The first static validation attempt could not create a bubblewrap namespace. The same read-only checks ran successfully under `sbx` with host permissions. This is planning-artifact validation, not execution of T1–T14 or evidence that the proposed skill has been implemented.
