# when expressions: parentheses and precedence before OR step-gate migration — Complete

> Enhancement · branch `chore/379-when-expressions-parentheses-precedence` · PR [#383](https://github.com/m2ux/workflow-server/pull/383) · 2026-08-01

## Summary

Shipped a shared `when` expression module (parentheses, C-style precedence, `||` / `&&` / `!`) with fail-closed evaluation for tests and guards, and migrated four nested OR keep-sites to parenthesized `when:`. Production step gates stay agent-evaluated; multi-agent harness authority stays out of scope. Plan: [06-work-package-plan.md](06-work-package-plan.md). ADR: [0009-shared-when-expression-module.md](../../adr/0009-shared-when-expression-module.md).

## Results

- Validation: all checks green (typecheck, test:ci 811 passed, check:all 20/20) — session bag; CI on head green before merge.
- Success criteria: all met ([plan / requirements](03-requirements-elicitation.md)).
- Files changed: see [change-block index](10-change-block-index.md).
- Design decisions: recorded in the [plan](06-work-package-plan.md) and [assumptions log](02-assumptions-log.md). ADR records the shared-module choice.

## Open Work

- Deferred items: [register](deferred-items.md) — 6 open, 0 raised as issues in this package.

## Cost

Token use and cost estimate: not recorded in session state for this run (no usage ledger) — omit fabricated figures.

## Known Limitations

- **Agent-evaluated production gates** — the module is the reference for tests/guards; production truth remains agent-side until a later package.
- **Unsigned commits on the PR range** — branch commits were `%G? = N`; merge proceeded under operator review=pass after strategic-review declined resign.
- **Checkpoint / loop OR** — `condition_not_met` and loop continuation predicates stay on structured `condition:` (deferred D-3 / D-4).

## Lessons Learned

- REST `ready_for_review` returned 404; `gh pr ready` undrafted successfully — host protocol must keep a working undraft path under the REST-only policy.
- Operator `review = pass` with an empty review surface is a valid approved outcome when CI is green.

## Workflow Retrospective

[messages: resume continuation · non-checkpoint: operator “continue #383 with review = pass” · session quality: Minor friction]
[trace: [14-session-trace.md](14-session-trace.md) · cost: none recorded]

### Observations

- [process] Operator resumed at `review-received` with explicit pass — empty GitHub review threads; outcome treated as approved.
- [friction] `next_activity` with `activity_id=submit-for-review` re-entered the same activity; target id must be the *next* activity (`complete`).
- [friction] Undraft via REST `…/ready_for_review` 404; `gh pr ready` worked (technique path).

### Recommendations

1. **Medium:** Document undraft fallback when REST ready_for_review 404s → `github-cli-protocol/mark-ready.md`.
2. **Low:** Orchestrator resume notes: `activity_id` is enter-target, not “current finishing” id.

**Key takeaway:** Review=pass with empty threads still needs mark-ready, outcome checkpoint, and merge before complete-status flip.
**Action required:** no
