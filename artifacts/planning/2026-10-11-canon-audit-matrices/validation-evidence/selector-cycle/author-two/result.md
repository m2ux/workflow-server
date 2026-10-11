# Author instruction walk: revised output contract

Retrieval-only qualification. The procedure below is prospective. No definitions were authored, audit state changed, audit/guard invoked, external message sent, or Git write performed. This is a standalone planning note, not an audit report or commit approval.

## Inputs and source receipt

- Workspace instruction owner: `/home/mike1/projects/dev/workflow-server`; its root `AGENTS.md` and configured `.project/main/AGENTS.md` were read. Planning owner resolves to its existing `.engineering` checkout. The result and trace files are confined to `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-audit-matrices/validation-evidence/selector-cycle/author-two`.
- Skill: [/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/SKILL.md](/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/SKILL.md), selecting Author. The instruction path read Author, its canon prerequisites/terms/criteria/scope, design flow, change-surface lifecycle, walk rules, check selection, edit hook, attribution, and standalone reporting prerequisites.
- Current candidate: `/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/test/fixtures/audit-qualification/clean`, with its supplied `scope.json`. The skill/candidate checkout returned HEAD `e8be42ce97eeb427e337214890da52ce3c1e8906`; scoped status for the read skill references, template, candidate and checker returned no changes. This identifies the observed checkout, not an audit generation or comparison base.
- Paired engine: `/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin`, HEAD `e889276ae7c49a6b5cd37b4928d5f983e76c9770`. Its status returned ` D node_modules`. Installed parser/runtime identity and execution readiness were not verified.
- Selected checker: `/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/test/fixtures/audit-qualification/check.py`. Its interface and source were read, not run. It takes candidate root and paired engine as its two positional arguments.
- No Git comparison base, on-disk prior evaluation receipt, revised Output wording, or revised rule clause was supplied. The prior draft evaluation and subsequent edits are scenario context. The current file has an `Outputs` / `report` declaration with no description body. I do not claim to have observed the hypothetical revisions or their evidence.

Source text and exact command returns are preserved in the trace batches. The fixture README and `expected-outcomes.json` were not read.

## Resolve the intended surface

The requested output-contract edit identifies the surface even without a diff. Read the whole proposed `corpus/qualification/techniques/produce.md`, including the Output description and each independently testable Rules clause. Resolve consumers and inherited contracts before narrowing any applicability claim.

The supplied declarations and explicit relationship identify this closure:

| Source | Role in the proposed edit |
| --- | --- |
| `corpus/qualification/techniques/produce.md` | Candidate output contract, instructions and leaf destination |
| `corpus/qualification/routines/deliver.yaml` | Unchanged consumer: step `emit` calls `produce`; routine output `report` binds `emit.report`; input list is `envelope` |
| `corpus/qualification/activities/run.yaml` | Concrete `delivery` invocation of `deliver`, passing `envelope: sealed` |
| `corpus/qualification/workflow.yaml` | Executing workflow and graph context |
| `corpus/qualification/techniques/TECHNIQUE.md` | Inherited destination requirement |

`scope.json` initially lists workflow, activity and producer paths, and separately supplies the routine-to-technique relationship and context. The actual capture must include the unchanged routine, ancestor and complete invocation chain; a path's absence from the initial `paths` list does not justify omitting it. Sweep references and reconcile extraction against the manifest. Verify resolution and inheritance in the declared controlled dialect and paired inputs; the present read is not a production execution test.

Open a relevant live sibling for Author's conformance comparison and record any missing exemplar. The supplied candidate inventory contains no second leaf technique; its inherited `TECHNIQUE.md` has a different role. This walk did not search an unrelated corpus to manufacture a sibling.

Preservation requirements come from the complete current controlled criteria: validation before every emitting instruction/clause, exact invocation input keys and declared output binding names, the executing workflow's inherited destination, and a finite terminating graph path. Treat these as requirements to check, not conformance findings. An output description edit may preserve the declared name; that does not remove the consumer from scope. The rule with a semicolon contains separately testable clauses. Re-enumerate their boundaries and also retain whole-section and relationship obligations.

## Evidence after the author changes the candidate

1. Capture the actual revised draft in an isolated corpus tree. A plan for text is not captured text. If a real prior run exists, inspect its status and identities before reuse. None is available here, so the earlier evaluation cannot be treated as a verified receipt.
2. A change to the Output description or a rule clause changes source bytes and therefore blocks reuse of the prior captured generation. Refresh an existing run, or initialize a new captured run when no resumable run exists. Preserve archived state and immutable prior returns. A changed generation invalidates all mapping, verification and evaluation evidence: checking only the edited rows is insufficient, because dependency reach crosses elements. A mapping-only reset is not a substitute for recapturing changed source bytes.
3. Regenerate workflow, technique, routine and activity matrices from the current sources; each type remains represented even when empty. Keep native identifiers, source-bound prose/clause addresses, missing-structure and whole-element rows, and explicit invocation/inheritance relationships. Include supplemental canon and selected-check obligations.
4. Have an independent verifier derive the expected inventory and relationship closure from captured source and manifest, including unselected sources and extraction diagnostics. Correct missing clauses or relationships through scope and refresh; extraction alone does not establish completeness.
5. Decide every row × captured anti-pattern/design-principle cell as applicable (`A`), excluded (`N`) or unresolved (`U`), citing original criterion wording and row sources. A clean evaluation or a Do not flag exception does not itself mean exclusion. An agent other than each cell's mapper must verify every settled mapping, including all `N` cells. All decisions must be settled and independently verified; require the map gate before evaluation.
6. Evaluate every verified applicable cell with complete source and relationship context. Walk criteria entry by entry across the surface, examining each I/O constraint and rule clause separately before the containing heading. Settle independent whole-file reads, supplemental units, selected checks and finding confirmation. Evidence-backed results and typed receipts bind the current generation and assignment; unknown, disputed, unread, unmeasured and blocked work remain residuals.

The controlled canon contains two anti-pattern entries and two design principles; its own scope explicitly limits their authority. This is a source inventory observation, not a count of evaluated cells. No matrix dimensions, coverage totals or pass counts were measured in this walk.

## Application and verification of written bytes

- Before applying the verified draft, compare the captured source hashes with the exact bytes proposed for writing. Any difference returns to current capture, inventory, complete applicability verification and evaluation. The prior draft cannot authorize an altered Output description or rule clause.
- Read and honor the edit-hook contract before a real definition write. An actual failure must be corrected or identified as unmeasured before the next edit. No hook was invoked here; no production guard baseline was established.
- Apply only the evaluated bytes. Then capture the actual working tree and run its selected checks. Reconcile the written files and affected unchanged consumers against that captured generation. Evidence is reusable only for an identical generation; changed roots, contracts or bytes require current verification. Equal-looking structure or an unchanged consumer file is insufficient.
- Use the task-selected checker through Run Project Check, with the actual candidate root and paired engine, the host's required sandbox invocation, and recorded working directory, input revisions, measured cases/skips, exit status and output bytes. Its source checks parsed definition structure and the controlled criterion inventory. It does not establish instruction compliance, binding semantics, inherited-destination compliance, termination semantics, or full production conformance.
- The supplied `checks: ["guards"]` is a required obligation under this task's declared structural-check contract. Do not substitute an engine guard suite or infer production conformance from that label. With no comparison base, make a single-candidate observation; do not claim a delta or manufacture a baseline. A failed/unavailable/unmeasured check cannot be called clean.
- The requested Output/rule edit does not establish a step-list, exit, gate or graph change. Do not add option coverage merely because the workflow is relationship context. A later change affecting those structures would require reassessing check selection and its baseline before editing.
- If written bytes expose a defect from a fix, close it within the pass by drafting and verifying the correction through Author again. Each correction receives current inventory, mapping verification and evaluation. Stop and report a canon conflict if an entry rejects text written to satisfy it, or if successive fix rounds fail to reduce their findings.

## Completion and commit

Require the current run's completion gate only after independent inventory verification, independently verified applicability for every cell, evidence for every applicable evaluation, and all reads, supplemental units, selected checks and required finding confirmations are settled. A status command requiring `complete` must succeed; rendering matrices or having an old evaluation is not completion.

Coverage completion and conformance are separate. Report Live, Contract and Hygiene bands using measured state; Live and Contract must converge to zero, guard failures are Critical, and fixes leave no open finding they introduced. No base means no evidence that a defect is pre-existing or that a comparison is clean. An unchanged consumer broken by the proposed contract belongs to the change surface; it cannot be dismissed as unrelated. A prior draft evaluation alone also supplies no verified prior-pass Hygiene count.

Only then can the Author procedure satisfy its definition commit gate, subject to the user's actual delivery authority and project requirements. Read Report Context before selecting the standalone layout, and reconcile every audit-report figure against generated state. Here the authorized deliverable is this planning note and read trace: there is no audit completion, application, commit or publication claim.

## Trace limitations

- Full source returns are retained, including repeated revision/status reads; no post-hoc hashes stand in for source receipt.
- Several reads returned three `Failed to create stream fd: Operation not permitted` lines while exiting 0 and still returning the requested content. These warnings remain in the raw returns.
- The initial listing of this result directory returned exit 2 because it did not yet exist. Artifact creation follows that observed absence.
- No source-read return reported truncation. Section reads retain their actual ranges; whole-file reads and targeted searches are distinguishable in the recorded commands.
- A required memory-registry search returned unrelated historical matches; none informs this procedure. The authoritative inputs are the current instruction and source reads listed above.
- Trace batches record the exact nested tool arguments and raw tool returns for the work, including artifact writes. The final trace persistence operation has an unavoidable recording boundary: its request and returned receipt are retained in the live tool transcript, and a closing receipt file records the last completed batch-write returns rather than claiming an infinitely self-recording log.

Primary procedure sources: [Author](/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/references/author-mode.md), [Definition Scope](/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/references/definition-scope.md#scope), [Change Surface](/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/references/change-surface.md), [Walk Rules](/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/references/walk-rules.md), [Canon Checks](/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/references/canon-context.md#checks), [Reporting](/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/references/reporting.md#report-context).
