# W13 Test Evidence

Tested revision: `30a5894ed` on `i11/e09/w13-epic-delivery-recorded-with`, which merges `i11/e09/workspace` at `f8bc6c000` (W14 and W15 included) into the change at `c2418d10c`.

## T1 Call-site test

`EpicDeliveryCallers` in `skills/work-planner/test/test_documents.py` collects every line in the skill's Markdown that runs, re-runs or repeats Record Epic Delivery and asserts each names the epic bases. It also asserts the known callers are all found, that the operation's Inputs carry the fetched epic bases mapped to `--revision`, and that a line reading a result the operation reported is not a call.

- With the prose fix stashed at `400703b08`, the test fails on 11 call sites: `artifacts/epic-issue-body.md:109`, `modes/align-mode.md:108`, `:112`, `:144`, `:146`, `modes/deliver-mode.md:138`, `modes/sync-mode.md:100`, `:104`, `:113`, `:133` and `protocols/review-pull-request.md:31`. These are the callers the review finding names.
- With the fix, every call site passes.

## T2 Skill suite

- At `c2418d10c`: `pytest skills/work-planner/test -q`, 533 passed, 1046 subtests passed.
- At `30a5894ed`: `pytest skills/work-planner/test -q`, 535 passed, 1052 subtests passed.
- `skills/scripts/check_skill_files.py skills/work-planner`, at both revisions: 50 files checked, 0 findings.
