# Publication consumer trial B

Read-only fresh-context interpretation at source checkout `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e05/w01-confirm-epic-and-parent`.

## Source and execution boundary

- `git rev-parse HEAD` returned `7d38aca5aa42a71c1425c9abdbc2eaaf884d834d`; `git status --short` returned no entries. Shell startup emitted three `Failed to create stream fd: Operation not permitted` lines, but the command exited zero and produced the expected git and file output.
- Began with `skills/work-planner/SKILL.md`; selected Plan because these cases publish new/revised initiative and epic plans.
- No tracker command, validation script, git mutation, source edit, or subagent was executed. The operations below are my consumer-derived scenario traces, not evidence of live publication. Only this report is written.
- The cases do not supply body contents, confirmed goal clauses, source documents, work items, lane decisions, priority numbers or format results. I can derive publication control flow; I cannot assert these plans pass substantive checks. Publication traces assume the preceding draft/review decisions have passed. Before saving, Plan requires a priority-map interview, actual user-confirmed positive integers and Ensure Repository Labels. Elapsed time or an unanswered recommendation is insufficient.

## Actual reading record

All paths below are relative to `skills/work-planner/`. There was no tool-output truncation.

Complete document reads:

- `SKILL.md`.
- `rules.md` (14 lines), `conventions.md` (29 lines), and `modes/plan-mode.md` (162 lines), batched with line counts. The Plan read included steps 1–9 and Outcomes; later Keep Goal Current, Prepare Epic Delivery and Record Delivered Work are outside the immediate publication exercise but establish terminal limits.

Complete selected sections, with partial-document reads:

- `artifacts/issue.md`: Read Tracker Issue 7–22; Save Tracker Issue 23–58; Select Tracker Number 116–135; Create Tracker Issue 138–154; Patch Issue Body 155–164; Retitle Tracker Issue 175–184; Add Issue Labels 185–196; Fetch Tracker Issue 217–227; List Prefixed Titles 392–403; Identity, Content and Discussion 406–417; Issue Record 430–433; Issue Changes and Label Names 446–453; Tracker Prefix and Tracker Number 486–493. The index listing was not a content read of the other sections. Remove Issue Label, comments and closure operations were not needed for the captured cases.
- `artifacts/epic-issue-body.md`: Validate Epic Body 43–67; complete Fields 198–425 was obtained across ranges covering Template, Titles, Proposal, Work Breakdown, Acceptance Criteria, Open Questions, Required Criteria, Task Delivery and all input/output definitions. The initial reads of Required Criteria and Epic Record/Initiative Context were retained rather than reread in the later ranges.
- `artifacts/initiative-issue-body.md`: Validate Initiative Body 59–78; complete Fields 126–271 was obtained across multiple bounded ranges, including Template through Requirement References. Work Breakdown, Initiative Acceptance Criteria, Initiative Record and Epic Records came from the initial ranges; later ranges supplied the remaining field sections.
- `artifacts/goal-trace.md`: Review Initiative Goal 7–70 complete. Remaining field contracts were not opened because no concrete goal review is executed.
- `artifacts/dependency-graph.md`: Check Dependencies and Numbering 7–39; Check Dependencies 42–73; Epic Priority 141–144; Graph Inputs and Dependency Files 164–171; Graph Result and Rewritten Bodies 180–187. Referenced numbering, contention and lane subprocedures were not recursively expanded because no actual graph or finding is supplied.
- `artifacts/repository-labels.md`: Ensure Repository Labels 7–26 complete; no label command executed.
- `guidelines.md`: Modes 93–130 complete. Much of this is authoring guidance rather than publication context; its Interview subsection supplies the requested decision format.
- `artifacts/issue-body.md`: initial 1–100 read includes complete Validate Issue Body and Build Body Snapshot, plus unrelated Write Issue Table, Check Round of Edits and Apply Body Corrections. Later read includes Check Body Format 132–155, complete Fields 186–380 and Numbering 383–end. Shared fields and kind-specific fields are sufficient to understand validation inputs; the referenced Requirement Characteristics document was not opened because no criterion content is being assessed.
- `artifacts/planning-record.md`: Publish Planning Record 40–57, Layout 133–146 and Publication Result 184–187 complete. Its engineering command implementations and Shared Worktree were not opened because no planning-record publication is executed.

Recovery and repeated context:

- A single attempted inline Python section extractor was blocked by the pre-tool hook as an unsandboxed inline interpreter. It executed no reads. Recovered using bounded `sed` ranges, retaining command/filename boundaries; no escalation was requested.
- `rg` heading scans over artifact files were navigation only. They did not count as complete content reads.
- No complete document was reread. Local Required Criteria and initiative/epic input contracts were read before the rest of their Fields sections; later ranges avoided rereading those bodies.
- The broader full Plan read and initial issue-body 1–100 range admitted the unrelated context identified above. Other modes were not opened.

## Common operation contract

1. Retain reviewed complete draft files in the planning record. Confirm the proposed Epic Priority map with the user and ensure the required label definitions exist before issue saves.
2. A Save Tracker Issue takes the full intended body plus selected metadata, preserving unspecified fields on an existing issue. For a new issue it creates; for an existing identity it patches only selected changes. It then fetches the complete saved tracker JSON and compares saved body/metadata against the intended values. A create/PATCH response alone is insufficient. Only matching saved fields provide the successful Issue Record.
3. New-parent identity is obtained first by saving the parent with temporary epic-row links. Existing parents retain their confirmed issue identity. The initiative prefix selected by Select Tracker Number is a two-digit plan identifier, not the GitHub issue number; neither #43 nor any epic issue number is predicted from that lookup.
4. Save only the new/revised epics, in dependency order; replace temporary prerequisite targets using identities already returned by successful saves. Use the actual returned repository/issue/URL in the parent row and dependent drafts. Existing epic identities are retained.
5. Once all epics are saved, check there is no unresolved epic placeholder in either the parent or epic bodies. Save the parent's complete intended rows, including unaffected siblings, on both parent paths. A parent row is not an append-only fragment.
6. Refresh the parent and every epic the saved Work Breakdown names, then perform saved-context checks in the order below. A failed save, read failure or disagreeing saved fields stops the appropriate continuation. Successful artifacts may remain saved; the text does not specify rollback or automatic deletion.

## Case traces

### Existing parent #42, existing E00/#100, new E01 and E02; E02 depends on E01

1. Keep parent identity #42 and unaffected E00 identity #100. Do not create a parent or rewrite E00 merely to include it in validation.
2. Save new E01. Its successful returned identity is #201, confirmed by Save's own complete readback and comparison.
3. Replace E01 placeholders in E02's prerequisite links with #201, retaining the intended row identities for task-level references. Save E02; its successful readback supplies #202. Do not guess #202 before this save.
4. Populate the parent rows with E00→#100, E01→#201, E02→#202 and E02's intended dependency on E01. Retain the complete unaffected E00 row and other unchanged parent fields. Confirm every epic placeholder is resolved, then save #42 and compare its complete saved readback.
5. Explicitly Read Tracker Issue #42, #100, #201 and #202 for Saved Validation. E00 is part of the validation context although it received no publication write.
6. Validate each of the three epics against this freshly saved #42; Validate Initiative Body #42 with all three freshly saved epic JSON records; Review Initiative Goal; Check Dependencies and Numbering across that saved set and supplied work-item files.

### New parent returned as #43, one new epic returned as #203

1. Select and confirm the unused initiative prefix; save the new parent draft with temporary epic-row links. The creation plus matching saved readback supplies parent identity #43. A failing or mismatching parent save stops before the epic is published.
2. Save the new epic under the confirmed parent context. Its successful save/readback supplies #203; use that identity in the parent's epic row and wherever its draft is referenced.
3. Resolve all epic placeholders and save the complete parent body at existing identity #43. This is an update to #43, not a second parent creation.
4. Explicitly read #43 and #203 again for Saved Validation; validate the epic with saved #43 and the parent with saved #203, then perform goal and dependency/numbering review. Both the initial temporary-parent save and final-parent save require their own Save readback comparisons.

### Update existing epic #100 under #42 with unaffected siblings

1. Retain #42 and #100. Save the revised body/confirmed priority metadata at #100; do not create a new epic identity. Preserve metadata not selected for change.
2. Use #100 in the complete intended #42 rows, preserving all unaffected sibling rows and identities. After placeholder checking, save #42 even when a particular parent's row text needs no substantive change; Plan's publication path calls that save for either parent path.
3. Read #42 and every linked epic, including each unaffected sibling. Validate every saved epic with the fresh parent, and the parent with every fresh sibling record. No sibling write is implied solely by its participation in these checks.

### Epic save fails

- If E01's save fails, stop before E02 or the final parent save and before Saved Validation or delivery preparation. If E02 fails after E01/#201 succeeds, retain evidence that #201 exists and stop before final parent save and validation/preparation.
- Report the actual failed operation and all successful/observed identities; do not claim a complete published plan. A new parent's initial temporary-link body may already exist, or an existing parent may still carry its preceding rows.
- A failed readback or saved-field mismatch also means no successful Save result, even if its create or patch already reached the tracker. Preserve an observed created identity in failure evidence; do not blindly create a replacement on retry. No rollback is prescribed.

### Final parent save fails after epic success

- Report the successful epic identities and the parent failure. The tracker may hold an epic body that the parent has not coherently incorporated.
- Stop before Saved Validation and delivery preparation. Do not validate using the local intended parent as if it were saved. Existing-parent #42 retains its identity; a newly created #43 retains its already-created identity even if its final update fails.
- Any later repair must refresh the actual saved state and retain known identities. No automatic rollback, parent recreation or success claim is justified by these instructions.

### Readback disagrees with the intended saved body

- If disagreement occurs in Save Tracker Issue's readback, that operation cannot provide success. The calling Parent Identity, Epic Publication or final-parent gate stops immediately. In particular an epic mismatch stops before dependent epic saves, and an initial new-parent mismatch stops before epic publication.
- If every Save reported matching fields but the explicit Saved Validation read of #42/#43 or any linked epic disagrees, provide the discrepancy and stop before any validation or delivery preparation. A locally corrected draft is not saved-context evidence.
- Unaffected siblings are included in the saved context. A disagreement there cannot be ignored merely because that sibling was outside the write set. The supplied cases say other successful reads match the latest saved state, so no further change or race is assumed.

## Validation context and terminal claims

- Epic validation uses the complete fresh parent JSON (`--initiative`), with its current cross-epic references. Initiative validation uses every linked fresh epic JSON (repeated `--epic`), not only epics changed by this publication.
- Applicable project-required-criteria checks use paired `--project` and `--revision` at the fetched project revision. Required pull-request changed-path evidence and delivery reach are needed when applicable. Without pull requests, Validate Epic Body states no criterion is lacking on that basis. This trial supplies no such evidence and claims no evaluation of it.
- Review Initiative Goal uses retained confirmed goal clauses, source evidence and the fresh saved bodies. It contains its own Validate Initiative Body call; that is a repeated validation operation, not authority to replace the saved bodies with stale drafts. Local Build Body Snapshot applies when local drafts are supplied; unpublished snapshots do not create tracker issues.
- Check Dependencies and Numbering calls Read Tracker Issue for a published initiative and each epic before its dependency computation. That adds explicit reads beyond the initial Saved Validation reads and Save-internal readbacks. The computation includes the initiative body, every epic and every supplied work-item file; work-item omissions limit component-contention evidence. Its internal lane validation is acknowledged but not executed here.
- Findings return to drafts, then repeat Epic Publication and Saved Validation with affected bodies while retaining every saved issue identity. Unresolved findings block delivery preparation. If a finding would change content or structure, I cannot silently invent user confirmation.
- Only after saved-context checks pass may the planning record receive the evidence, decisions and issue links and Publish Planning Record confirm remote publication. Failure to publish that record remains a blocker rather than a complete publication claim.
- A successful coherent save is not a claim that tasks are ready or delivered. Prepare Epic Delivery separately requires settled Open Questions, updated bodies/Coverage, current initiative/prerequisite evidence, a passed Check Epic Prerequisites, delivery bases and any retargeting called for there, followed by repeated goal/ordering review on changes. This read-only consumer trial has fulfilled none of those live gates.

## Uncertainties and limits

- The exact priorities and their proposed map cannot be derived without task bodies and component declarations; no priority numbers were invented.
- A failed save's partial side effects require observed tracker evidence. The procedure prescribes stopping and reporting, not an automatic repair/rollback algorithm.
- The readback-disagreement phrase is not restricted to one point, so both Save-internal and final saved-context discrepancies are traced above.
- No substantive format, goal, graph, lane, source-alignment, required-criteria or readiness result is asserted. This report establishes the operations, identity flow and stop points I would follow from the text.
