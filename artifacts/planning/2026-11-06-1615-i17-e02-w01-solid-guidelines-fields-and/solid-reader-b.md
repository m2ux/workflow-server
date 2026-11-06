# SOLID Consumer Trial B

## Scope and Identity

- Read-only fresh-context trial: determine the route and checks for a small artifact field-contract edit and assess state, derivation and policy boundaries.
- Checkout: /home/mike1/projects/dev/workflow-server/.worktrees/i17/e02/w01-solid-guidelines-fields-and
- Expected and observed HEAD before and after the walk: 358287d8cc7ede34ed0ce70f330cd2bc758af2d6
- git status --porcelain=v1 returned no entries before and after. No source or tracker edits occurred.
- No artifact or proposed field change was named. I chose artifacts/task-body.md#delivery-selection as an explicit concrete example; no edit was invented or applied.
- No memory or prior trial findings were read. No agents were spawned.

## Actual Reads

All repository reads and the checker used /home/mike1/projects/dev/md-composer/scripts/sbx from the specified checkout. The first sandbox execution failed because namespace creation was denied; the same read succeeded with require_escalated. The preliminary sbx --help read returned helper usage only.

1. Complete skills/work-planner/SKILL.md, plus initial HEAD and status checks. Read opening, Modes and Dependencies. Selected Revise for a change to the skill's artifact contract.
2. Complete skills/work-planner/rules.md, conventions.md and modes/revise-mode.md in one batch. Rules and Conventions are required before mode selection. Revise's Procedure, Outcomes, Commands and Fields returned completely.
3. Requested complete skills/guidelines.md and skills/work-planner/guidelines.md as Revise step 1 explicitly requires. The combined output was truncated. The shared guidelines returned visibly complete through Changes. Skill-specific output lost part of SOLID and sections before Operations; Operations through Changes returned completely.
4. wc -l and heading inventory for both guidelines located recovery boundaries: shared 198 lines, skill-specific 322 lines.
5. Recovered skill-specific lines 1-124 with sed: complete opening, SOLID and its eight subsections, Titles, Procedure and Prose. With the returned suffix, both required whole guideline documents were received completely. A request was not treated as proof of receipt.
6. Heading inventory, incoming-link search and complete artifacts/task-body.md. Read opening; Sync Task Issue command; all Fields (template, Titles, Open Questions, Acceptance Criteria, Sections, Task Record, Pull Request Records, Issue Links, Delivery Selection, Output Body, Delivery Findings, Workspace). Markdown headings inside the fenced template appeared in the inventory but were treated as template content. Incoming search returned Sync mode's Titles and command references, Issue Delivery's command/output references, and Align mode's whole-Fields reference. Those other mode/protocol bodies were not loaded.
7. Executed Check Skill Files for skills/work-planner.
8. Rechecked HEAD/status and retrieved exact heading line numbers for report pointers. This was a heading search, not another body read.

## Completeness, Repetition and Unrelated Context

- One truncation occurred; one bounded recovery read restored the missing required content. The recovery repeated already-returned early skill-guideline prose. All other full body reads occurred once.
- Complete Rules/Conventions were reused when Revise linked them again. Both complete guideline documents supplied later section references without rereads.
- Whole guidelines contain mode, protocol, entry-point, script and other family details not directly needed by a field-only edit. Revise explicitly mandates these whole reads: this is real context overhead of the declared route, not accidental traversal. No context-token savings claim is made.
- The full task-body read included sibling fields/template beyond Delivery Selection. It supplied artifact context and the whole-Fields schema consumer. The shared Acceptance Criteria and epic-body links were not followed because the selected concrete field did not depend on them.
- No configuration, tracker data, board operation bodies, graph setup or unrelated mode procedures were read. Incoming-link searches returned their matching lines only.
- The first report-write attempt was blocked before execution by a shell hook detecting literal Markdown backticks inside a quoted Python heredoc. The retry omits backticks. No approval rejection or source mutation resulted.

## Resulting Instructions and Checks

1. Establish the artifact, exact field change and intended behavior. A real edit would interview until those are clear (Revise step 2). The trial supplied enough scope to describe the route.
2. Work in a dedicated worktree on the change's branch; preserve unrelated edits. Identify the rule's owning artifact, all direct field callers, whole-Fields/schema consumers and scripts/docstrings/tests stating the contract (Revise steps 2-3; shared Changes; Encapsulation/Public fields).
3. Put shape, members, types, values, optionality, empty cases and actual serialized examples in Fields. Preserve every existing condition. In the concrete example, empty verified IDs is a permitted input state; local command bindings expose its consumer (task-body.md:7-23,90-94).
4. Put derivation, state/membership selection, evidence gathering, refusal, execution, retry and continuation in callable operations, with invocations in named Commands specifications. Give a nameable derived result its owning artifact/operations even without persistence. Do not manufacture a policy-shaped input object (Field Boundaries; Artifacts/Virtual artifacts and No procedure in Fields).
5. Keep a rule used by one capability in its step or command details. Shared policy has one subject-owned Guidance home, linked by consumers. Reference counts include whole-section schema consumers (Artifacts/No procedure in Fields).
6. Update callers whenever public field shape/home changes. For the selected example, command bindings and Align's whole-Fields consumer are relevant. This incoming-link sample is not a complete executable-consumer audit; a real change must search consumed identifiers/representations in scripts and tests.
7. Review every changed file against both whole guidelines: ownership, one home, current design prose, layout, contracts and I/O links, resolving links/anchors, common prerequisites, progressive disclosure and stale claims. Preserve semantic conditions (Revise step 5; Contextual contracts; Artifacts/Detail).
8. Run Check Skill Files for every affected skill. Run script tests if executable code, a consumed template or a test changes. Compare Section Bodies if sections move. Check entry-point frontmatter if SKILL changes. Apply disclosure verification with the representative bounded Revision scenario, including actual independent consumers if reading paths change; resolve required dependencies (Revise step 6; shared Disclosure Verification).
9. For an actual completed edit, commit distinct work, push and report changed files (Revise step 7). These mutations are outside this trial.

## Boundary Assessment

The guidelines provide a clear, usable distinction; they do not equate a conditional word with a violation.

- State: skill guidelines Field Boundaries (lines 51-58) permits values, types, states, invariants, conditional constraints and schema examples in Fields. An empty verified-ID case is a legitimate contract condition.
- Derived decisions: the same section assigns derivation, membership/state selection, gathering evidence, refusal, execution, retry and continuation to callable behavior. Declarative wording that derives a caller action still counts as behavior. This closes the ambiguity where an algorithm reads like a definition.
- Ownership: Single Responsibility puts constraints with their subject; Encapsulation requires caller updates. Artifacts/Virtual artifacts supplies a home for a nonpersisted derived result. Artifacts/No procedure in Fields distinguishes single-capability detail, shared policy Guidance and named derived output.
- Policy: Policy Review (lines 60-65) requires identical inputs and entry conditions, pinned source, current prose, observed outcomes and owner. Different contexts may produce different outcomes. Record competing interpretations and obtain confirmation before a policy-changing fix.
- Controls: Policy Review retains enums, conditional invariants, result shapes, literal examples, ordinary definition cycles and bounded retries. Keywords or copied instruction strings alone establish neither failure nor success.
- Reading/execution: Interface Segregation/Before-use ordering distinguishes ordinary field references from explicit prerequisites and execution calls. Runtime Rules bound linked reads. Incoming links to Align/Sync did not cause those modes to run.

Application test: does the statement constrain supplied/produced shape, or compute a new result/action from evidence? The latter needs a callable owner even when written declaratively. Apparent policy conflicts need matched contexts before semantic normalization.

## Validation and Limits

- Executed under required sandbox: python3 skills/scripts/check_skill_files.py skills/work-planner
- Exit 0: 59 files checked, 0 findings.
- No script tests or section comparison ran: no executable/template/test changed and no section moved. No tracker operations occurred.
- The static check and independent consumer result are distinct evidence. The checker passed its implemented checks; the reader located and explained the boundary. Neither proves behavior for actual policy disagreements or every Fields section.
- No ambiguity in the guidance prevents a specified bounded field edit. The exact artifact/change remains unspecified in the trial request; Delivery Selection is an example only.
- Actual policy-changing work still requires captured matched-context evidence and confirmation of competing interpretations. This trial identified no concrete policy disagreement requiring confirmation.
