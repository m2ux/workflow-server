# Fleet census: which identities walked more than one activity

> Measurement · 2026-09-11 · companion to the [verified outcome](README.md)

A batch, for this census, is an identity that appears on `activity_dispatched` events for two or
more distinct activity ids. That is the run the server bound would see. It is silent about whether
the orchestrator meant to continue, and it does not count a resume of the same activity after a
gate — that identity already holds the activity, which is a different mechanism.

Taken from every `session.json` under `.engineering/artifacts/` on this machine, including children
nested at `triggeredWorkflows[].state`. **78 files, 151 session records. 0 `batch_refused` events.**
221 identities took one activity; 21 took two or more.

## How to re-take it

From a checkout whose `.engineering/artifacts` holds the sealed runs:

```
python3 measure/census.py --root /path/to/.engineering/artifacts
```

The script walks every `session.json`, recurses into embedded children, and prints the same
headings this file records. A figure that moves is a fleet change, not a script change, unless
the event shape itself has moved.

**This recording:** 11 September 2026, against the live `.engineering/artifacts` tree (engineering
`535bdff`, plus whatever uncommitted session files that tree held). Server `origin/main` at
`bf6f66bd`. Corpus submodule at `8eff1755`.

## Totals

| Figure | Count |
|---|---|
| Session files | 78 |
| Session records (parents plus nested children) | 151 |
| Records that carry at least one `activity_dispatched` | 48 |
| Records that carry a `batch_refused` event | **0** |
| Identities that took 1 distinct activity | 221 |
| Identities that took 2 | 6 |
| Identities that took 3 | 14 |
| Identities that took 4 | 1 |
| Identities that took 2 or more | 21 |
| Of those: meta setup sequence | 7 |
| Of those: client workflows | 14 |
| Of those: neither | 0 |
| Client session records | 85 |
| Client sessions with 2 or more activities | 25 |
| Of those: no identity took a second activity | 16 |

A well-behaved continue path stops when `may_continue` is false and never asks past the bound, so
zero refusals is the expected tally if either batches stay inside the cap or continuations are
never attempted. The split below is what distinguishes those two.

## Setup batches — seven, and they are the run #407 named as first user

Six of the seven walk `discover-session` → `initialize-session` → `resolve-target` under one
identity, which is a cap-sized batch of the three light activities that open every meta session.
The seventh walks those three plus `dispatch-client-workflow` under the session's own
`orchestrator` identity — the unbounded exemption, four activities, not a bound batch.

| Planning folder | Identity | Activities |
|---|---|---|
| 2026-08-24-shorthand-expression-grammar-for-workflow-yaml | `meta-worker-01` | discover-session, initialize-session, resolve-target |
| 2026-08-30-runner-execution-protocol | `w-discover-01` | discover-session, initialize-session, resolve-target |
| 2026-08-30-rule-and-checkpoint-fragments-a-shared-body | `worker-QZAMAD-01` | discover-session, initialize-session, resolve-target |
| 2026-09-09-parallel-activities | `w-EYDQ4T-discover-session` | discover-session, initialize-session, resolve-target |
| 2026-08-22-review-the-workflow-server-docs-folder-content | `worker-discover-01` | discover-session, initialize-session, resolve-target |
| 2026-09-07-requirements-spec-for-the-routines-protocol | `worker-discover-session-a1` | discover-session, initialize-session, resolve-target |
| 2026-07-31-section-stratification-359 | `orchestrator` | discover-session, initialize-session, resolve-target, dispatch-client-workflow |

The 5 August run that formed no batch at all
([startup-cost-on-real-runs](../2026-08-06-startup-cost-on-real-runs/README.md)) was a deploy-timing
miss: `_meta.batch` never arrived in any `get_activity` response, and the container serving the
server restarted mid-run. Later runs bank the setup save. That earlier finding is not the fleet's
steady state.

## Client batches — fourteen identities across five workflows

| Planning folder (child) | Workflow | Identity | Activities |
|---|---|---|---|
| 2026-08-24-shorthand… / prism-evaluate | prism-evaluate | `client-worker-01` | scope-definition, dimension-planning, execute-analysis |
| 2026-08-17-meta-and-work-package… / prism-evaluate / prism | prism | `prism-g1-orchestrator` | select-mode, structural-pass |
| 2026-08-30-runner-execution-protocol / requirements-refinement | requirements-refinement | `c-intake-01` | intake-and-analyze, update-specification, validate-specification |
| 2026-08-30-runner-execution-protocol / requirements-refinement | requirements-refinement | `c-correct-02` | update-specification, validate-specification, finalize-specification |
| 2026-08-15-handling-inline-techniques / work-package | work-package | `worker-implementation-analysis-1` | implementation-analysis, plan-prepare, assumptions-review |
| 2026-08-01-when-expressions… / work-package | work-package | `orchestrator` | submit-for-review, complete |
| 2026-08-30-rule-and-checkpoint-fragments… / workflow-authoring | workflow-authoring | `worker-3IXIS7-01` | intake-and-context, scope-and-draft, quality-review |
| 2026-08-30-rule-and-checkpoint-fragments… / workflow-authoring | workflow-authoring | `worker-3IXIS7-02` | validate-and-commit, quality-review |
| 2026-09-09-parallel-activities / work-package | work-package | `w-F36WFG-design-1` | design-philosophy, codebase-comprehension |
| 2026-08-22-review-the-workflow-server-docs… / plain-language | plain-language | `pl-worker-01` | intake-and-profile, source-analysis, draft |
| 2026-08-22-review-the-workflow-server-docs… / plain-language | plain-language | `worker-evaluate-01` | evaluate, deliver |
| 2026-09-07-requirements-spec… / requirements-refinement | requirements-refinement | `worker-intake-and-analyze-a1` | intake-and-analyze, update-specification, validate-specification |
| 2026-09-07-requirements-spec… / requirements-refinement | requirements-refinement | `worker-update-specification-b1` | update-specification, validate-specification |
| 2026-09-07-requirements-spec… / requirements-refinement | requirements-refinement | `worker-validate-specification-c1` | validate-specification, update-specification, finalize-specification |

The designed analysis trio (`implementation-analysis`, `plan-prepare`, `assumptions-review`)
appears once. One work-package pair ran under the session's own `orchestrator` identity — the same
unbounded exemption the setup seventh used. Three of the fourteen are that exemption or an
orchestrator-named identity on a child (`prism-g1-orchestrator`).

## Client sessions that walked two or more activities without batching — sixteen of twenty-five

An identity per activity. One of these is a fan (`fan-conformance`: three `probe-directory#N`
instances plus the surveys), which is required not to continue: a fan mints one identity per
branch. Several of the work-package and workflow-authoring rows predate the 5 August merge of
batched dispatch, including the fifteen-activity work-package walk of 30 July, so they are not
evidence against the landed continue path. The post-merge remainder is mixed: prism-evaluate,
ponytail, nested prism children, and the 10 September fan-conformance run.

| Planning folder (child) | Workflow | Activities | Identities |
|---|---|---|---|
| 2026-08-24-shorthand… / prism-evaluate / prism [0] | prism | 6 | 6 |
| 2026-08-24-shorthand… / prism-evaluate / prism [1] | prism | 4 | 4 |
| 2026-08-01-workflow-authoring-pr-372 / workflow-authoring | workflow-authoring | 4 | 5 |
| 2026-08-17-meta-and-work-package… / prism-evaluate | prism-evaluate | 5 | 7 |
| 2026-08-21-eliminate-redundant… / ponytail | ponytail | 4 | 4 |
| 2026-07-31-section-stratification-359 / workflow-authoring | workflow-authoring | 4 | 4 |
| 2026-08-01-workflow-authoring-pr-373 / workflow-authoring | workflow-authoring | 2 | 3 |
| 2026-08-01-migrate-legacy-structured-step-conditions… / workflow-authoring | workflow-authoring | 4 | 6 |
| 2026-08-01-formalise-reusable-parallel-fan-out / workflow-authoring | workflow-authoring | 3 | 3 |
| 2026-09-10-fan-conformance-live-run | fan-conformance | 6 | 6 |
| 2026-07-31-section-resource-grain-358-359 / workflow-authoring | workflow-authoring | 4 | 7 |
| 2026-08-01-workflow-authoring-pr-375 / workflow-authoring | workflow-authoring | 3 | 4 |
| 2026-08-02-condition-not-met-when-gated-checkpoints / work-package | work-package | 4 | 5 |
| 2026-07-30-issue-365-context-fidelity-observability / work-package | work-package | 15 | 17 |
| 2026-08-18-optimisation-of-meta-and-work-package… / prism-evaluate | prism-evaluate | 7 | 9 |
| 2026-08-01-condition-not-met-when-gated-checkpoints / work-package | work-package | 2 | 3 |

## What this does not measure

It does not measure wall-clock spawn cost, delivered characters, or whether `may_continue` was
true on the envelope. It does not distinguish a continue-batch from a worker that happened to be
handed a second activity under a reused identity. The 21 identities with two or more activities
are an upper bound on formed batches; the seven setup trios that share the same three activity
ids in order are the cleanest lower bound on intended ones.
