# unit I17:E02:W28: unlaned, coverage AC38

> Delivery · Created 2026-11-09

One separation fix row from the E02 component refinement. The declared one-file component and observing tests are in the work item.

| File | Purpose |
| --- | --- |
| [w28.md](w28.md) | Component, scope, implementation and observing validation for W28. |
| [validation.md](validation.md) | Observing tests, kind and import search and full checks for AC38. |

## Links

- [Epic](https://github.com/m2ux/workflow-server/issues/1615)
- [Component refinement](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-09-1615-i17-e02-separation-component-rows)
- [Ownership audit](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and)

## Delivery

- Pull request [#1678](https://github.com/m2ux/workflow-server/pull/1678), merged into i17/e02/workspace at c695a1ef4ff66b77c808cd8a69ee5e60db988009 from verified head 2ad7e53a1051e1211f4cebc6abda61045cf7c77e.
- Epic W28 links #1678 and AC38 is ticked; review pull request #1659 carries T15 and R13.
- Plan changes applied: Folded work, W28: the Kind interface in `scripts/kinds.py` gains `labels(issue)`, supplied by `scripts/hotfix.py` as `priority: 10`, and the `hotfix_faults` alias left without a caller is removed. None held. Arising issues: none.
