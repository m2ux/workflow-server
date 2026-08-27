# Rule homes and shared bodies — decision record

Decisions taken while delivering [#518](https://github.com/m2ux/workflow-server/issues/518) and
[#519](https://github.com/m2ux/workflow-server/issues/519). Both issues asked for a decision to be
recorded with its reason; this folder is that record. The work landed on `feat/rule-homes-and-activity-calls`
(server) and `workflow/rule-homes-and-activity-calls` (corpus).

The activity-step construct [#519](https://github.com/m2ux/workflow-server/issues/519) hands to
[#520](https://github.com/m2ux/workflow-server/issues/520) has its own record:
[2026-08-27-activity-step-kind](../2026-08-27-activity-step-kind/).

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

## Scope this work did not reach

#520 is unimplemented: no schema change, no loader resolution, no corpus migration. Its design —
the delivery model the issue says must be settled before its schema lands, the form the resolved
body takes in the payload, the disposition of each of its seven stages, and the guard rework that
is the real cost — is recorded in [2026-08-27-activity-step-kind](../2026-08-27-activity-step-kind/).
