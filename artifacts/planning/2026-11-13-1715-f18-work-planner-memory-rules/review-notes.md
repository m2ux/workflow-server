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

## Wording Pass

At ec2075cb6, the sentences this hot-fix adds state what holds. Merge Permission now names who merges each target within the authorization granted, and the autoMode example ends at what it allows. Sync's Unmerged branch now says that Close carries the review pull request through Epic Integration to the user. The re-check found no finding.

## Nesting Pass

The user chose to nest each introduction's reach beneath it.

- **Checker.** check_skill_files.py accepts a list item nested two spaces per level under the item that introduces it. Flat layout stays valid. Indentation with no introducing item, a skipped level, or a blank line before it is still reported.
- **Guidelines.** List introductions now holds the rule once, and the other procedure rules link to it.
- **Re-nesting.** 78 introductions in 22 files were re-nested by hand. Six were left as they are:
  - Five introduce named child headings, which Branch Headers allows: deliver-mode Record each provided result, hoist-mode Execute only the branch and work taken by another issue, sync-mode After the issue bodies and closures are saved, and hotfix Apply the status change.
  - One is a command detail whose body is an indented fenced block: pull-request Mark Review Ready's query file.

An independent reviewer found three items placed in the wrong reach, and 2319fcbed fixes them:

- advance-mode's queue recompute and Repeat now sit after the per-reference loop.
- standup-mode's Compose Standup Report again now sits after the per-initiative loop.
- plan-mode's Resume now sits under the major-project branch.
