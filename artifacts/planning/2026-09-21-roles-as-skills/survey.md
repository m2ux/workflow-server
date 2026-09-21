# Agent roles delivered as workflow content — survey

Evidence for the issue of the same name. Taken at server `ccd90e64` (main, after #867) and the
corpus at `.worktrees/workflows`, with `WORKFLOWS_DIR` unset so the suite resolves that checkout.

## The cut being tested

Two kinds of content reach a running agent through the same channel.

A **definition** describes the work: which activities a workflow has, what each step does, which
artifact it writes, which resource it consults. It differs per workflow, and a workflow author
writes it.

A **role contract** describes how to be an orchestrator or a worker: how a session opens, how a
worker is dispatched and awaited, how a gate is yielded and resolved, what an envelope owes, where
a commit runs. It is byte-identical on every run of every workflow. Nothing a workflow author
writes changes it. What does change it is a server release or a change of host.

Both are techniques, because the technique is the only construct `get_workflow` and `get_activity`
can resolve into a response.

## What the opening call carries

`tests/bootstrap-budget.test.ts` against the live corpus:

```
[bootstrap-budget] 168976 of 172000 chars — {"discover":3314,"startSession":376,"getWorkflow":165286}
```

The server's own log line for that same `get_workflow`:

```
Workflow delivery cost  delivery=full  resolved_techniques=23
                        bundle_chars=163684  definition_chars=1595
                        max_response_chars=60000  response_chars=165358
```

And, on the same call:

```
Workflow response over what one tool result may carry
  bound=60000  contract_chars=163684  definition_chars=1595  protocol_metadata_chars=72
```

So the opening read is 163,684 characters of role contract wrapped around 1,595 characters of
workflow — 99.0% contract — and it goes out at 2.75× the stated bound on what one tool result may
carry, with the overage logged rather than acted on.

`definition_chars` is not small because meta is a stub. It is small because meta's definition *is*
two activities and a graph; everything else meta holds is the role.

## Marginal cost inside that bundle

`measure-bundle.ts` beside this file resolves the same 23 refs the tool resolves and drops one at a
time. Its total reproduces the logged `bundle_chars` exactly, so each figure below is a share of the
number the budget test measures.

```
orchestrator bundle 163684 chars over 23 operations
     9949  workflow-engine::start-session
     7037  workflow-engine::handle-sub-workflow
    17713  workflow-engine::dispatch-activity
     8852  workflow-engine::resume-worker
    10198  workflow-engine::continue-batch
     7908  workflow-engine::workflow-orchestrator
     9566  workflow-engine::compose-prompt
     5405  harness-compat::spawn-agent
     5463  harness-compat::continue-agent
     4856  harness-compat::resolve-harness-operation
     4304  harness-compat::claude-code
     7997  workflow-engine::evaluate-transition
    11617  workflow-engine::commit-and-persist
     9061  workflow-engine::sync-progress-status
     3834  git::commit-regular-files
     4768  git::commit-submodule
     3219  agent-conduct
     2180  orchestrator-conduct
     3519  harness-compat::cursor
     3799  harness-compat::cline
     3958  harness-compat::generic
    10838  workflow-engine::present-checkpoint-to-user
     7631  workflow-engine::respond-checkpoint

harness-compat, whole group: 31304 chars over 7 operations
harness-compat, hosts other than claude-code: 11276 chars over 3 operations
conduct: 5399 chars over 2 operations
checkpoint pair: 18469 chars over 2 operations
worker baseline 47650 chars over 7 operations
  without conduct 43519 chars
```

Every one of the 23 is role contract. Not one describes the work meta does.

The worker figure is paid per worker identity rather than once a session, so a run that dispatches
under several identities pays 47,650 characters again for each.

## The bootstrap circularity

The role contract is what an agent needs before it can act. The channel that delivers it needs a
session. Opening a session is itself part of the role contract.

The server breaks that circle by hand: `discover` reads one corpus resource raw and returns it
verbatim, before any session exists. `guards/check-bootstrap-self-contained.ts` exists because of
what that costs — with no `session_index` there is no `get_resource` and no `get_activity`, so the
agent reading that text cannot open any corpus file, and the guard refuses three constructs on that
one surface that the house style sanctions everywhere else: a markdown link into the corpus, a
dotted rule address, and a bare backticked rule name. The guard's own comment states the cause:
"everywhere else in the corpus, citing the home rather than restating it is the right economy; on
this one surface it strands the reader."

A file on disk has no such surface. A host that loads a skill hands the agent a file it can read,
and every link in it is one the agent can follow.

## The harness adapters

`harness-compat` is 31,304 characters over seven operations, of which 11,276 describe a host the run
is not on.

The cause is structural rather than an oversight. `harness-compat/TECHNIQUE.md` declares
`{harness_kind}` as an input, and its own rule `harness-kind-from-host-surface` states that the
variable "has no session-state producer — no workflow variable holds it and no step sets it. The
executing agent determines it from its own host surface, the only place the fact is observable." The
server therefore cannot bind it, cannot select an adapter, and ships all four so that the agent can
select its own through `resolve-harness-operation` — a technique whose entire content is a
four-entry lookup table plus the instruction not to duplicate it.

Round the same fact, three further constructs exist:

- the `harness-independence` rule, forbidding any technique or activity from naming host syntax;
- `CORE_ORCHESTRATOR_TECHNIQUES` carrying all four adapter files plus `spawn-concurrent`, whose
  comment explains that a technique named inside another technique's Protocol has no other delivery
  path;
- `guards/check-harness-adapter-set.ts`, whose header says the set "is enumerated twice, in places
  that must agree", and that "a fifth adapter has to be added in both".

A skill is installed on the host. The host is known when the file is authored. The variable with no
producer, the lookup table, the independence rule, the three unusable adapters and the guard that
polices the set all cease to have a subject.

## Progressive disclosure, built by hand

The server carries several mechanisms whose common job is to stop sending a reader content it
already holds or can never reach:

- the delivery ledger, keyed on agent identity, collapsing a repeat delivery to a content-hashed
  `workflow_bundle:<hash>` unchanged-marker under persistent context mode;
- `FAN_DISPATCH_TECHNIQUES`, added only where the workflow's graph actually fans;
- `FAN_ONLY_RULES`, withheld from an activity whose exits fan onto nothing;
- `WORKER_CHECKPOINT_TECHNIQUES` and `ORCHESTRATOR_CHECKPOINT_TECHNIQUES`, added only where the run
  declares a gate;
- `contractOperations`, bounding what a by-id fetch may reach;
- `progressive-step-technique-load`, the rule telling a worker to fetch a step's technique on reach.

A skill's disclosure is the same idea, provided by the host: the description sits in context, the
body loads when the skill is triggered, and a linked file is read when the agent reaches the link.

#868's original blocker is a symptom of the same gap. A rule cannot be requested by reference — a
three-segment reference resolves as not-found, a two-segment one expands to every rule its technique
holds, and rule references filter output that has already resolved. Selective delivery of one fact to
one reader exists only as resource section citation. A file on disk is read at whatever grain the
reader asks for, with no construct needed.

## What is in `meta`, and what it is

55 technique files, against 515 in the corpus as a whole:

| Workflow | Techniques |
|---|---|
| work-package | 96 |
| support (six libraries) | 96 |
| **meta** | **55** |
| cicd-pipeline-security-audit | 41 |
| workflow-design | 35 |
| … 14 more | 192 |

Which of meta's operations a client workflow actually binds, by grep over every `*.yaml` in the
corpus:

| Operation | Workflows binding it | Reading |
|---|---|---|
| `variable-binding` | 18 (every workflow, plus specimens) | engine — #869 argues this exact point |
| `verify-artifact-conforms` | 15, none of them meta | shared library |
| `scatter-gather` | 10 | shared library |
| `orchestration-patterns::*` | 5 | shared library |
| everything else in meta | meta and the conformance specimens only | role |

So `meta` is two things under one name: the role contract, and a small library of operations that
client workflows reach. The corpus already has a construct for the second — `support/`, where a
**library** is "a namespace of shared operations that declares no workflow of its own", reached by
its directory name and declaring no `workflow.yaml`.

## Distribution is already wired

`scripts/deploy-cursor-workspace.sh` installs, per `docs/ide-setup.md`:

| Path | Role |
|---|---|
| `.cursor/rules/`, `.claude/rules/` | The bootstrap rule and its companions |
| `.claude/skills/` | The skills the template ships, one directory each; skills added locally stay |

One skill ships today — `workflow-canon`. The repository also carries `.cursor/skills/server-in-the-loop/`.
So both host skill formats already have an install path, and `--force` refreshes them.

## Version skew — the one thing delivery buys that a file does not

Today the contract an agent reads is resolved by the server that will serve its calls, so the two
cannot disagree. A skill installed on disk can lag a server release.

This wants a handshake rather than a hope: `discover` already returns `server` and `version` above
the bootstrap text, and can state the role-skill version it requires; the skill states what it
implements; a mismatch stops the run at bootstrap with the refresh command. The deploy script's
`--force` path is that command.

## Method

- Budget figures: `npx vitest run tests/bootstrap-budget.test.ts` against the live corpus, plus the
  `Workflow delivery cost` and `Workflow response over what one tool result may carry` log lines
  emitted by the same run.
- Marginal figures: `measure-bundle.ts` beside this file, run from the server checkout root with the
  corpus root as its single argument. It resolves the meta orchestrator ref set — meta's own
  `techniques.workflow`, `CORE_ORCHESTRATOR_TECHNIQUES`, and the orchestrator checkpoint pair, which
  rides because `end-workflow` holds a checkpoint step — and reports what the bundle loses when each
  ref alone is dropped. Marginals do not sum to the total: refs share group contracts, so a
  character removed with one may be retained by another.
- Census and usage split: `find`/`grep` over `corpus/`, excluding `README.md` and `TECHNIQUE.md`
  from the technique count.
