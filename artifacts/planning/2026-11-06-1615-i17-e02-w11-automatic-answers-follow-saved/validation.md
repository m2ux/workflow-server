# W11 Validation

## Candidate

- Unit: I17:E02:W11, AC18.
- Base: `d0cabbc4f2840556650069e0158a3fcd13d82532`.
- Candidate: see `candidate.txt` (filled from the committed task head).
- Branch: `i17/e02/w11-automatic-answers-follow-saved`.
- Production component: `skills/work-planner/modes/advance-mode.md`; observing tests, concrete queue fixtures and catalogue accompany it.
- No tracker, shared engineering record, issue or PR writes are performed by this worker. No allowance decision beyond the dispatched implementation is taken.

## Observed Route Fixtures

Fourteen focused tests execute the installed queue program against offline board input and exercise the bounded source-selected continuation adapter. An automatic order answer and automatic ask answer select label assurance, save, board readback and recomputation before step 7. Controls cover a user answer, user-selected none with retained unplanned identity, held/unanswered decisions, save refusal, unavailable/stale board readback, refreshed pending decision, unresolved dependency evidence and convergence. Deleting the source readback call or recomputation call changes the observed route to pending.

The three original queue captures come from W02's `policy-observations.json` at `86df5e4c2ccc2516b46cb0be7cf89e1cc258480f`: before answer emits `order`, saved priority emits Ready calls without `order`/`ask`, converged board emits no further calls. Tests retain their concrete items/PRs/unplanned inputs in `advance-captures.json`, and use derived snapshots for ask/none, additional-decision and missing-dependency controls. These derived controls are synthetic fixtures, not historical tracker observations.

`focused.log` records 14 passing focused cases. `catalogue.log` records passing catalogue checks after explicit script invocation coverage is recorded. These fixtures execute queue computations and an explicitly bounded source grammar. They do not execute arbitrary prose, independently establish allowance interpretation, or make live tracker saves. Disposition and persistence responses are injected; fresh-context interpretation is a separate check.

## Independent Procedure Trace

Completed independent fresh-context reader at candidate29e85bae7d4008b75fe9526edf523b8540a92215. The reader verified the fixture manifest and source SHA, read the installed procedure and linked context, and selected operations for ten bounded scenarios without reading tests, expected observations or this validation file. Actual journals and installed queue computations support the recorded route.

Successful automatic order/ask answers save, confirm readback and recompute before the eligible next-write boundary. Held/unanswered, save refusal and unavailable/disagreeing readback stop. Refreshed pending decisions repeat resolution; unresolved references require missing evidence before continuation. The reader found no conflicting routing prose. See [reader-result.md](reader-result.md) and the A–J journals for actual operations, context reads and limitations.

This completes AC18's captured-queue and fresh-context procedure instruments. It is an offline fixture-backed reading, not a live tracker persistence or worker-execution run. The none path is exercised by the focused fixtures and was not independently selected in this bounded reader packet.

## Full Checks

- Planner: 1018 tests, 1017 pass and one opt-in skip, `planner.log`.
- Shared: 280 pass, `shared.log`.
- Installed document/model and command contract checks run in the planner suite. No state shape, operation contract or model map changes occur.
- Shared skill checker: 59 files, zero findings, `skill-check.log`.
- Whitespace: `git diff --check`, zero findings, `whitespace.log`.

Commands run from the task checkout using absolute `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_advance_decisions.py -v  # skills/work-planner
python3 -m unittest discover -s test                            # skills/work-planner
python3 -m unittest discover -s skills/test                     # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner # checkout root
git diff --check                                               # checkout root
```

The initial full run identified two catalogue failures because the queue invocation was hidden behind a test helper. The final test module invokes the actual script directly and the full suite passes. No production queue program changes are required.

## Review and Reading Scope

The diff is reviewed against the whole shared and skill guidelines: Advance owns continuation; Plan Change retains permission/held semantics; Board Queue retains completeness; Write retains Status/assignee and live convergence gates. Every new linked definition resolves. `disclosure.md` records the affected reading path and its limits. No other policy clarification is implemented, and W11 has no new dependency on E04 or the separate upstream PR repair.

## Publication Receipt

The coordinator publishes this record and the reader receipts before setting the corresponding PR Test Plan results or claiming AC18 satisfied. Final task SHA, plain-push result and clean worktree readback are recorded in `delivery-receipt.txt`.
