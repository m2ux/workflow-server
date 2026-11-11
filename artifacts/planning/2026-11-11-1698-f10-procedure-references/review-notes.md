# F10 Review Notes

Agent review of [#1699](https://github.com/m2ux/workflow-server/pull/1699) at 25866131e against `workspace`. The reviewed change runs from the merge base 2088c7a36, where E02 merged as 5e62cd146, to the head. The [review record](agent-review.json) holds the scope, criteria and validation.

## Findings

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | The SOLID Dependency Inversion rule placed a kind's implementation of its interface operations in Work Kind, which only declares and dispatches them. | nonblocking | The rule states that a kind implements the operations Work Kind declares in its own artifact, and its registration links them. Fixed in [e42cecbcb](https://github.com/m2ux/workflow-server/commit/e42cecbcb253bf372a4cd2a3ca58a337dbfa5510). |
| 2 | Deliver step 9 sent an `unsupplied` result to Merge, then allowed Merge only with a ready Review State. | nonblocking | The second bullet opens with Otherwise, and the hot-fix readiness test reads that wording. Fixed in [e42cecbcb](https://github.com/m2ux/workflow-server/commit/e42cecbcb253bf372a4cd2a3ca58a337dbfa5510). |
| 3 | About 37 artifact, mode and protocol links pointed at SKILL.md as the kind registry, and Work Kind's own definition linked it as the entry point. SKILL.md is the compilation entry, so each link formed a cycle into its own bundle. | blocking | Work Kind's Registration lists each kind with what it is, its artifacts and the operations each supplies; every reference links that field; the shared Links rule and the `link to the entry point` check forbid the link. Fixed in [f3d620038](https://github.com/m2ux/workflow-server/commit/f3d6200380b1f164aa560bd6f42fb6837845cf2d) and [34c5c4a64](https://github.com/m2ux/workflow-server/commit/34c5c4a64a39a6478167d1860f0e66c589504b74). |
| 4 | The shared Files rule said `structure.json` declares sections, but not that it names the registration section the check reads. | nonblocking | The rule names the `registration` key. Fixed in [25866131e](https://github.com/m2ux/workflow-server/commit/25866131e0ee81c784c19c9f55bcd1815b1dc9e3). |

## Checked and Clear

- **Step references.** Every rewritten reference links an existing numbered heading in its own file, and the checker reports none unlinked in any skill.
- **Unsupplied routes.** Each Work Kind operation that provides `unsupplied` has a caller that continues its own route: Deliver step 9 to Merge, Issue Delivery to Task Issues, Task Merge to Read and Record. Settle Board Status and Release Hold change nothing.
- **Registration.** Every operation the Registration links resolves to a heading in its kind's artifact, and Validate Body's general route is Validate Issue Body with the kind conditions.
- **Concrete kinds.** A general file needing one kind reads it from the item's kind in the Registration: Deliver and Hoist's kind "for work outside any initiative" matches that kind's line there, and Hoist's numbered prefix comes from the body artifact the Registration lists. Hot-fix links its own interface contract in Work Kind.
- **Other skills.** The check reports one link to the entry point outside work-planner, workflow-canon/references/review-mode.md:181, left for that skill's owner.

## Evidence Gap

Disclosure verification is structural: every route that needs the registration already applies a Work Kind operation and so reaches the same file. No live sub-agent walk ran for this change.
