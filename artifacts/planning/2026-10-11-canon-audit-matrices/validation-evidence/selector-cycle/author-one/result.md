# Author procedure: qualification output contract

Status: retrieval procedure prepared. No candidate edit, audit, guard execution, audit-state mutation, commit or push was performed. The four applicability matrices have not been created or evaluated. This note makes no conformance or completed-audit claim.

The planning owner is the existing /home/mike1/projects/dev/workflow-server/.engineering checkout, verified by Git (trace 17). This result and its receipt traces are confined to /home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-audit-matrices/validation-evidence/selector-cycle/author-one.

## Inputs and measured identities

| Input | Received location or identity |
| --- | --- |
| Skill | /home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/SKILL.md |
| Supplied corpus root | /home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/test/fixtures/audit-qualification/clean |
| Scope | The supplied corpus root's scope.json |
| Selected checker | /home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/test/fixtures/audit-qualification/check.py |
| Paired engine | /home/mike1/projects/dev/workflow-server/.worktrees/engine-pin |
| Skill/fixture checkout HEAD | e8be42ce97eeb427e337214890da52ce3c1e8906 |
| Paired engine HEAD | e889276ae7c49a6b5cd37b4928d5f983e76c9770 |
| Engineering HEAD | 17fed6192fa19d4a889be388a545c1ce70e8a75b |
| Comparison base | None supplied; no baseline or comparison was invented |

These HEAD identities are command observations (traces 41–43), not a captured audit generation or source-hash agreement. The scoped Git status returned no change entries, with stream-fd warnings preserved in trace 44.

## Contract and scope

The intended edited file is corpus/qualification/techniques/produce.md, taken as a whole file. Its current Outputs heading declares report. The routine corpus/qualification/routines/deliver.yaml has an emit step calling produce and exports report from emit.report. The unchanged routine therefore belongs to the change surface when the technique's returned contract changes (traces 23, 27–28).

Keep the full concrete call and inheritance chain in scope:

- corpus/qualification/workflow.yaml selects run and declares its graph.
- corpus/qualification/activities/run.yaml invokes deliver at delivery with the envelope argument.
- corpus/qualification/routines/deliver.yaml calls produce at emit and consumes its report output.
- corpus/qualification/techniques/produce.md declares the returned output and emitting instructions.
- corpus/qualification/techniques/TECHNIQUE.md supplies the executing workflow's inherited destination constraint.

The supplied scope already names the explicit relationship execution/qualification/run/delivery/deliver/emit, from deliver.yaml to produce.md, with workflow.yaml, run.yaml and TECHNIQUE.md as context (trace 15). Retain that relationship, both endpoints, binding site, executing workflow and complete routine chain. The reference sweep returned the declaration and consumer sites (trace 40); this is discovery evidence, not an independent inventory verification.

A changed output contract is not specified in this qualification request. Before an actual draft is authored, record its precise name/shape/optionality and expected behavior. If the routine remains byte-for-byte identical, its emit.report binding must still resolve to an output declared by produce. A rename or removal that leaves report absent cannot be applied with this unchanged consumer: reformulate the draft or include the necessary consumer change within authorized scope. The exported routine name and the technique's declared output name need not be identical; the step-qualified target must resolve.

The local corpus contains no second leaf technique sibling. TECHNIQUE.md is an inherited contract, not a peer operation. A real Author pass must name the available comparable live sibling or explicitly retain this convention-comparison limitation. Do not silently import production dialect expectations into this controlled fixture.

## Procedure before application

1. **State the intended behavior and preserve the contract closure.** Resolve the requirement against the current tree, enumerate the edited file separately from unchanged consumers and context, and name the behavior to preserve. Use the design flow: expected behavior, proposed structure, behavior derived from that structure, then their comparison. Preserve output binding, exact invocation argument keys, validation before each emitting instruction/clause, inherited destination and a terminating workflow path as required by the local criteria. These are verification obligations, not findings from this walk.

2. **Prepare an isolated candidate.** Put the exact draft bytes in an isolated corpus tree before capture. Reuse the existing planning record, with a distinct future audit run directory and the supplied scope as its starting input. Include routine and reference closure, supporting sources, explicit relationship context and the required guards obligation. Leave base absent for this single candidate exercise. Resolve any prior residual by current path before continuing a saved run. No audit state or prior findings register was inspected in this bounded retrieval exercise.

3. **Capture and independently verify inventory.** Initialize the future run through the Author/change-surface procedure. Capture source bytes, corpus membership, engine and parser/tool identities, canonical criteria and scope. Generate all four workflow, technique, routine and activity matrix documents; an empty type must be explicit. Rows must cover whole elements and sections, output declarations, each independently testable instruction or semicolon clause, routine declaration and concrete instantiation, and the call/inheritance/binding relationships. An agent other than the inventory author must derive expected coverage from captured sources and the corpus manifest, including unselected sources and unresolved-reference diagnostics, then reconcile omissions. Capture is candidate extraction, not semantic proof.

4. **Map every row against every captured AP and DP.** The local canon supplies two named anti-patterns and two numbered design principles, plus the supplemental convention unit (traces 33, 38). Include the full row × four-criterion product. Record A for applicability, N only with the criterion's exclusion and matching source facts, or U with the missing evidence. A clean evaluation or a Do not flag exception does not by itself justify N. Keep the compound Rules clauses distinct. Family, convention and guard obligations remain supplemental; naming the first catalog family does not itself establish an exclusion.

5. **Verify the entire map before evaluating.** Every settled cell, including every N, requires a verifier different from that cell's mapper. Verification binds the exact disposition, reason and evidence. Inventory and mapping may overlap; mapping verification waits for all mapping decisions to settle. Before evaluation or audit obligations, require the map gate successfully with audit_surface.py status --require map. Any U, disputed mapping, missing independence or missing evidence keeps that gate closed.

6. **Evaluate and settle supporting obligations.** Walk applicable cells entry-major, with full source and relationship context. Preserve criterion wording, exclusions and fixes. In this dialect, explicitly inspect the routine output target through the emit step and technique Outputs heading, the concrete routine invocation's argument-key set, the inherited destination relationship and whole-workflow termination. Whole-file reads, supplemental units, the selected structural check and independent finding confirmation are separate obligations. Critical and High findings are re-derived; Mediums are spot-confirmed; the confirmer differs from the finding author. Typed receipts carry real host actor/assignment/snapshot identities, owned item IDs, substantive reasons and source spans for every row source and criterion. The coordinator alone reconciles ledger mutations.

7. **Reformulate each failing draft before writing.** Follow the prescribing entry's Fix and Do not flag without dropping other cells. A revised candidate needs current inventory, mapping verification and evaluation. Source, membership, scope, canon, engine/parser or audit-tool changes require refresh and invalidate the generation's evidence; a mapping correction requires reset and renewed independent verification. Stop and report a canon conflict if a criterion fires on text written to satisfy it or successive fix findings do not decrease.

These steps come from Author mode and its shared lifecycle, walk rules and dispatch contracts (traces 6, 20–25, 35, 39). This retrieval walk did not dispatch semantic workers or simulate their judgments.

## Selected check and execution boundary

The task explicitly selects check.py through Run Project Check. Its interface is Python followed by two positional arguments: corpus root, then paired engine root. Use the isolated candidate as the first argument and /home/mike1/projects/dev/workflow-server/.worktrees/engine-pin as the second; execute from the selected tool checkout under the host's sandbox rules.

The received checker loads corpus sources, parses YAML through the audit adapter, requires string definition IDs, workflow graph/initialActivity or ordered steps, and exactly four controlled criteria. It prints JSON observations and exits nonzero when its errors list is nonempty (trace 31). A successful run would establish these bounded structural observations. It would not establish output-binding semantics, production-engine schema conformance or full-project canon conformance. The local convention explicitly limits those claims.

Capture the exact invocation, working directory, input identities, measured cases/skips, output bytes and the check's own exit status. A pass needs measured exit 0. A measured failure requires attribution; unavailable execution or exit 2 remains blocked. No selected check ran here. No production guard suite, delta guard comparison or option-coverage command was selected: this request supplies a bounded checker, no Git comparison base and no graph/step-list change.

The edit-hook section was read (trace 29). Before actual application, satisfy its applicable host contract; if an automatic hook reports failure, fix the introduced defect or record why the observation is unmeasured before another edit. An unrelated engine/dialect mismatch is not a confirmed defect in this controlled fixture.

## Byte agreement and commit gate

- **Before applying:** compare the verified draft's captured source hashes with the exact bytes proposed for each destination path. Include unchanged relationship context and consumers in the generation identity; similarity of text is insufficient.
- **After writing:** capture the actual working tree and run its selected checks. Compare the actual generation with the evaluated draft. Identical file contents alone do not authorize evidence reuse when the root, scope, contract, parser, engine or audit tool changes. A changed generation requires its current independent inventory/mapping verification and evaluation.
- **Corrections:** any finding in newly written fix text is closed in the same Author pass by a newly walked draft. A broken unchanged consumer caused by this output change is change-induced under Attribution, not automatically pre-existing. No baseline means this walk cannot prove a pre-existing classification.
- **Before commit:** require current completion with audit_surface.py status --require complete. Inventory, every applicability decision, every applicable evaluation, whole-file reads, supplemental units, selected checks and finding confirmations must be settled. Unknown, disputed, stale, unread, unmeasured or blocked work keeps the audit incomplete. Coverage completion and conformance are separate: no Critical violation may commit; Live and Contract must reach zero, with Hygiene following the specified ratchet.
- **Report and authority:** select the standalone report because this task has no workflow-owned report. Use measured state for generation, surface subsets, coverage, findings and residuals; do not fabricate zero counts. A draft-only request writes no commit findings register and makes no commit-completion claim. This qualification authorizes only the planning note and traces; no commit or push is authorized by it. Future definition delivery must follow its actual owning branch/worktree and project instructions.

## Receipt coverage and limits

The JSON trace batches retain exact command/tool arguments and unmodified returned result objects for 44 recorded discovery, read and coordinator-status operations, including the initial instruction reads. They record actual received sections, not replacement hashes or retrospective source summaries. Parallel read batches retain submission order; their order does not assert completion order.

- Full reads: root/project/engineering instructions; skill entrypoint; Author mode; Planning; canon map; walk rules; design flow; change-surface lifecycle; supplied scope and fixture definitions; checker and scope template; controlled canon homes. Other reads use the exact section ranges recorded in their commands.
- Repeated source access remains visible: canon-context, commands, memory registry and fixture canon files were visited for distinct sections or enumeration followed by content. No receipt was replaced with a later reread.
- Trace 12 returned exit 1 and no output for a search for additional nested AGENTS.md files. Later fixture/checkout commands emitted three “Failed to create stream fd: Operation not permitted” messages while returning exit 0; the warnings are preserved. There was no retry.
- Trace 23 used the literal sed end selector dollar-p inside a quoted command, despite the host's textual prohibition on that pattern. It returned the requested section; the original command remains in the trace as an instruction deviation.
- Current tool responses were not truncated. The older memory recap mentions historical truncation; that is source text, not truncation of this run.
- Exact replacement output bytes, a captured audit generation, installed parser identity, actual engine resolution/inheritance source, measured budgets/calibration and independent semantic verification are unavailable in this bounded walk. The local controlled relationship and criteria define the procedural obligations; this note makes no production-engine claim.
- Workflow-server discover was read in response to the project instruction (trace 10). No session was opened: the task expressly creates no work package. The one coordinator progress message (trace 34) followed a later explicit request for progress; no external communication occurred.
- The fixture README and expected-outcomes.json were neither opened nor searched for their content. No further investigation or cleanup retry was performed after the coordinator requested a firm end.

Trace files: [trace-001.json](trace-001.json), [trace-002.json](trace-002.json), [trace-003.json](trace-003.json), [trace-004.json](trace-004.json), [trace-005.json](trace-005.json), [trace-006.json](trace-006.json), [trace-007.json](trace-007.json). The trace index is [trace-index.json](trace-index.json).

Completed todos: instruction retrieval; contract/procedure retrieval; standalone note and trace preparation. Audit execution and delivery are outside this qualification.

