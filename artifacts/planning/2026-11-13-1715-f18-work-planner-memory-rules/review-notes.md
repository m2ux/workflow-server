# F18 Review Notes

An independent reviewer read the whole branch against `workspace` (c1c069b41..02cc78cb0) together with issue #1715. It followed every caller of Merge Delivery Pull Request, Produce Agent Review and Draft Initiative Issue Body, grepped the skill for stale text, and ran the planner suite and the skill-file check. d26dc4c00 fixes its four findings, and the session re-checked that change alone.

## Findings

1. **Blocking. Planning without a proposal reached a drafting step that needs one.** Draft Initiative Issue Body was scoped to a proposal and took its criteria from that proposal. Fixed: the step accepts the confirmed goal clauses and their sources as scope and criteria source, and Plan mode passes the proposal only where there is one.
2. **Nonblocking. SKILL.md's Plan summary named an approved proposal only.** Fixed: it names a confirmed goal for feature-scale work.
3. **Nonblocking. The Review Record scope always described the full diff.** Fixed: after a round of fixes, the scope describes the change since the previously reviewed head.
4. **Nonblocking. "None is deferred" named the removed disposition.** Fixed: the clause is cut.

## Rejected Observations

- Two open proposals boards, one bare and one prefixed, would print two numbers. This is unrealistic.
- A task pull request whose head is an epic base would trip the epic-review guard. This does not occur.
- Proposals Board Purpose and Plan mode both mention smaller work. Plan mode links Purpose for the judgment.
- One test_review_scope test name still says "deferred". It tests the invalid-disposition path.
- No caller can now reach the epic-review guard in Merge Delivery Pull Request. The guard is kept as the issue asks.

## Follow-Up Review

A second independent review of #1716 found four issues. The change d26dc4c00..31ad62178 fixes them, and the session re-checked that change alone.

1. **Engineering model.** Engineering-side files are pushed straight to `engineering` by the task session, with no base, task branch or pull request, and the bypass notice is expected. Fixed: rules.md's Planning-records branch rule states this once. Deliver step 6, Epic Integration's Hand Off and Merge Delivery Pull Request link to that rule, and Publish Planning Record no longer states the notice. deliver.py and delivery-branches.md already agreed with the rule.
2. **Blocking. Handed-off reviews were held again.** Epic Integration put a ready review back to draft on every sync. Fixed: step 1 first reads the pull request, the board and the agent review, and returns a current handed-off review without holding it. `test_a_current_handed_off_review_returns_before_any_hold` guards this. The re-check found that the check never passed without a board, and 9846016ec fixes that.
3. **Duplicate test.** `test_a_ready_epic_review_pull_request_is_never_merged` is removed, and the README counts are updated.
4. **Task Merge wording.** It now reads "Initiative completion does not gate the epic's closure."
