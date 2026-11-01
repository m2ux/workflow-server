# W26 Test Results

Evaluated at commit `120a6ca54` on `i11/e10/w26-each-command-names-the`, which merges `i11/e10/workspace` at `212bedd48`.

Changed paths: `skills/work-planner/SKILL.md`, `skills/work-planner/test/test_checkouts.py`, and files under `skills/work-planner/artifacts/` (delivery-branches, delivery-brief, planning-record, pull-request, repository-graph), `skills/work-planner/modes/` (all ten) and `skills/work-planner/protocols/` (all six). All lie within the work item's file-change declaration.

## T1

**Each call to an acting command or operation names a checkout** (AC38).

`cd <worktree> && sbx python3 -m pytest skills/work-planner/test/test_checkouts.py -q` — 7 passed, 683 subtests passed.

`CommandsActingOnTheirCheckout.test_a_command_running_git_where_it_stands_declares_it` holds every command specification: 10 in Delivery Branches and 5 in Repository Graph declare `**Acts on:** the checkout it runs in.`, and Find Engineering Worktree, Read Checkout Revision and Read Checkout Status take their checkout through `git -C` and declare none. `test_each_call_to_an_acting_section_names_a_checkout` closes the acting set over artifact operations (Update Epic Base, Merge Task Pull Requests, Measure Repository Change and the rest) and finds every call to one naming a checkout from the vocabulary.

## T2

**The test fails at `27ea98734`, naming the Update Epic Base call** (AC38).

`git archive 27ea98734 skills` was extracted to a scratch directory, the new `test_checkouts.py` copied into it, and the test run there: 70 failed, 6 passed. Among the failures:

```text
AssertionError: set() is not true : artifacts/pull-request.md:151 *Merge* Task Pull Requests calls *Update* Epic Base naming no checkout
```

Also failing: the vocabulary (SKILL.md states no Checkouts), each mode and protocol's missing declaration, and every other unnamed call.

## T3

**Each mode and protocol declares where it runs** (AC39).

`ProceduresDeclaringTheirCheckout` passes: all ten modes and six protocols declare `**Runs in:** the project checkout.`, Run Delivery Session declares `the unit checkout`, no subsection restates its file's checkout, and no artifact declares one.

## T4

**A call into another checkout passes it** (AC40).

`CallsIntoAnotherCheckout.test_a_call_into_another_checkout_passes_it` passes. Run Delivery Session (unit) calls Merge Task Pull Requests with the project and unit checkouts, both among its Inputs, and runs Task Merge and Hoist Mode naming the project checkout they run in. Align Mode and Deliver Mode (project) pass the unit checkout to Update Task Branch and Merge Task Pull Requests, whose Inputs name it. Change Overview (project) passes the review checkout to Measure Repository Change.

## T5

**The skill suite and skill check hold**.

`sbx python3 -m pytest skills/work-planner/test -q` — 652 passed, 1 skipped, 1818 subtests passed. `sbx python3 skills/scripts/check_skill_files.py skills` — 77 files checked, 0 findings.
