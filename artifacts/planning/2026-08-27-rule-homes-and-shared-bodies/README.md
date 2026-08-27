# Rule homes and shared bodies — decision record

Decisions taken while delivering [#518](https://github.com/m2ux/workflow-server/issues/518),
[#519](https://github.com/m2ux/workflow-server/issues/519) and the design half of
[#520](https://github.com/m2ux/workflow-server/issues/520). Each issue asked for a decision to be
recorded with its reason; this folder is that record. The work landed on `feat/rule-homes-and-activity-calls`
(server) and `workflow/rule-homes-and-activity-calls` (corpus).

## What made the misdelivery mechanical

The reason six orchestrator rules reached every worker is not the prose link the issue names — it is
the composition. Naming one rule of a technique by its exact id *touches* that technique, and the
auto-include pass then appends every rule the technique declares. `agent-conduct::checkpoint-discipline`
is an exact rule id, and it sits in both role baselines, so both roles received all fifteen rules of
`agent-conduct` however narrowly they addressed it.

That fixes the shape of the remedy: a conduct technique holds **one audience**, or its rules reach a
role that cannot act on them. Group-prefix addressing (`agent-conduct::orchestrator`) looked like the
split and never was one.

## #518 decision 1 — where the orchestrator family lives

**Its own technique**, and symmetrically a worker one. `meta/techniques/orchestrator-conduct.md` holds
the six boundaries only an orchestrator can honour; `meta/techniques/worker-conduct.md` holds the two
writing rules only a dispatched worker takes; `agent-conduct` is the universal home. Each role's
baseline names the universal home and its own.

Rejected: a group *within* `agent-conduct` addressed by every consumer — the option the issue lists
second. The auto-include pass defeats it, as above. Rejected: the orchestrator entry technique's own
rules — it makes an entry technique carry a rule set the catalog treats warily, and it would not have
given the worker rules anywhere to go.

Cost: the orchestrator's bootstrap block grows about 1,200 characters, and the budget test moved from
113,000 to 115,000 with that reason recorded in it. The growth is five conduct rules that were homed
in two domain workflows and so never reached the agent that talks to the user. The orchestrator's own
six cost nothing — it received them before and receives them now.

## #518 decision 2 — the git-configuration boundary

**A version-control concern.** `git-configuration-is-user-owned` sits in
`meta/techniques/version-control/TECHNIQUE.md`, beside the validate actions whose messages it
constrains. `file-sensitivity` in `agent-conduct` already draws the boundary on changing the user's
configuration; what the work-package rule added was the instruction that a validate message names a
misconfiguration without prescribing the fix, and that is about those operations.

## #518 decision 3 — how a variable constrains its values

**An enum on the declaration** — `values: [...]` on a string variable — not a named type the corpus
reuses. Nothing in the corpus shares a value set across two differently-named variables, so a type
registry would be indirection with no reuse behind it. The pairs that *do* share a set share a name,
and the merge already refuses two declarations of one name that disagree; the `analysis_type` pair
proved that on the way in.

The default must name a member or the workflow does not load. A variable whose "unset" state is an
empty-string default therefore cannot declare its set today — `review_type` in `submit-for-review` is
the one instance. The honest fix is to drop that default so absence means unset, which is a behaviour
change outside #518; the `value-set-in-prose` catalog entry will catch it in a later pass.

## #519 verdict — `fragments` does not survive as a rule mechanism

**The rule half is retired; the checkpoint half survives until #520 lands.**

Seven of the eight rule fragments were generic rules squatting in a domain workflow, and two had a
single reference site. None survived contact with the question "whose rule is this?":

| Fragment | Disposition |
|---|---|
| `interaction-discipline` (work-package) | three `interaction-*` rules in `agent-conduct` |
| `agents-md-prerequisite` (work-packages) | `operational-discipline-repository-instructions` |
| `planning-artifacts-gitignored` (substrate audit) | `operational-discipline-artifact-citation`, stated as the invariant rather than the repository fact |
| `worker-permissions` (prism) | `worker-writes-without-asking` in `worker-conduct` |
| `artifact-verification` (prism) | `worker-reports-what-it-wrote` in `worker-conduct` |
| `orchestration-model` (prism-audit) | deleted — the engine states the orchestrator/worker model |
| `inline-orchestration-model` (remediate-vuln) | already gone upstream; its depth clause is `orchestrator-one-level-of-indirection` |
| `pass-output-forwarding` (prism) | inlined; one reference site is indirection with no reuse |

So `fragments.rules` is removed from the schema rather than left unused, and a reference in a rules
bucket now fails the load. The `duplicate-rule` guard's remedy names the conduct home instead of
offering extraction — following that advice is what produced the squatters, and it very nearly
produced an eighth during this work.

`fragments.checkpoints` stays. Both checkpoint fragments are work-package's own and serve four and
three sites; the objection to them is the layering, not the home, and the construct that fixes the
layering is #520.

### What #519 still owes

- *No fragment body names state belonging to a single activity while sitting at workflow scope.*
  Unmet. `assumption-interview` and `assumption-decision` name `is_review_mode`,
  `has_open_assumptions`, `assumption_review_presentation`, `has_deferred_assumptions`,
  `needs_individual_interview` and `current_assumption` — all declared in `variables.writes` of the
  activities, confirming the issue's reading. They retire with #520 stage 7.

## #520 stage 5 — the delivery model, settled

**A called activity inlines into the caller's dispatch**, resolved at load into a compound step. The
loop step is the precedent: it already nests an ordered step list inside one activity with no second
dispatch. A call that cost a dispatch would pay the re-dispatch overhead that was about 31% of a
4.1M-token run, for a sequence whose whole point is to be reached mid-flow.

The design that follows from it, for whoever implements the schema:

- `kind: activity` carries `id`, `activity` (the callee's id) and the site gates every step kind
  carries. The loader resolves the callee's steps into the step's own `steps`, the way a loop body is
  already a nested list, so `flattenActivitySteps`, checkpoint synthesis, the step manifest and the
  guards all reach them through the traversal that exists.
- **A called activity declares no exits and takes no graph entry.** Its outcome is what it writes to
  the bag, which is what the caller already branches on with the gates it has. This is why the
  corpus migration needs no return concept at all: neither shared gate's options carry
  `effect.exit` — they only write variables. Stage 2's "exits become an outcome the caller reads"
  buys nothing the bag does not already carry, and would add a rewrite path with no use site.
- **Stage 3 is discharged by qualification at resolution.** Each spliced step id becomes
  `<call-step-id>.<callee-step-id>`, so two call sites of one callee record their checkpoint
  responses under different keys and neither replays into the other.
- **Delivery ships the resolved body as its own block**, keyed by the call step's id, rather than
  splicing text into the caller's YAML. `get_activity` hands over the raw activity file, and
  indentation surgery on another file's `steps:` is the fragile part of the alternative; a keyed
  block matches how step-bound techniques already arrive.
- **The guard surface is where the cost sits, and it is not small.** `check-activity-variables`
  derives each activity's contract and holds every declared read to a writer on every path *through
  the graph*. A called activity is not in the graph, so its contract has to be discharged at its
  call sites and reachability computed through calls. That rework, not the schema, is what makes
  #520 its own pull request.

## Scope this work did not reach

#520 is unimplemented: no schema change, no loader resolution, no corpus migration. The reason is
the guard rework above — a step kind half-landed in the schema is worse than none, and the issue
itself says stage 5 should be settled before the schema lands. It is settled here.
