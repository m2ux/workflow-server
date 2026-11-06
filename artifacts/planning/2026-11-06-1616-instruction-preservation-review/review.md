# Instruction Preservation Review

## Result

The pre-E01 comparison found six confirmed regression groups. Their corrections are committed and pushed in `3fcac1cbf60d784983e7c590e4f4de15cc3e7aad`, on the existing E01 integration branch. The approved Operations → Commands → Fields layout, command-owned contracts and succinct nested calls remain in place.

No further critical instruction loss was confirmed in the compared paths. This is a source and fixture review, not proof that every live tracker or graph interaction succeeds. Reading prerequisites still have the independently recorded cycles and breadth planned in E02.

## Revisions and Method

- **Original:** `03d353300ca4804194fd50d316d73e3bf1270d1d`, immediately before E01 style work; 55 Markdown files.
- **Reviewed:** `756aaf9f53f884b1da120e990ec9524a936aa4b2`; 58 Markdown files. No original Markdown file is deleted. Rules, Conventions and Configuration are extracted into three focused homes.
- **Corrected:** `3fcac1cbf60d784983e7c590e4f4de15cc3e7aad`.
- The inventory records 1,020 changed prose candidates. Semantic review traces guards, evidence selection, command bindings, outputs, condition scopes and continuation through moved sections and removed forwarding operations. Candidate counts are not assertions of semantic equivalence.
- Independent read-only delivery, synchronization and planning comparisons complement the main command, field and common-context review. Their initial combined reads encountered truncation; decisive core sections were recovered. A supplemental whole `issue.md` diff remained truncated and is not evidence for their findings.

## Confirmed Regressions

| Area | Lost instruction or behavior | Correction and observation |
| --- | --- | --- |
| Dispatch selections | Unquoted empty `--progress` or `--review` values disappear during shell parsing, so a valid one-direction status request fails argument parsing. | Quote both nullable selections and describe the empty state in Dispatch Selection. Progress-only execution succeeds; review-only execution reaches its missing-review guard without emitting a tracker write. |
| Criterion selections | Unquoted empty `--tick` prevents recording a task or hot-fix PR when no criterion has been verified. | Quote criterion selections in task, hot-fix, epic and initiative commands; define empty delivery selections and the quoting rule. Task and hot-fix fixtures write PR links while criteria remain unticked. |
| Initiative output | Record Initiative Delivery supplied optional `--fix`; removing its wrapper left Sync Initiative without the flag that writes its promised body. | Put the destination flag in Sync Initiative, specify report-only omission and conditional output. A completed epic fixture produces the requested initiative body. |
| Format evidence | Removed kind wrappers held the bindings for `--initiative`, repeated `--epic`, `--prs`, repeated `--files`, and paired `--project`/`--revision`. The generic owner only delegated further inputs back to callers. | Check Body Format owns the linked arguments, Fields and selection/repetition rules. Fixtures observe child-title correction, parent-based cross-epic resolution, and project-required criteria from changed paths at a committed revision. Corrected-body output is explicit. |
| Delivery continuation | Discrepancy repair lost “then repeat the survey with its results.” Repair refreshes evidence but does not recompute the available-work export. | Deliver explicitly repeats the survey with refreshed evidence before selecting a batch. Original and corrected route comparison verifies the continuation. |
| Graph condition | Flattened response-freshness bullets left reindexing and remeasurement outside the apparent stale-response condition. | An explicit “When the Index Is Behind” subsection scopes discarded measurements, reindexing and affected surface/context/trace repeats. Current measurements remain required before providing a result. |

Two additional clarity repairs make existing intent explicit: Compute Available Work binds `--dispatch-plan` to its destination in the invocation, and tracker state transitions use “held in draft,” “stays Ready” and released-hold wording where the mechanical Return → Provide replacement obscured their meaning. Standup repair names “that epic” from its result loop. These corrections do not restore duplicated nested input inventories.

## Command and Field Preservation

- All **116** original generic shell specifications have current counterparts. **109** have identical normalized shell tokens. Of the seven differences, three add the requested output/context flags above; four turn concrete issue, repository or output filenames into linked variable placeholders. The complete before/after tokens are in `command-payloads.json`.
- Token normalization removes presentation markup and shell wrapping; it cannot establish empty-value behavior. The fixture tests separately substitute empty values and paths with spaces, tokenize the installed command and execute the actual local script.
- No original command flag is absent from the current corpus. The per-section flag audit identifies values moved out of wrappers; the command-owner review checks those bindings rather than treating global flag presence as sufficient.
- Eleven original Field bodies fail literal normalized containment and were reviewed semantically. Tick State, brief instructions, dispatch Selection, Format Findings and unresolved Standup evidence retain their meaning with Provide wording. Queue dependency behavior is retained and its state wording corrected. Board themes/template names and the Standup default move to linked Configuration. Missing delivery-prefix repair moves from a field into its operation, retaining conflicts, publication and refetch.
- Full command examples intentionally yield to linked field-format specimens. Commands retain their generic invocation, optional/repeated-argument usage and result handling. Static specimen preservation alone was insufficient to detect the regressions above.
- Compared with the original, the only planner executable diff is the format reader’s acceptance of zero to three leading spaces on a closing template fence. This is exercised by the document/template tests. This correction commit changes instructions, guidelines and tests; it does not change planner script behavior.

## Critical Routes Retained

| Route | Instructions traced through the current owners |
| --- | --- |
| Delivery and integration | Authorization and joined scope; publication before holds/start; live reservation readback; actual session/capacity checks; retained preparation and branch/base/worktree identity; scoped blockers; brief test obligations; review withdrawal; fresh agent evidence; target readiness; required human approval; repeated-refusal stop. |
| Synchronization and queue | Unreadable relations distinguished from empty relations; complete Development links; merged delivery matching; normal-completion closure gates; closure readback and retry; removal decisions; exact revision verification; stale review convergence; off-board/unplanned/unresolved states; decision findings retained in reports. Sync does not silently evaluate queue decisions. |
| Planning and alignment | User decisions and allowance boundaries; source gaps; dependency refusal/retry; goal and criterion traceability; relation/placement preservation; unrelated body preservation; saved-body validation and readback. |
| Understanding and reporting | Explicit PR selection; measured diagrams and pinned code references; current graph evidence; Standup freshness checkpoint, unresolved gaps and repair retry only after a saved correction. |
| Shared context and publication | Entry-point reading of Rules and Conventions; linked-section boundaries; repository and checkout identity; sandbox exceptions; engineering publication/readback; conflict stop; configuration values linked from their semantic owners. |

## Verification

| Check | Result |
| --- | --- |
| New command fixtures against frozen reviewed documents | All 9 expose a regression: 8 assertion failures and 1 missing-export-file error. No live tracker action. |
| New command fixtures against corrected source | 9 passed. |
| Complete Work Planner suite | 943 tests: 942 passed, 1 opt-in check skipped. |
| Shared checker suite | 277 passed. |
| Installed model | 58 Markdown files, 0 findings. |
| Whitespace | `git diff --check` passed before commit. |
| Original-to-corrected section comparison | Exit 1, expected because intentional moves, added fields and differing procedures exist; the complete comparison is retained as evidence, not reported as a failed regression suite. |

## Review Limits and Existing Findings

- The independent comparisons cover instruction routes, not a complete execution of their transitive prerequisites. No live GitHub closure, dispatch, reservation or GitNexus measurement is claimed.
- Prerequisite cycles, overly broad reads and the limitations of earlier fresh-context trials are already planned in E02 issue #1615. This review does not implement that work or make the draft PR ready.
- Delivery’s retained-preparation route still reaches a procedure that unconditionally creates a task worktree with `git worktree add -b`; the comparison found this ambiguity in the original as well. It is a pre-existing follow-up candidate, not a style regression corrected here.
- Initiative synchronization writes only when a criterion/row tick changes the body; that behavior also predates E01. The output fixture deliberately exercises a changed row.

## Reproduction

Run the installed `test_command_contracts.py` through unittest from `skills/work-planner`, followed by the full planner suite and shared checker suite. The frozen replay script runs from the product checkout and reads the exact reviewed revision through `git show` while invoking the current local scripts. To rerun the coverage scripts, first extract the original `skills/work-planner` tree to `/tmp/project17-initial-layout/skills/work-planner`; the scripts record that fixed evidence location. Fixture outputs are temporary and paths include spaces.
