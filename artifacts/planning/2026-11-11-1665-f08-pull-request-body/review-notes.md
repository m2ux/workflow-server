# F08 Review Notes

## Review at 4d25f1742

Agent review of [#1706](https://github.com/m2ux/workflow-server/pull/1706) at 4d25f1742 against `workspace`, over the whole branch from 9d020bc9b. The [review record](agent-review.json)'s first entry holds the scope, criteria and validation.

- **Change since c17efa133.** Only the hot-fix module docstring's closing sentence, rejoined onto one line.
- **Findings.** None.

## Design Point

- **Kinds report their own issue fields.**
  The Kind interface's `issue_fields` gives the sections of a pull request body holding a line of a field only the kind's issue carries. The hot-fix kind reports any `Target:` line outside fenced code, so `pull_request_body.py` reaches that knowledge through the registry and names no kind, as general scripts reach kinds through [Registration](https://github.com/m2ux/workflow-server/blob/skill/pull-request-body-check/skills/work-planner/artifacts/work-kind.md#registration).

## Review at c17efa133

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | The hot-fix module docstring's closing sentence was split across a short line. | nonblocking | Rejoined in [4d25f1742](https://github.com/m2ux/workflow-server/commit/4d25f17420826a2ec86155578565655723194fa7). |

## Review at d07d6e55a

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | The `Target:` check asked the kind's `target` operation, which reads one well-formed Overview line, so other forms and sections published clean. | nonblocking | The Kind operation `issue_fields` reports every section holding a `Target:` line, in [b1c78b53b](https://github.com/m2ux/workflow-server/commit/b1c78b53bc9b3826d7ece433c7a0441cca0cf784). |
| 2 | An epic review body without References passed. | nonblocking | `--review` requires Overview, Changes and References, in [b1c78b53b](https://github.com/m2ux/workflow-server/commit/b1c78b53bc9b3826d7ece433c7a0441cca0cf784). |
| 3 | Validate's step 2 restated the publish gate. | nonblocking | The sentence is removed in [b1c78b53b](https://github.com/m2ux/workflow-server/commit/b1c78b53bc9b3826d7ece433c7a0441cca0cf784); deliver-mode keeps its call, as each operation has two linked callers. |
| 4 | The text-flag pattern missed joined and hyphenated forms, and the conventions bullet split the Bodies rule from its example. | nonblocking | Widened with a test, and the bullet moved, in [c17efa133](https://github.com/m2ux/workflow-server/commit/c17efa1332484fa77c059dcf1886a5a0541cafce). |
