# F15 Review Notes

## Review at fc4d2641b

Agent review of [#1710](https://github.com/m2ux/workflow-server/pull/1710) at fc4d2641b against `workspace` at ad6d35fa6. The [review record](agent-review.json)'s first entry holds the scope, criteria and validation.

- **Change since 9cae1adc2.** hotfix.py's module docstring and three test lines wrap at their modules' width; no word changes.
- **Findings.** None.

## Review at 9cae1adc2

Agent review of [#1710](https://github.com/m2ux/workflow-server/pull/1710) at 9cae1adc2 against `workspace` at ad6d35fa6. The [review record](agent-review.json)'s second entry holds the scope, criteria and validation.

- **Change since 156998dc6.** As the user decided, test_hotfix_readiness and its walk of Review Hot-fix Before Merge are deleted, since none of its tests ran a script on captures or fixtures, and test_deliver holds no scan of deliver.py's source for a second copy of the shared rules. The issue carries AC10 for both.
- **Findings.** Two, found by the coordinator's review and a width check, both fixed below.

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | hotfix.py's module docstring held one 149-character line where the rest wraps at about 100. | nonblocking | Re-wrapped with no word changed, in [4382c8b10](https://github.com/m2ux/workflow-server/commit/4382c8b100f0d239145bf60b64d2981417f02847). |
| 2 | Three lines the branch added ran past the modules' width: test_advance_decisions' docstring and two test_deps lines. | nonblocking | Wrapped, in [fc4d2641b](https://github.com/m2ux/workflow-server/commit/fc4d2641bb95852b6af03246b6ec749f60fcdeab). |

## Review at 156998dc6

Agent review of [#1710](https://github.com/m2ux/workflow-server/pull/1710) at 156998dc6 against `workspace` at ad6d35fa6. The [review record](agent-review.json)'s third entry holds the scope, criteria and validation.

- **Change since b1fca1a3c.** The merge of `workspace` brings in F08's pull request body check; hotfix.py's docstring keeps F08's body sections and names no letter operation, and the test README recounts every module.
- **Findings.** None.

## Review at b1fca1a3c

Agent review of [#1710](https://github.com/m2ux/workflow-server/pull/1710) at b1fca1a3c against `workspace`, over the whole branch from e6eb1af6d. The [review record](agent-review.json)'s fourth entry holds the scope, criteria and validation.

- **Change since 461977abe.** `deps.py` reads each Component entry as one whitespace-free `branch:path` and strips no leading `./`; Dependency Graph and Delivery Plan name the problem; the test README counts test_dispatch's 33 tests. The first commit's subject describes the check as it stands.
- **Findings.** None.

## Design Points

- **Script-test guards retired with the import rule.**
  test_agent_review, test_orphans, test_dispatch, test_format, test_deliver and test_sync each scanned a script's source for a kind module import or a kind name: copies of the retired import rule and of F14's retired kind-name rule. They are removed; each module keeps its registered stand-in kind test, which exercises the registry.
- **test_unit_dispatch removed whole.**
  Every test in it read Unit Dispatch's route from prose or quoted it. The relative-path fix it covered is tested in test_task_worktree, and check_start in test_dispatch.

## Review at 461977abe

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | The test README still said "The 34 tests of test_dispatch"; it has 33. | nonblocking | Counted 33, in [b1fca1a3c](https://github.com/m2ux/workflow-server/commit/b1fca1a3caa3223e8382a5e12700dcb2978a869c). |
| 2 | A test_deps fixture file was renamed `workspace:a.py` by the fixture rewrite. | nonblocking | Named `a.py` again, in [b1fca1a3c](https://github.com/m2ux/workflow-server/commit/b1fca1a3caa3223e8382a5e12700dcb2978a869c). |
| 3 | The leading `./` strip in `normalise` served only bare paths. | nonblocking | Removed from the script, its docstrings, Dependency Graph and the test, in [b1fca1a3c](https://github.com/m2ux/workflow-server/commit/b1fca1a3caa3223e8382a5e12700dcb2978a869c). |
| 4 | Check Dependencies did not name the new entry problem. | nonblocking | Dependency Graph and Delivery Plan name it, in [b1fca1a3c](https://github.com/m2ux/workflow-server/commit/b1fca1a3caa3223e8382a5e12700dcb2978a869c). |
| 5 | Prose after a `branch:` prefix passed as a file name, so "reports any other entry" overclaimed. | nonblocking | An entry holding whitespace is reported, in [b1fca1a3c](https://github.com/m2ux/workflow-server/commit/b1fca1a3caa3223e8382a5e12700dcb2978a869c). |
| 6 | The first commit's subject named the removed passes. | nonblocking | Reworded to "Check Fields for executable steps alone" in [bdb2f4523](https://github.com/m2ux/workflow-server/commit/bdb2f452314765b10b88cd15d983a745e40cf039). |
