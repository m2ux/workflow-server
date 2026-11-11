# W39 Validation

## Candidate

- Unit: I17:E02:W39, AC12.
- Task base: `96241be5b` (origin/i17/e02/workspace after W37 #1692).
- Task head: `76da5ebd7`, branch `i17/e02/w39-fresh-reading-trials-confirm`.
- Component: the three files [w39.md](w39.md) declares. The change adds tests and their captured selection inputs and changes no skill instruction. The trials ran on `96241be5b`; the branch was then brought current at `a390ea9fe` with W38 #1694 and W42 #1693, which change other skill prose, so a repeat trial runs on that head. Suites at `a390ea9fe`: Work Planner 1212 tests OK (1 skipped), shared OK, checker 0 findings.

## Observing Tests

[test_reading_routes](https://github.com/m2ux/workflow-server/blob/i17/e02/w39-fresh-reading-trials-confirm/skills/work-planner/test/test_reading_routes.py), 20 tests, with selection facts in [reading-captures.json](https://github.com/m2ux/workflow-server/blob/i17/e02/w39-fresh-reading-trials-confirm/skills/work-planner/test/reading-captures.json) ([planner-suite.log](planner-suite.log)):

- **ContractSource.** Every contracted file and section resolves; each selection is linked inside the step that selects it; SKILL.md requires exactly Rules and Conventions, each mode entry the same pair, and Revise both guidelines whole; a selected section's read adds no before-use context; each route's closure is acyclic and neither requires nor links its excluded content.
- **CapturedInputs.** A supplied checkpoint selects no Sync refresh; a direct Standup reads board state, then Sync; unresolved evidence selects the issue reads; Understand without a pull request selects nothing past its entry; read-only Understand stops before publication; a bounded edit selects Check Skill Files alone.
- **TraceConformance.** A trace retrieving the contract in order conforms; missing common context, common context after the first use, a skipped selected operation, guidelines after the first edit, unrecovered truncation and an excluded section retrieved whole are each reported; recovered truncation conforms.

The structural classes hold at the base as well: the source already meets the encoded contracts, and the module adds the check rather than a fix.

## Fresh-Context Trials

Eight independent general-purpose sub-agents, each in a fresh context, each given a disposable clone of `96241be5b`, the captured inputs and authority limits, and no expected reading choice or prior finding. Captured network responses ([captures](captures/), [hashes](captures/captures.sha256)) were taken from the live tracker at 2026-11-11 05:03 UTC; the Understand review worktree was indexed at the pull request head before the trials. Traces come from each trial's transcript, not its own account: [evaluate.py](evaluate.py) takes every tool result in order and applies the module's `conformance` ([conformance.json](trials/conformance.json), per-call [trace.json](trials/) files, [evaluate.log](evaluate.log)).

| Trial | Inputs | Calls | Returned chars | Task result | Findings |
| --- | --- | --- | --- | --- | --- |
| standup-1 | [round 1](captures/standup/inputs.md) | 13 | 51,050 | Report rendered, matches a reference render | Rules and Conventions never read; Read Board State, Fetch All Delivery Pull Requests and Fetch Pull Request Issue Links never read |
| standup-2 | round 1 | 12 | 52,833 | Report rendered | Select Project Board and the three fetch operations never read |
| standup-3 | [round 2](captures/standup-r2/inputs.md) | 17 | 61,438 | Report rendered | Fetch All Delivery Pull Requests read only as a 25-line grep window, clipping the section |
| standup-4 | round 2 | 11 | 61,513 | Report rendered | Both pull-request fetch operations read only as grep windows; Create Proposals Board retrieved through a line range |
| understand-1 | [captured](captures/understand/inputs.md) | 65 | 285,388 | Overview and record drafted; stopped at publication | None |
| understand-2 | captured | 67 | 232,819 | Overview and record drafted; stopped at publication | None |
| revise-1 | [captured](captures/revise/inputs.md) | 15 | 92,295 | Two-file edit committed, checks pass; stopped at push | Rules and Conventions never read |
| revise-2 | captured | 23 | 102,980 | Same edit committed, checks pass; stopped at push | None |

- **Round 1 inputs named the command each captured file replaced.** That list let both Standup readers act without reading the operations, so a second round supplied the same files without naming their commands. Both rounds are retained.
- **Truncation.** Four trials met one persisted-output truncation each. Both Revise readers recovered the whole guidelines with a later read before their first edit; both Understand truncations were captured input files, read again in the next call.
- **Reuse.** Rules and Conventions were read once per run where read. Four readers fetched SKILL.md and the inputs twice in succession (standup-1, standup-2, understand-1, understand-2), and both Understand readers requested each GitNexus symbol context twice.
- **Unrelated content.** Apart from standup-4's line range, no trial retrieved an excluded mode, protocol or operation whole. Whole-file reads of selected artifacts did return sibling sections, which the contract records as volume rather than a requirement.
- **No savings claim.** The trials have no paired baseline, so their volumes establish only what each run retrieved.

## Result

AC12 is not met. Three of eight traces conform (both Understand, revise-2). The source supplies every contracted section at its point of use and imposes no extra requirement, but observed readers:

- skip the common Rules and Conventions that SKILL.md requires before mode selection (standup-1, revise-1);
- read a selected operation through a fixed-length window that stops short of its heading boundary (standup-3, standup-4), against the Linked sections rule.

## Full Checks

- Work Planner suite: 1199 tests, OK, 1 skipped ([planner-suite.log](planner-suite.log)).
- Shared suite, including the installed Work Planner model: 305 tests, OK ([shared-suite.log](shared-suite.log)).
- check_skill_files on skills/work-planner: 60 files, 0 findings ([skill-check.log](skill-check.log)).
- Whitespace: `git diff --check` on the staged change, clean.
