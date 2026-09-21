# Delivery fidelity walk — what a definition declares and a run never applies

Evidence behind the three findings, gathered by walking a purpose-built specimen
on a live sidecar with real agents in separate contexts.

## Setup

| Piece | Value |
|---|---|
| Specimen | `corpus/specimens/delivery-fidelity`, corpus pin `b91bed12` |
| Minimum viable walk | `corpus/specimens/mvw`, same pin |
| Branch engine | `fix/847-operation-arrives-whole` @ `21ba000e`, image `workflow-server:exp-847-whole`, `:32772` |
| Main engine | `main` @ `6ff1eb67`, image `workflow-server:exp-847-main`, `:32781` |
| Projects root | `$XDG_DATA_HOME/workflow-server/exp-projects` |
| Agents | separate headless processes, one per role, settings and MCP scoped to the sidecar alone |
| Model | Sonnet, budget ceiling 12 USD orchestrator / 3 USD worker |

The specimen places obligations that each leave a mark a reader checks without
reading the agent's reasoning: a marker carried only in one rule's text, a
bullet count a section must hold, a heading order that contradicts the order the
protocol lists the sections in, an inventory item no artifact may name, and an
exit the data decides. The work is a fixed inventory the workflow supplies, so
two runs differ only in what arrived.

## Finding 1 — a dual-audience rule reaches neither role

The specimen declares one rule under each audience the schema offers. Every
delivery of a full walk was searched for each rule's own text.

| audience | reaches `get_workflow` | reaches `get_activity` |
|---|---|---|
| `workflow` | yes | — |
| `activity` | — | yes |
| `both` | no | no |

The schema describes `both` as "dual-audience rules both roles must follow;
surfaced in get_workflow AND injected into every get_activity". Measured on both
engines across `start_session`, `get_workflow`, two `next_activity` calls and two
`get_activity` calls: the rule's text appears in none of them.

Downstream, every artifact of both complete walks missed the obligation that
rule carries — eight artifacts, eight misses, no run ever meeting it. One worker
wrote the session index into its own heading, so it held the value and never had
the rule that governs its form.

## Finding 2 — a worker's delivery never binds the planning folder path

`get_activity` carries `planning_folder_path` seven times in the technique
bodies it delivers, every one of them as an unresolved reference. Searching the
same deliveries for any concrete planning path:

| call | carries a planning path |
|---|---|
| `start_session` | yes |
| `get_workflow` | yes |
| `next_activity` | no |
| `get_activity` (both activities, both engines) | no |

The dispatch operation declares `planning_folder_path` among the inputs the
dispatcher supplies, so the path is meant to travel in the worker's prompt.
Across five dispatches on two engines, no prompt carried it. Workers recover it
by listing the filesystem, or stop: on the branch engine's first walk a worker
fetched its 40,889-character delivery, found the reference unresolvable, and
reported a binding gap rather than guessing. The activity never ran.

## Finding 3 — a fan destination entered by bare activity id opens one branch

The graph sends `classify-items.escalated` to `record-item` over
`escalated_items`. Three items rate escalate, so the destination is a fan of
three.

Entered correctly, with the destination object, the server answers with the
branches it opened:

```
next_activity { from_activity: "classify-items", exit: "escalated",
                activity_id: { activity: "record-item", over: "escalated_items",
                               variable: "inventory_item" } }
-> { activity_id: ["record-item"],
     outstanding: ["record-item#0", "record-item#1", "record-item#2"] }
```

Entered with the activity's bare name, the server accepts it and answers as for
any single activity:

```
next_activity { from_activity: "classify-items", exit: "escalated",
                activity_id: "record-item" }
-> { activity_id: "record-item", name: "Record Item" }
```

One un-indexed branch opens where the graph declares three. The run then exits
that branch to `audit-ledger` and reaches `__terminal__`, and the walk completes
with two of the three items never recorded.

The server holds the fan knowledge at the moment it accepts the bare form. Two
calls later, refusing a different malformed attempt, it names the fan precisely:

```
Cannot exit 'record-item' to 'record-item': the fan at
'classify-items.escalated' converges on 'audit-ledger', which is what the run
enters when its last branch returns.
```

That refusal is correct. The entry that preceded it is the one that passed.

## Scored walks

Both engines, same specimen, same corpus pin, same checkout, same ceilings.

| | branch | main |
|---|---|---|
| obligations met | 31 of 37 | 34 of 40 |
| artifacts written | 4 | 7 |
| fan width | 1 | 3 |
| `get_technique` fetches | 0 | 27 |
| orchestrator contract re-read | 21,214 chars | 59,338 chars |
| orchestrator calls | 33 | 29 |
| agents | 7 | 10 |
| input tokens | 4,263,312 | 8,453,359 |
| cost | 3.66 USD | 6.37 USD |

Of the branch's six misses, four are finding 1 and one is finding 3. Of main's
six, four are finding 1, one is the fan artifacts carrying an activity-number
filename rather than the one the technique names, and one is the scorer holding
a branch return to a coarser form than the run recorded.

## What each delivery costs

Measured without agents, placing the walk call by call.

| call | main | branch |
|---|---|---|
| `get_workflow` | 58,612 | 141,217 |
| `get_activity` (open-ledger) | 35,535 | 40,522 |
| `get_activity` (classify-items) | 40,190 | 49,843 |
| walk total | 135,544 | 232,793 |
| operation bodies carried | 21 | 35 |

The minimum viable walk — one orchestrator, one activity, one routine, one
technique — costs 59,257 characters on main and 109,264 on the branch. That is
the floor both configurations pay before any workflow content exists.

Neither contract arrives in one tool result. The client writes an oversized
result to a file and hands the agent a stub: 2,299 characters on main, 1,392 on
the branch. Main recovers with one read; the branch needed four on its first
walk, totalling 145,371 characters against the 141,217 delivered.
