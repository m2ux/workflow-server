# Automatic Dispatch Validation

## Tested Change

The implementation is based on `d0a62b8037bb1b8fdafac5bf0e0035ada8c64486` on `workspace`, with final pushed head `117c4da825d25b2b5ca7395dee561885f849fadc`. The source, observing fixtures, artifact operations and delivery instructions are verified together in the issue's isolated worktree. Full-suite verification is followed by the final 17 orchestration fixtures and focused document and checkout checks for the final refinements.

## Orchestration Fixtures

The 17 tests in `test_dispatch.py` exercise the production batch selector and start validator. Integration fixtures obtain their admitted units from the actual `deliver.py` survey and its JSON export. The successive-completion fixture keeps one authorization through W01/W04, W02 and W03, with capacity checked before each start. Additional fixtures exercise a capacity event without completion, held and blocked rows, Backlog and out-of-scope epics, joined-unit scope, repository identity, hot-fixes, stale offers, malformed observations and removal of an old export after a failed survey.

The capacity-recovery fixture withholds the execution slot after record publication and reservation, retains the preparation while the live survey offers no free unit, and resumes the same batch when a slot returns. A stale offer overlapping that preparation starts no duplicate. An out-of-scope preparation keeps no run active. The CLI fixture also observes preparation-based waiting.

Lane fixtures bind an admitted export to the authorized survey board and requested lane and reject another lane's survey context. They observe the orchestration boundary; lane parsing and admission are delivered separately by I17 E03. The coordinator requires a survey that actually applies the requested lane and blocks when that evidence is unavailable.

Start fixtures withhold publication, matching reservation and successful readback evidence in order; execution is permitted only after all three exist. Starts also recheck actual free capacity and observed sessions. The mixed-state fixture starts independent work beside required human review and blocked work, retaining those holds and returning a stable stop when no scoped worker or eligible unit remains.

Coverage: AC1, AC2, AC3 and AC4.

## Planner Suite

Command: the worktree's absolute `scripts/sbx` launcher with `python3 -m unittest discover -s test`, from `skills/work-planner`.

Result: 865 tests, OK, with one opt-in live Development-link test skipped because no live test issue and draft pull request were supplied. [Complete output](planner-tests.txt).

## Shared Checks

- Shared checker suite: `python3 -m unittest discover -s skills/test`, 208 tests, OK.
- Final artifact/protocol interface suite: 11 tests, OK.
- Final checkout contract suite: 7 tests, OK.
- Skill-file checker: 54 files, zero findings.
- `git diff --check`: no findings.

The base branch's rule index named the absent `titles/italicised-verb` guideline. The index now names only the rules the installed guidelines carry.

## Disclosure Traces

Fresh-context dry runs trace a scoped refill after successive completions and a joined-unit start beside required review. Both identify the fixed authorization, current queue and survey, batch selection, whole Unit Dispatch protocol, ordered start gate and return to the live queue. The protocol's second reservation refreshes the board and epic body; contributor workers count toward the same actual capacity.

The observed reads also expose an inherited disclosure limitation: whole-file Deliver prerequisites load unrelated issue, pull-request, hot-fix and Hoist guidance. The initial revised mode requires 22 direct documents totaling 4,131 lines; the repeated trace at `de60ebf439408cbcc282efd7419832150c44fb86` measures 4,135, as reported by the independent readers. Some oversized aggregate reads were truncated and recovered with smaller reads; one reader reports incomplete consumption of eight transitive support documents. These traces are not a passing claim for exclusion of unrelated context, consistent retrieval, token savings or live GitHub worker execution. The inherited breadth and prerequisite cycles are outside the dispatch-behavior change. The trace also notes inherited underspecification of direct board selection and board-wide maintenance inside Advance when delivery starts are scoped.

## Section Accounting

The base-to-head section comparison reports 405 sections at the base and 417 at `117c4da82`: twelve added sections and three differing sections, with none removed. It preserves the delivery plan's existing eligibility definitions. The coordinator's initial selection, survey, merge and reporting responsibilities occupy its main path and refill procedure; publication, reservation, preparation and start occupy Unit Dispatch. All twelve worker-delivery steps remain in Run Delivery Session. Modified and added sections were read against their guidelines and call inputs. The comparison's nonzero exit reports expected added and differing sections, not a broken validation command.

## Delivery Boundary

The implementation is published as [PR #1636](https://github.com/m2ux/workflow-server/pull/1636) into `workspace`. Current repository rules require one approving human review for that target. The user explicitly confirmed that issue auto-close is disabled. The Development relation was then added and read back from both ends: issue #1631 holds PR #1636, and PR #1636 holds issue #1631, each once. The final source head is pushed and its worktree is clean. The issue remains open while its delivery pull request is unmerged. No GitHub check runs are present; test results above are local evidence.
