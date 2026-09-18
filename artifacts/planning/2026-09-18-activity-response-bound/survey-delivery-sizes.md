# Activity delivery sizes, before and after the response bound (#812)

Every activity of every workflow the corpus reaches by a straight walk, delivered once to a fresh
worker identity declaring a 200,000-token window (full delivery), then asked for again by the same
identity under reference delivery. 115 of the corpus's 146 activities are reachable that way; the
rest sit behind a transition the sweep does not satisfy and are not measured here.

Corpus at `5fa925ae`. Server before: `main` at `7c6288af`. Server after: `fix/812-activity-response-bound`.

## Totals

| Reading | Before | After |
|---|---|---|
| Activities measured | 115 | 115 |
| Responses past 60,000 characters | 38 | 0 |
| Largest response | 113,032 | 59,411 |
| Total delivered characters | 6,528,790 | 5,574,882 |
| Step techniques inlined | 469 | 247 |
| Activities inlining no step | 8 | 12 |
| Activities deferring a contract operation body | 0 | 1 |

The largest re-request under reference delivery is 58,761 characters, and no re-request exceeds the
bound either. On every one of the 230 deliveries the sweep made, the server's own response tally is
at or above what actually went over the wire — so the figure the bound is applied to never
understates the response it is bounding.

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

Only the 38 activities whose inlined step count changed. Unchanged rows are omitted.

| Activity | Steps before → after | Characters before → after |
|---|---|---|
| plain-language/evaluate | 4 → 3 | 60,703 → 57,511 |
| prism/generate-report | 2 → 1 | 60,190 → 52,378 |
| prism-audit/execute-analysis | 4 → 3 | 60,577 → 58,623 |
| prism-evaluate/execute-analysis | 4 → 2 | 61,545 → 55,715 |
| remediate-vuln/assumptions-review | 7 → 1 | 80,439 → 54,673 |
| remediate-vuln/codebase-comprehension | 8 → 1 | 89,807 → 56,423 |
| remediate-vuln/complete | 9 → 5 | 79,531 → 58,861 |
| remediate-vuln/design-philosophy | 9 → 3 | 89,995 → 59,166 |
| remediate-vuln/implement | 10 → 1 | 96,250 → 55,872 |
| remediate-vuln/implementation-analysis | 8 → 3 | 81,491 → 58,461 |
| remediate-vuln/plan-prepare | 10 → 3 | 90,074 → 58,542 |
| remediate-vuln/post-impl-review | 10 → 0 | 93,917 → 50,938 |
| remediate-vuln/requirements-elicitation | 10 → 5 | 75,559 → 54,963 |
| remediate-vuln/research | 10 → 2 | 92,141 → 57,346 |
| remediate-vuln/start | 9 → 7 | 68,115 → 59,299 |
| remediate-vuln/strategic-review | 12 → 2 | 100,565 → 55,356 |
| remediate-vuln/submit-for-review | 4 → 1 | 68,178 → 57,972 |
| substrate-node-security-audit/reconnaissance | 9 → 7 | 62,480 → 59,098 |
| work-package/assumptions-review | 7 → 1 | 78,263 → 53,871 |
| work-package/codebase-comprehension | 8 → 1 | 88,051 → 55,670 |
| work-package/complete | 9 → 6 | 77,475 → 59,191 |
| work-package/design-philosophy | 9 → 3 | 87,561 → 58,193 |
| work-package/implement | 10 → 1 | 93,001 → 55,074 |
| work-package/implementation-analysis | 8 → 3 | 79,292 → 57,290 |
| work-package/plan-prepare | 11 → 3 | 93,039 → 57,046 |
| work-package/post-impl-review | 10 → 0 | 91,585 → 50,820 |
| work-package/requirements-elicitation | 10 → 6 | 73,614 → 58,756 |
| work-package/research | 10 → 2 | 89,212 → 56,202 |
| work-package/start-work-package | 11 → 0 | 113,032 → 59,179 |
| work-package/strategic-review | 11 → 1 | 95,851 → 54,309 |
| work-package/submit-for-review | 9 → 1 | 89,800 → 57,145 |
| workflow-authoring/quality-review | 7 → 5 | 69,027 → 56,244 |
| workflow-authoring/validate-and-commit | 3 → 2 | 68,596 → 57,626 |
| workflow-design/intake-and-context | 3 → 1 | 71,470 → 55,913 |
| workflow-design/post-update-review | 18 → 5 | 83,676 → 59,093 |
| workflow-design/quality-review | 7 → 1 | 71,423 → 58,045 |
| workflow-design/requirements-refinement | 7 → 2 | 83,902 → 54,270 |
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

The simulation priced each entry at its own serialization; the engine prices it at the size it is
written in, nested under the map it rides and with its shared blocks already collapsed. So the
engine inlines somewhat more than this table projects — 247 steps against the 314 projected here is
the difference between simulating 146 activities and walking the 115 a straight walk reaches.

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

## What a batch now saves

`npm run bench:batch` over the three-activity analysis run, at a 200,000-token window.

| Reading | Before | After |
|---|---|---|
| One worker per activity | 250,174 | 167,787 |
| One worker for the run | 210,976 | 157,645 |
| Character saving | 15.7% | 6.0% |

The ratio compresses for two reasons, neither a regression. A bound puts both arms under one ceiling,
so deliveries that differed by the contract they repeated now differ by much less. And the benchmark
counts activity payloads only: what a collapse frees inside a bounded response is spent on step
techniques that would otherwise be fetched lazily, so characters leave the figure it reads and
reappear as round trips it never counted.

## How to reproduce

The sweep is a throwaway script driving the real server over the in-memory transport: for each
workflow, one session, then `next_activity` and `get_activity` per activity under a fresh `agent_id`
declaring 200,000 tokens, then the same call again under `bundle: "reference"`, recording each
response length against `_meta.delivery_cost`. The batch figures come from `npm run bench:batch`, and
the fixture cost gate from the `bench:token` invocation `verify.yml` runs, which reports −0.7%
against its baseline.
