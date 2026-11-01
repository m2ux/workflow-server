# W13 Test Evidence

Tested revision: `c2418d10c` on `i11/e09/w13-epic-delivery-recorded-with`, cut from `i11/e09/workspace` at `400703b08`.

## T1 Call-site test

`EpicDeliveryCallers` in `skills/work-planner/test/test_documents.py` collects every line in the skill's Markdown that runs, re-runs or repeats Record Epic Delivery and asserts each names the epic bases. It also asserts the known callers are all found, that the operation's Inputs carry the fetched epic bases mapped to `--revision`, and that a line reading a result the operation reported is not a call.

- With the prose fix stashed, the test fails on 11 call sites: `artifacts/epic-issue-body.md:109`, `modes/align-mode.md:108`, `:112`, `:144`, `:146`, `modes/deliver-mode.md:138`, `modes/sync-mode.md:100`, `:104`, `:113`, `:133` and `protocols/review-pull-request.md:31`. These are the callers the review finding names.
- With the fix, `pytest skills/work-planner/test/test_documents.py`: 10 passed, 953 subtests passed.

## T2 Skill suite

- `pytest skills/work-planner/test -q`: 533 passed, 1046 subtests passed.
- `skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
