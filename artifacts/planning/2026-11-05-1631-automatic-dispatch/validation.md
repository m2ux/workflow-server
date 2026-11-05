# Automatic Dispatch Validation

## Tested Change

The implementation is based on `d0a62b8037bb1b8fdafac5bf0e0035ada8c64486` on `workspace`. The source, observing fixtures, artifact operations and delivery instructions are verified together in the issue's isolated worktree. The full suite is followed by focused document and checkout checks after the final protocol edits.

## Orchestration Fixtures

The 15 tests in `test_dispatch.py` exercise the production batch selector and start validator. Integration fixtures obtain their admitted units from the actual `deliver.py` survey and its JSON export. The successive-completion fixture keeps one authorization through W01/W04, W02 and W03, with capacity checked before each start. Additional fixtures exercise a capacity event without completion, held and blocked rows, Backlog and out-of-scope epics, joined-unit scope, repository identity, hot-fixes, stale offers, malformed observations and removal of an old export after a failed survey.

Lane fixtures bind an admitted export to the authorized survey board and requested lane and reject another lane's survey context. They observe the orchestration boundary; lane parsing and admission are delivered separately by I17 E03. The coordinator requires a survey that actually applies the requested lane and blocks when that evidence is unavailable.

Start fixtures withhold publication, matching reservation and successful readback evidence in order; execution is permitted only after all three exist. Starts also recheck actual free capacity and observed sessions. The mixed-state fixture starts independent work beside required human review and blocked work, retaining those holds and returning a stable stop when no scoped worker or eligible unit remains.

Coverage: AC1, AC2, AC3 and AC4.

## Planner Suite

Command: the worktree's absolute `scripts/sbx` launcher with `python3 -m unittest discover -s test`, from `skills/work-planner`.

Result: 863 tests, OK, with one opt-in live Development-link test skipped because no live test issue and draft pull request were supplied. [Complete output](planner-tests.txt).

## Shared Checks

- Shared checker suite: `python3 -m unittest discover -s skills/test`, 208 tests, OK.
- Final artifact/protocol interface suite: 11 tests, OK.
- Final checkout contract suite: 7 tests, OK.
- Skill-file checker: 54 files, zero findings.
- `git diff --check`: no findings.

The base branch's rule index named the absent `titles/italicised-verb` guideline. The index now names only the rules the installed guidelines carry.

## Disclosure Traces

Fresh-context dry runs trace a scoped refill after successive completions and a joined-unit start beside required review. Both identify the fixed authorization, current queue and survey, batch selection, whole Unit Dispatch protocol, ordered start gate and return to the live queue. The protocol's second reservation refreshes the board and epic body; contributor workers count toward the same actual capacity.

The observed reads also expose an inherited disclosure limitation: whole-file Deliver prerequisites load unrelated issue, pull-request, hot-fix and Hoist guidance. The initial revised mode requires 22 direct documents totaling 4,131 lines, as measured by the independent readers. Some oversized aggregate reads were truncated and recovered with smaller reads; one reader reports incomplete consumption of eight transitive support documents. These traces are not a passing claim for exclusion of unrelated context, consistent retrieval, token savings or live GitHub worker execution. The inherited breadth and prerequisite cycles are outside the dispatch-behavior change.

## Delivery Boundary

The implementation is published as a pull request into `workspace`. Current repository rules require one approving human review for that target. The API does not expose the issue auto-close setting; linking the delivery issue waits for the user's explicit confirmation that the setting is disabled. The issue remains open while its delivery pull request is unmerged.
