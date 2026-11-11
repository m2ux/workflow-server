# unit I17:E02:W39: unlaned, coverage AC12

> Delivery · Created 2026-11-11

The per-entry context contracts of Standup, Revise and Understand as a test module, and the fresh-context reading trials observed against them.

| File | Purpose |
| --- | --- |
| [w39.md](w39.md) | Files, scope, implementation and observing validation for W39. |
| [validation.md](validation.md) | Observing tests, the eight trials with their conformance, and full checks at the task head. |
| [captures/](captures/) | Captured requests, network responses and their hashes, as each trial received them. |
| [trials/](trials/) | Each trial's own result and its transcript-derived trace, with the conformance summary. |
| [evaluate.py](evaluate.py) | Extracts a trace from a transcript and applies the module's conformance check. |
| [calls.py](calls.py) | Lists a transcript's tool calls with result size and truncation. |

## Links

- [Epic](https://github.com/m2ux/workflow-server/issues/1615)
- [Context review](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and/context-review.md)
- [Prerequisite cleanup plan](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes/e02/prerequisite-cleanup.md)

## Change List

- **Held: AC12.** Five of eight traces do not conform ([validation](validation.md#result)); closing it needs a decision on how readers are held to the common context and section boundaries. Pull request #1695 stays open as a draft and unmerged.
- **Held: placement of #1696.** The arising standalone issue (review-worktree indexing and Change Surface base) awaits Hoist placement.
