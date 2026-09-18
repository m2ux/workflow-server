# Activity delivery sizes, before and after the response bound (#812)

Every activity of every workflow the corpus reaches by a straight walk, delivered once to a fresh
worker identity declaring a 200,000-token window (full delivery, no reference collapse). 115 of the
corpus's 146 activities are reachable that way; the rest sit behind a transition the sweep does not
satisfy and are not measured here.

Corpus at `5fa925ae`. Server before: `main` at `7c6288af`. Server after: `fix/812-activity-response-bound`.

## Totals

| Reading | Before | After |
|---|---|---|
| Activities measured | 115 | 115 |
| Responses past 60,000 characters | 38 | 0 |
| Largest response | 113,032 | 59,411 |
| Total delivered characters | 6,528,790 | 5,481,355 |
| Step techniques inlined | 469 | 211 |
| Activities inlining no step | 8 | 13 |
| Activities deferring a contract operation body | 0 | 1 |

## What the parts cost, before any bound

Composed offline from the same definitions, for the two activities the bound binds hardest on.

| Activity | Role rules | Operation bodies | Eligible steps | Activity body | Sum |
|---|---|---|---|---|---|
| `work-package/start-work-package` | 17,246 | 16,748 (7) | 50,679 (11) | 28,624 | 113,297 |
| `workflow-design/scope-and-draft` | 22,721 | 19,254 (8) | 36,492 (9) | 18,712 | 97,179 |

No activity in the corpus has rules and body together past the bound: the largest such floor is
`start-work-package` at 45,870 of 60,000. So the bound never has to cut into the contract or the
definition — but for two activities it cannot leave the contract's operation bodies whole either,
which is what settles that both procedure sets have to be boundable.

## Per-activity change

Only the 43 activities whose inlined step count changed. Unchanged rows are omitted.

| Activity | Steps before → after | Characters before → after |
|---|---|---|
| plain-language/evaluate | 4 → 2 | 60,703 → 55,597 |
| plain-language/intake-and-profile | 3 → 2 | 59,213 → 55,141 |
| prism/generate-report | 2 → 1 | 60,190 → 52,378 |
| prism-audit/audit-finalize | 6 → 5 | 53,852 → 52,863 |
| prism-audit/execute-analysis | 4 → 1 | 60,577 → 52,213 |
| prism-audit/prompt-generation | 7 → 5 | 55,167 → 51,361 |
| prism-evaluate/consolidate-report | 5 → 4 | 51,533 → 50,295 |
| prism-evaluate/execute-analysis | 4 → 1 | 61,545 → 53,221 |
| prism-evaluate/resolution-dialogue | 4 → 3 | 55,297 → 53,783 |
| remediate-vuln/assumptions-review | 7 → 1 | 80,439 → 54,673 |
| remediate-vuln/codebase-comprehension | 8 → 1 | 89,807 → 56,423 |
| remediate-vuln/complete | 9 → 3 | 79,531 → 53,255 |
| remediate-vuln/design-philosophy | 9 → 2 | 89,995 → 57,154 |
| remediate-vuln/implement | 10 → 1 | 96,250 → 55,872 |
| remediate-vuln/implementation-analysis | 8 → 2 | 81,491 → 56,201 |
| remediate-vuln/plan-prepare | 10 → 2 | 90,074 → 56,092 |
| remediate-vuln/post-impl-review | 10 → 0 | 93,917 → 50,938 |
| remediate-vuln/requirements-elicitation | 10 → 4 | 75,559 → 52,737 |
| remediate-vuln/research | 10 → 2 | 92,141 → 57,346 |
| remediate-vuln/start | 9 → 4 | 68,115 → 54,749 |
| remediate-vuln/strategic-review | 12 → 2 | 100,565 → 55,356 |
| remediate-vuln/submit-for-review | 4 → 1 | 68,178 → 57,972 |
| substrate-node-security-audit/reconnaissance | 9 → 5 | 62,480 → 53,727 |
| work-package/assumptions-review | 7 → 1 | 78,263 → 53,871 |
| work-package/codebase-comprehension | 8 → 1 | 88,051 → 55,670 |
| work-package/complete | 9 → 3 | 77,475 → 52,239 |
| work-package/design-philosophy | 9 → 2 | 87,561 → 56,255 |
| work-package/implement | 10 → 1 | 93,001 → 55,074 |
| work-package/implementation-analysis | 8 → 2 | 79,292 → 55,043 |
| work-package/plan-prepare | 11 → 3 | 93,039 → 57,046 |
| work-package/post-impl-review | 10 → 0 | 91,585 → 50,820 |
| work-package/requirements-elicitation | 10 → 4 | 73,614 → 51,710 |
| work-package/research | 10 → 2 | 89,212 → 56,202 |
| work-package/start-work-package | 11 → 0 | 113,032 → 59,179 |
| work-package/strategic-review | 11 → 1 | 95,851 → 54,309 |
| work-package/submit-for-review | 9 → 1 | 89,800 → 57,145 |
| workflow-authoring/quality-review | 7 → 3 | 69,027 → 49,535 |
| workflow-authoring/validate-and-commit | 3 → 1 | 68,596 → 52,715 |
| workflow-design/intake-and-context | 3 → 1 | 71,470 → 55,913 |
| workflow-design/post-update-review | 18 → 2 | 83,676 → 52,227 |
| workflow-design/quality-review | 7 → 0 | 71,423 → 49,981 |
| workflow-design/requirements-refinement | 7 → 1 | 83,902 → 52,388 |
| workflow-design/scope-and-draft | 9 → 0 | 99,026 → 59,411 |

## Which order to give way in

Two orders were simulated over all 146 activities, filling the room the bound leaves after the
activity body and the role's rules: the contract's operation bodies first and step techniques with
the remainder, or the reverse.

| Reading | Operations first | Steps first |
|---|---|---|
| Operation bodies inlined | 980 of 983 | 747 of 983 |
| Step techniques inlined | 314 of 517 | 425 of 517 |
| Items deferred to a fetch by id | 206 | 328 |
| Activities inlining no step | 2 of 134 | 0 of 134 |

Operations first is what the engine does. Two readings decide it. The contract is the fixed share of
every delivery to one context and collapses to markers from that context's second activity onward,
so spending scarce first-delivery room on it buys the room back for every later activity; a step
technique is the variable share and never collapses. And a step the bound leaves out has the older,
better-travelled deferral path — a worker fetches it at the step it reaches, which is what a step
past the budget has always done.

## Second delivery to the same context

`work-package/start-work-package`, delivered twice to one worker identity, the second call asking for
reference delivery.

| Reading | First | Second |
|---|---|---|
| Response characters | 59,179 | 52,349 |
| Role contract share | 29,182 | 4,018 |
| Operation bodies deferred | 2 | 0 |
| Step techniques inlined | 0 | 3 |

The contract collapses to markers, and the room that frees carries the two operation bodies the first
delivery deferred and three step techniques it had no room for. Across the nineteen gate crossings of
a full `work-package` walk, the contract's share of a re-request is 97.3% smaller than its share of
the dispatch that preceded it.

## How to reproduce

The sweep is a throwaway script driving the real server over the in-memory transport: for each
workflow, one session, then `next_activity` and `get_activity` per activity under a fresh `agent_id`
declaring 200,000 tokens, recording the response length and `_meta.delivery_cost`. The batch figures
come from `npm run bench:batch`, and the fixture cost gate from the `bench:token` invocation
`verify.yml` runs.
