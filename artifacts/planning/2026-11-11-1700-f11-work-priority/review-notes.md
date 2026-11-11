# F11 Review Notes

Agent review of [#1701](https://github.com/m2ux/workflow-server/pull/1701) at 55c1ae77b against `workspace`. The reviewed change runs from the merge base e42cecbcb, F10's reviewed head, to the head. The [review record](agent-review.json) holds the scope, criteria and validation.

## Findings

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | Check Dependencies in dependency-graph.md restated the Priority Sets rule that epics sharing a number start together. | nonblocking | The sentence names the set those epics form and links [Priority Sets](https://github.com/m2ux/workflow-server/blob/skill/work-priority/skills/work-planner/artifacts/work-priority.md#priority-sets). |
| 2 | Work Priority's opening sentence began with the lower-case link text `priority`. | nonblocking | The sentence opens "Its script, priority, implements". |

Both fixes are in [55c1ae77b](https://github.com/m2ux/workflow-server/commit/55c1ae77b2895c0b2f84921751e25c37604fe8f0).

## Checked and Clear

- **One home.** Priority Label, Priority Sets, Epic Priority and Execution Order are headed only in Work Priority, and every file naming one links it; the board queue keeps only the statuses and report lines it derives.
- **Survey order.** `ordered_epics` passes the same rank, group and key as before through `execution_key`, so the survey and dispatch export order is unchanged.
- **Standup order.** The Next list takes Execution Order's initiative tie-break, so equally ranked initiatives keep their epics together; an item with no epic and an epic whose initiative is off the board group by initiative prefix at unranked priority, with lower-cased repository keys.
- **Hot-fix label.** `labels` builds `priority: 10` through `priority.label`, which refuses a non-positive or non-integer value.
