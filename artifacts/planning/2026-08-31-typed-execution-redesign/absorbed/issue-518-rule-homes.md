## Summary

A rule in a workflow definition is delivered to an agent, and which agent depends on where the rule sits. A workflow-level rule reaches the orchestrator; an activity-level rule is injected into every activity a worker is dispatched for; a technique's rule travels with that technique. When a rule sits in the wrong place it is handed to an agent that cannot act on it, delivered fifteen times where once would do, or homed in a domain workflow that another workflow then reaches across to borrow.

The corpus has all three shapes today. This epic puts each rule where its audience is, and mechanises the two classes that keep recurring.

## What happens today

**Six orchestrator rules are delivered to workers.** `agent-conduct` holds fifteen rules, and six of them constrain orchestrators only: what an orchestrator may not execute, how deep the agent tree goes, dispatching on resume, the directory a commit runs in, advancing between activities, and soliciting input outside a yield. The worker entry technique tells a dispatched worker to follow the rules in `agent-conduct` wholesale, so every worker receives all six. A worker cannot dispatch, cannot advance an activity, and cannot resolve a gate — the rules reach an agent with no way to honour or breach them.

The mechanism for splitting them already exists and is already used: the meta workflow addresses the group rather than the file, so the orchestrator gets exactly that family. The worker entry does not, so the split holds on one side only.

**A generic conduct fragment is homed in a domain workflow.** Three rules — clarify before acting, summarise before continuing, one task at a time — are named rules of the work-package workflow. They say nothing about work packages. `remediate-vuln` needs the same three and reaches across for them by cross-workflow reference, which is the tell: a rule two unrelated workflows both need is not either one's to own.

**Three more workflow rules restate contracts that already have homes.** An explicit-approval rule carries a parenthetical about where approval may happen, which is the engine's business and is already stated by two `agent-conduct` rules. A decision-points rule says a user chooses at a decision point, which is what a checkpoint is. A git-configuration rule states a boundary on changing the user's environment that `file-sensitivity` already draws.

**Four rules about one activity were injected into fifteen.** The work-package workflow carried activity-level rules naming the safety floor, the simplification cycle, the net-lines scoreboard and the boundary with strategic review. Every construct they name appears in exactly one activity file and nothing else in the corpus references any of them, yet the rules reached the worker for all fifteen activities.

**Three recurring classes have no catalog entry, and one of them has no home to be fixed into.** A technique rule or resource may restate what a schema field means, which fields express a construct, or which combinations are valid — the catalog explicitly permits restating "meaning, shape, allowed values", so nothing flags a rule duplicating a description the schema already carries. And an engine technique may narrate where the server keeps its state, because the entry that would forbid mechanism narration carves out engine surfaces — the carve-out that makes an engine technique a legitimate tool-namer also lets it describe internals no reader can act on.

And a declaration cannot state which values a variable admits. A variable declares a name, a type drawn from five primitives, a description, a default and an authoring flag — nothing narrows the value set. Meanwhile the catalog instructs a description to state `meaning, shape, allowed values`. So a value set can be written only as prose, and that prose is necessarily a copy of whichever gate options or step outputs happen to set the value, with no declaration to check it against. Ten declarations across four workflows carried such a list, each naming the option ids of one producer. An entry forbidding the copy would forbid the only form available, so the constraint has to exist before the prohibition can.

## The fix

**W5.1 — orchestrator rules reach orchestrators.** Move the six orchestrator-only rules to an orchestrator-adjacent home, and have every entry point address the family it needs rather than the file. A worker's bundle stops carrying rules about dispatch.

**W5.2 — generic conduct lives in the conduct home.** Move the three interaction rules out of the domain workflow that hosts them, and repoint the cross-workflow reference. Delete the three workflow rules that restate contracts `agent-conduct` and the checkpoint contract already own.

**W5.3 — an activity's rules sit on the activity.** Keep the four lean-audit rules on the activity whose constructs they name.

**W5.4 — give a value set a home, then mechanise the three classes.** Let a variable declaration constrain the values it admits, so an enumerated set has one home a checker can read. Then add the catalog entries: schema semantics restated outside the schema, engine internals narrated to an agent that cannot act on them, and a value set enumerated in prose where nothing declares it. Each states Detect, the carve-outs and the Fix, narrows the existing carve-out it sits behind, and follows the catalog's own Creation Rules.

## Why now is cheap

The audience rules are already written down — the schema says which bucket reaches which agent, and the catalog already names the misplacement families for the cases it covers. What is missing is the placement, not the criteria. The group-addressing mechanism the split needs exists and is in use on one side. And every rule this epic moves was found by reading one workflow's definition against those criteria, so the sweep across the rest is the same reading applied wider.

## Scope

Four work items, each delivered as its own pull request. The corpus changes land as minor version bumps on the workflows they touch. The fourth item reaches the schema and the loader as well as the catalog, because a prohibition on prose value sets needs a declared alternative first.

Two decisions are taken as part of the work:

1. Where the orchestrator family lives — its own technique, a group within the conduct technique addressed by every consumer, or the orchestrator entry technique's own rules. The last keeps it beside the agent it binds but makes an entry technique carry a rule set, which the catalog treats warily.
2. Whether the git-configuration boundary is generic conduct or a version-control concern.
3. Whether a variable constrains its values by an enum on the declaration, or by a named type the corpus can reuse across the variables that share a set.

## Acceptance criteria

- [ ] No rule delivered to workers constrains behaviour only an orchestrator can perform.
- [ ] Every entry point addresses the rule family its agent needs, rather than a whole technique.
- [ ] No generic conduct rule is homed in a domain workflow, and no workflow reaches across for one.
- [ ] No workflow rule restates a contract `agent-conduct`, the checkpoint contract, or the schema already owns.
- [ ] A rule whose constructs live in one activity sits on that activity.
- [ ] A variable declaration can constrain the values it admits, and a description states the set nowhere else.
- [ ] The catalog carries an entry for schema semantics restated outside the schema, one for engine internals narrated to an agent that cannot act on them, and one for a value set enumerated where nothing declares it.
- [ ] The guard suite is green, and a sweep of the remaining workflows records any instance it leaves in place with the reason.

## Non-goals

- No change to what any rule *says*, beyond deleting a restatement whose home already states it.
- No change to the rule schema or to how the server delivers rules; this is placement within the constructs that exist.
- The checkpoint presentation contract is settled in #400 and is not reopened here.

## Investigation detail

Raised from the decision-integrity epic, #400, whose reviews surfaced each instance. Per-defect verification and the measured counts: [.engineering/artifacts/planning/2026-08-26-decision-integrity-restatement](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-26-decision-integrity-restatement)


