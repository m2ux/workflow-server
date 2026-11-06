# Independent Plan Mode consumer trial A

## Scope and execution receipt

- Checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e05/w01-confirm-epic-and-parent`.
- Requested and observed HEAD: `7d38aca5aa42a71c1425c9abdbc2eaaf884d834d`.
- `git status --porcelain=v1 --untracked-files=all` is empty; `git diff --quiet` and `git diff --cached --quiet` exit 0. HEAD and clean status were checked again after the reads.
- This is source interpretation of the supplied captured cases. No fixture runner, format/dependency script, tracker command, tracker write, branch mutation, source edit, or delivery preparation was executed. This report is the only written artifact.
- The case descriptions supply hypothetical save/read results; I did not independently observe them. Successful additional reads are interpreted as returning the latest saved state, as instructed.
- The publication cases start with reviewed drafts. Exact bodies, goal clauses, requirement sources, work-item files, confirmed priorities, labels, repository identity/URLs and checker outcomes were not supplied. The sequences below identify required operations; they do not assert those prerequisites or checks actually passed.

## Read receipts and context handling

All paths below are relative to the checkout unless stated otherwise. “Complete section” includes its subsections and stops at its next peer or ancestor heading. Range reads sometimes show the following heading without its body; that heading is not counted as a complete section.

| Source | Actual receipt | Use |
| --- | --- | --- |
| `AGENTS.md` | Whole file, complete | Local work and prose constraints; read-only trial overrides ordinary commit/push work. |
| `skills/work-planner/SKILL.md` | Whole file, complete | Entry point; selected Plan Mode. |
| `skills/work-planner/rules.md` | Whole file, complete | Linked-section boundaries, complete-context reuse, sequential calls, layer ownership. |
| `skills/work-planner/conventions.md` | Whole file, complete | Checkout, body-file and command context. No `gh` call was made. |
| `skills/work-planner/modes/plan-mode.md` | Whole file, complete | Main interpretation, especially step 6 Parent Identity, Epic Publication and Saved Validation; step 8 distinguishes validation from delivery readiness. |
| `skills/work-planner/artifacts/issue.md` | Initial whole-file request was partially exposed by outer aggregate-output truncation. Relevant sections were recovered in complete bounded reads, not presumed read from the truncated result. | See recovered sections below. |
| `skills/work-planner/artifacts/issue.md` recovered | Read Tracker Issue; Save Tracker Issue; Select Tracker Number; Create Tracker Issue; Patch Issue Body; Fetch Issue Body; Retitle Tracker Issue; Add Issue Labels; Remove Issue Label; Fetch Tracker Issue; List Prefixed Titles; Identity, Content, Discussion, State, Auto-Close Setting, Repository, Issue Record, Output Files, Discussion Selection, Issue Changes, Label Names, Tracker Prefix, Tracker Number, Workspace, Issue Body. All named sections complete. | Save consumes intended changes, preserves unselected fields, reads the saved issue, compares fields, and supplies the record only after agreement. Prefix selection is distinct from issue-number allocation. |
| `skills/work-planner/artifacts/epic-issue-body.md` | Complete Populate Epic Issue Body and Validate Epic Body; complete Fields section and Guidance/Test Evidence (lines 198–433), with Epic Record and Initiative Context read again. | Parent context, retained existing identity, pending links and relevant validation evidence. |
| `skills/work-planner/artifacts/initiative-issue-body.md` | Complete Validate Initiative Body and Fields section (lines 126–end). | Every linked epic's current JSON; Work Breakdown issue links and identities; source evidence and title consistency. |
| `skills/work-planner/artifacts/goal-trace.md` | Whole file, complete | Saved-body goal review, retained goal clauses and sources, full trace and findings. |
| `skills/work-planner/artifacts/dependency-graph.md` | Complete Check Dependencies and Numbering, Check Dependencies, Epic Priority, Graph Inputs, Dependency Files, Graph Result. | Dependency order; published-body reads; every epic and supplied work item; graph/numbering findings. |
| `skills/work-planner/artifacts/repository-labels.md` | Whole file, complete | Confirm required label definitions before issue saves. |
| `skills/work-planner/artifacts/issue-body.md` | Complete Validate Issue Body, Build Body Snapshot, Check Body Format, Fields, and Guidance/Numbering. | Epic validation supplies parent JSON; initiative validation repeats `--epic` for every linked epic; evidence and kind conditions. |
| `skills/work-planner/artifacts/planning-record.md` | Complete Publish Planning Record and Layout. | Draft source files and final evidence/decision/link publication after checks pass. |
| `skills/work-planner/artifacts/plan-change.md` | Complete Allowance only. | No allowance was supplied; no authority to silently decide plan changes. |
| `skills/work-planner/guidelines.md` | Complete Modes section. | Interview choices require an answer; recommendation alone is not confirmation. |
| `skills/work-planner/references/requirement-characteristics.md` | Whole file, complete | Linked acceptance-criterion conditions. |

Heading-only `rg` indexes were also read for issue, body, goal, dependency, label, planning-record, plan-change and guideline files. One aggregate call was truncated externally (reported original 12,951 tokens); it combined an index and the overbroad `issue.md` read. Selected relevant prose was explicitly reread, and the issue/initiative heading indexes were recovered. No conclusion depends on an unseen portion of that output. Initial login-shell calls emitted `Failed to create stream fd: Operation not permitted` alongside successful output; repeat non-login commands returned clean status evidence without that noise. A proposed inline Python section extractor was blocked before execution; bounded `sed` reads supplied its intended evidence.

Complete same-revision context was reused between scenarios. The initial whole `issue.md` request was unnecessarily broad: it exposed unrelated closure, Development-link and comment material. Those operations were not selected. Full epic/initiative Fields reads also exposed delivery facts beyond the publication cases; they supply validation contracts but do not authorize delivery work. No memory, unrelated repository history, expected-action answer key, fixture implementation or other reader's report was consulted. I did not traverse delivery-base, PR publication, sync or unrelated modes because no case reaches an actual delivery request.

## Common selected path and validation context

1. Plan Mode's review/draft prerequisites remain prerequisites: confirmed lane choice where applicable, resolved review findings, goal and dependency checks, and confirmed positive integer epic priorities. Step 6 calls Ensure Repository Labels before saving. Exact priorities and label strings cannot be invented from these cases.
2. Save Tracker Issue is the selected publication operation. New issues use Create Tracker Issue; existing bodies use Patch Issue Body, with title/label commands only for selected metadata changes. It fetches the saved issue and compares intended body and metadata before providing the issue record. Unchanged fields of an existing issue are preserved. No comment is requested in these captures.
3. Existing parent identity is retained. A new parent is saved first with temporary epic-row links, acquiring its tracker issue identity before child saves. Select Tracker Number supplies an initiative prefix, not the GitHub issue number returned by creation.
4. Save only new or revised epics, in dependency order. Replace each temporary prerequisite link using an already confirmed saved identity. Existing epic identities are retained. Use each saved identity in the parent row and dependent drafts.
5. After every intended epic save succeeds, require no unresolved epic placeholder in the parent or epic bodies, then save the complete intended parent rows, on both existing-parent and new-parent paths.
6. Only after that final parent save agrees: Read Tracker Issue for the saved parent and **every epic its saved Work Breakdown names**, including unaffected siblings. Stop on unreadable or disagreeing context. Save-internal reads do not replace this explicit fresh saved-context stage.
7. Validate Epic Body for each epic using the fresh saved parent context; Validate Initiative Body with every fresh saved epic; Review Initiative Goal with fresh saved bodies and retained confirmed goal clauses/sources; Check Dependencies and Numbering with fresh saved bodies and supplied work-item files. The last operation itself calls Read Tracker Issue for the published parent and each epic; these additional reads return the latest saved state under the case assumption.
8. Body-format evidence is the complete current issue JSON. Epic format receives its parent via `--initiative`; initiative format receives each linked epic via repeated `--epic`. Relevant PR/changed-path/project-revision evidence is required where applicable; no captured case supplies PRs or proves their absence. Required-criterion applicability cannot be assumed solely from save success. Goal/source evidence and graph/work-item completeness remain separate requirements.
9. Findings are resolved in drafts and affected bodies repeat Epic Publication and Saved Validation, keeping all saved identities. Unresolved findings block delivery preparation. Only passing saved-context checks permit updating and publishing the planning record and continuing toward step 8's separate prerequisite/delivery-base work.

The justified success claim from matching saves and reads is **publication confirmed and saved validation may proceed**. It is not “all semantic checks passed,” “ready for delivery,” “delivered,” or “closed.” These are control-flow terminal states, not assertions about issue open/closed state.

## Captured cases

### 1. Existing parent #42; unaffected E00/#100; new E01 and E02

- Retain parent #42. Do not create another parent or allocate a replacement identity for E00/#100.
- Save new E01 first; its matched save record supplies #201. Replace E02's prerequisite placeholders with the confirmed E01/#201 issue link, retaining any row anchor/row identity required by the reviewed task dependency.
- Save new E02 next; its matched record supplies #202. The parent draft uses E00/#100, E01/#201 and E02/#202; E02's whole-epic Depends on entry names E01 only if the reviewed task graph establishes the whole-epic dependency condition. The case's intended whole-epic dependency is not permission to omit its task-level validation.
- Confirm no unresolved epic placeholder remains; save #42 with its complete intended rows. Its unaffected row still links E00/#100.
- Fresh saved-context reads: #42, #100, #201 and #202. Validate all three epics with fresh #42; validate #42 with all three epic records; perform saved goal/dependency/numbering checks (with the dependency operation's further reads).
- Terminal supported by the supplied observations: all selected publication saves/readbacks agree; validation can run on the full saved initiative. A passing-validation/publication-complete result is conditional on actual check results and planning-record publication. No save of unaffected #100 is selected unless a real finding requires changing it.

### 2. New parent saves as #43; new epic saves as #203

- Confirm the new initiative prefix with Select Tracker Number (its actual value is unspecified), then save the new parent with temporary epic-row links. The matching save record supplies parent #43.
- Save the new epic using the now confirmed parent identity where needed; its matching save record supplies #203.
- Put #203 in the intended parent row, resolve all epic placeholders, and save the completed parent **as existing #43**. This is an update of #43, not another parent creation.
- Fresh saved-context reads: #43 and #203 (plus any further epics the saved parent's actual table names; none are stated here). Validate the epic with fresh #43 and the initiative with the complete saved epic set, followed by goal and dependency/numbering checks.
- Terminal supported by the capture: both concrete identities retained and final links/readbacks confirmed; eligible for saved validation. No claim of checker success or delivery readiness follows from matching reads alone.

### 3. Revise existing epic #100 under #42

- Retain #42 and #100. Save the revised epic to #100 with its selected body/metadata changes and confirmed priority label; do not create a replacement epic.
- Preserve unaffected siblings and their saved identities in the complete intended #42 rows. Save that final parent body as #42 even when no new identity was allocated.
- Read saved #42 and every epic it names, including #100 and every unaffected sibling, by their existing identities. No numeric sibling identities were supplied, so they cannot be filled in here.
- Validate every saved epic using #42 and the parent using every saved epic, then perform the same saved goal/graph checks. Unaffected siblings enter validation without being selected for saves.
- Terminal supported by matching observations: revised #100 and complete #42 are confirmed under retained identities; full saved validation is permitted. The retained unaffected siblings are not stale draft substitutes.

### 4. First epic save fails

- Select Save Tracker Issue for the first epic in dependency order. On its failed result, provide failure evidence and stop.
- Do not save a dependent epic, write the completed parent rows, run saved-plan validation, or prepare delivery. The parent/new-identity stage is already before this failure: an existing parent retains its identity; in the new-parent variant the initially created provisional parent persists.
- No confirmed saved epic record or new issue number can be claimed from the failed operation. A failure may follow a partial remote mutation; without evidence it proves neither a successful publication nor the absence of remote side effects. Do not invent #201, #202 or #203 for a failed save.
- Terminal: blocked publication with failure evidence, any already confirmed parent identity, and an explicit partial-state account. The procedure does not select rollback, dependent continuation, or a claim that nothing changed.

### 5. Final parent save fails after successful epic publication

- Successful epic saves retain their confirmed identities. For the first capture's identity set those are #201/#202 under retained #42; for the new-parent capture they are #203 under provisional #43.
- Attempt the final parent Save Tracker Issue with complete intended rows. On failure, provide evidence and stop before saved-plan validation or delivery preparation.
- Already confirmed epic publications remain a justified partial result. The completed parent body is not confirmed; an existing parent may still hold its prior body, and the new-parent path may retain its temporary-link body. A partial mutation is also possible if the failure occurred after a write, so the exact persisted parent body is unknown without additional evidence.
- Terminal: partial publication blocked on final parent save. Do not re-create successful epics, validate against the intended parent draft, or claim the plan is saved consistently. If “parent save fails” instead meant the initial new-parent save, stop there before any epic save; that differs from this case's “after epic save succeeds” ordering.

### 6. Write returns success but readback body disagrees

- Save Tracker Issue includes Fetch Tracker Issue and an intended-versus-saved field comparison. A successful write response alone does not produce its successful Issue Record result when the fetched body disagrees.
- At the initial new-parent save: provide the discrepancy and stop before epic publication. At an epic save: stop before dependent epic saves, final parent publication, saved validation or delivery preparation. At the final parent save: stop before saved validation or delivery preparation. Preserve identities already actually supplied by creation, while distinguishing allocated identity from a confirmed matching save.
- If the disagreeing body first appears during the separate Saved Validation fresh read rather than the save-internal read, stop before Validate Epic Body, Validate Initiative Body, saved goal/graph checks or delivery preparation.
- Report intended and observed body evidence and the issue identity. Do not substitute a draft, disregard the mismatch because the HTTP write succeeded, or claim agreement from a prior read. No automatic retry/repair or rollback is selected by these failure instructions.
- Terminal: blocked publication/readback discrepancy, with preceding successful saves reported only as partial confirmed results. The case does not specify which save/read mismatches, so the branch-specific stop points above are necessary; choosing a particular issue number would invent evidence.

## Limits and uncertainties

- This report demonstrates what an independent reader derives from the pinned source, not successful fixture execution or live tracker operation.
- All successful extra reads return latest saved state by stipulation. That resolves freshness for this interpretation, but cannot establish semantic body validity or complete requirement/work-item evidence.
- Cases 4–6 do not identify every failed call, failure phase or remote side effect. Their stop rules are clear; exact persisted partial state is not. Existing/new-parent variants are distinguished rather than silently collapsed.
- No priority numbers, repository URLs, initiative prefix, affected title/body bytes, sibling issue numbers or checker verdicts were invented. Those inputs are required for actual publication/checking, but do not prevent identifying the selected operation sequence.
- Read-only authorization means no source fixes, tracker repairs, commit or push is part of this trial. No additional agent was spawned.
