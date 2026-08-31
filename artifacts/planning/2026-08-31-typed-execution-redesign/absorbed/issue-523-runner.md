## Summary

A workflow definition is a structure: an ordered list of steps, gates that decide whether each one runs, loops that repeat a body, and named endings that decide where control goes next. Today an agent reads that structure and interprets it, guided by prose the server ships alongside the definitions. The server hands out definitions and grades what the agent reports back.

This proposes moving the structural work to a program. A **runner** is a published package the harness invokes as an ordinary client. It walks the step tree, decides gates, drives iteration, resolves each step's bindings, and calls out to an agent only to execute a technique — whose body is prose and stays prose. The server independently derives every transition and accepts only the ones it reproduces.

The agent's job narrows to what only an agent can do: read a protocol, exercise judgement, write content, and answer a question put to a person.

## What happens today

The structural work is already half mechanical, and the halves are in the wrong places.

The server evaluates gates. When it delivers an activity it runs the shared expression evaluator over the live session variables for every technique step, and uses the verdict to decide which step contents to include eagerly. That verdict decides *delivery*. The same verdict, applied to *execution*, is what an agent is currently asked to reach by reading the definition.

The gate surface is entirely tractable. Across the corpus there are a few hundred gate sites — an independent parse of 122 activity files counts 231 inline step gates, 97 structured step conditions and 54 ending gates, plus 11 on action steps and one early-exit condition — and every one of them parses and evaluates under the shared dialect. There are no parse failures, no authoring-rule failures, and no expression on a gate that names anything outside the session variables. The five expressions that ask the environment a question, such as whether the GitHub CLI is authenticated, are not gates at all: they are validation targets, a field already understood as work for an agent.

A second interpreter already exists, in the test harness. It walks the step tree, evaluates gates, selects decision options, chooses endings, and records what a run covered. It is the reference for what mechanical execution means, and it lives on the far side of the test boundary from the runtime.

What blocks execution is not evaluation but timing. A step's outputs reach the session when the whole activity ends, with one exception: answering a user decision lands values mid-activity without moving the activity pointer. Outside that route the variable bag is frozen for an activity's duration, while well over half of all gate sites read a value an earlier step of the *same* activity produces. The committed end-to-end baseline records the effect — across 79 activity deliveries the server logs 313 gates it cannot yet answer and 168 whose values nothing has bound, and not one delivery answers every gate it carries — but those two figures conflate the freeze with the fact that the test harness never sends its own values back, so both want re-measuring.

Two more gaps sit alongside. Nothing anywhere drives iteration: the test interpreter walks a loop body exactly once, and no code reads the iteration type, the collection, the item variable or the iteration bound. And position is not merely underived — it is underivable, because when the server delivers an activity it marks every bundled step as started at the same instant, so no ordering can be recovered from the record.

Meanwhile roughly 33,000 characters of every dispatch are protocol rules and worker-mechanics instructions that exist for one reason: the agent drives.

## The design

**The runner.** A package published alongside the server and invoked by the harness as an ordinary client — no payload crosses the tool channel, and no platform-specific artifact is built. It holds the step walk, the gate decision, the iteration driver, and the binding resolution, sharing the evaluator and the loaders with the server so the two cannot drift.

**Derivation rather than attestation.** The server recomputes each transition from the definitions and the session it already holds, and accepts a transition only when its own derivation matches. Authority rests on the server reproducing the result, not on the caller proving who it is. A client that produces correct transitions is acceptable whatever it is; a client that produces incorrect ones is refused whatever it claims.

**Write authority at step completion.** A step's declared outputs land in the session bag when that step finishes rather than when its activity ends. This is the load-bearing stage: without it a runner can decide only the gates fed by an earlier activity, and the majority fed by an earlier step of their own remain unanswerable. With it, the server's own counters of unanswered gates collapse.

**Durable position.** A cursor naming the current step, with a frame per enclosing loop carrying the iteration index and the bound item. Iteration then has somewhere to live, and a replacement worker resumes at the step after the last completed one rather than re-entering the whole activity.

**The call-out contract.** The runner sends an agent one technique at a time: the protocol prose, the rules, the resolved input values, and the artifact obligation. The agent returns one of three things: the values it produced per declared output identifier together with the paths of any artifacts it wrote; a decision the definition could not have anticipated, which the session already models and which the runner cannot pre-resolve; or a set of worker briefs it composed itself. That third arm is not optional — a technique taking a list of briefs and a concurrency limit is bound as an ordinary step at 22 sites across 8 activity files, and every one is preceded by a step that composes those prompts at run time out of domain material no runner could derive, so the runner is not the sole author of dispatchable prompts. The server validates the *shape* of a returned value set — that the output identifiers match what the technique declares, that remap targets are the declared destinations, that values match declared types, that declared artifacts exist and their names conform — and trusts the *content* absolutely. Resolved input values travel on their own channel, separate from the technique body, so the body stays a pure function of the corpus and reference delivery keeps deduplicating it by content.

A call-out is atomic. 436 of the corpus's 2,459 protocol bullets open with a conditional or a repetition, so control flow lives inside technique bodies as well as above them: the runner can establish that a technique ran and that it returned a conforming set of outputs, and cannot resume one part-way through.

**Delivery in runs, not single steps.** The unit handed to an agent is the contiguous run of steps from the current position to the next gate the session cannot yet answer. One agent round trip costs about what 18,800 characters of fresh content cost, while the average composed step technique is 5,275 characters, so a unit smaller than roughly four steps loses money. A call-out is a turn inside a living agent context, never a fresh one: there are 611 technique steps across 117 activities, and paying an establishment cost of 23,000 to 42,000 tokens for each would multiply the largest cost in the system by five.

**What retires.** Roughly 179 lines of graders exist because the agent reports and the server marks: the step-manifest check, the reported-ending check, the skipped-step accounting for an ending that truncates a sequence, the activity-manifest check and the technique-fetch check. The worker-mechanics prose retires with them. The early-exit field on a loop is declared and used nowhere: there are 46 loop declarations in the definition text, 58 loops reachable through workflow graphs and 41 distinct activity-and-loop pairs, and no use of the field under any of the three counts. And the rule forbidding an activity from opening with a decision point exists only because a fresh worker context that does nothing but ask a question is the most expensive way to ask one — when the server resolves the decision before any context exists, the rule and its guard go, and the 113 decision points positioned under it may return to the activities that own them.

## Why now is cheap

Every input the runner needs already exists and is already shared. The expression evaluator, the structured-condition evaluator, the ending-to-destination bindings and the loaders are server code the guards and the test interpreter already consume. The transition algorithm is written down twice — once as prose in the orchestrator's own techniques, once as code in the test interpreter — and both agree.

The corpus is at its most tractable point: a few hundred gate sites with zero failures of any kind, every collection named by a plain variable, and no interpolation anywhere in a gate. Making an unparseable gate a load failure costs nothing today and costs more every month it waits.

And the measurement apparatus is in place. Delivery is already counted per step, per technique and per resource, and the per-dispatch figures come from the harness.

## Scope

Server, a new runner package, and the corpus prose that instructs an agent to drive. The variable-write timing and the derivation rule are the load-bearing pieces and should be settled before any code, because both decide what the session file must carry.

## Decisions this proposal leaves open

Whether a step's declared outputs land in the bag at step completion. The majority of gate sites depend on the answer, and everything else is downstream of it.

Where the pull loop runs. An agent round trip is measurably cheaper than an orchestrator one, but only the orchestrator can reach a person, so a decision point forces a hand-off wherever the loop lives.

Whether step identifiers become unique across a whole activity, or the cursor carries a scope path. Identifiers are unique only within their scope today, and one existing tool already resolves a collision silently to the wrong step.

Where a repeat-until loop's continuation predicate lives. All 19 such loops carry a structured condition that the schema describes as an entry gate and both mechanical readers treat as one, and the field declared for early exit is unused.

Whether equality coerces numerically the way ordering already does, or the write path coerces to the declared type. A number arriving as text currently flips every equality comparison while leaving ordering comparisons working, and the write path records the mismatch as a warning.

Whether action steps are re-authored as technique outputs. Of 84 set actions, 28 carry a literal value, 6 carry a reference needing expansion, and 50 are deliberately valueless because an agent supplies the value.

## Acceptance criteria

- [ ] A runner package walks an activity's steps, decides each gate from the session, drives iteration, and calls out per technique.
- [ ] A step's declared outputs enter the session bag when the step completes.
- [ ] The session carries a durable cursor with a frame per enclosing loop, and a resumed run continues at the next step rather than re-entering the activity.
- [ ] The server derives every transition independently and refuses one it cannot reproduce.
- [ ] A technique call-out returns values keyed by declared output identifier, and the server rejects a return whose shape disagrees with the declared signature.
- [ ] Resolved input values travel separately from the technique body, and reference delivery still deduplicates the body by content.
- [ ] The unit handed to an agent is a run of steps ending at the first gate the session cannot answer.
- [ ] An unparseable gate fails the workflow load.
- [ ] The graders that exist to mark an agent's report are removed along with the parameters that carried it.
- [ ] The runner and the end-to-end interpreter are one implementation, and the properties the test suite records become runtime invariants.
- [ ] The guard suite is green, including the walk over every affected workflow.

## Non-goals

- The runner is not attested. The server accepts a transition because it derives the same one, not because the caller proves its identity, so nothing depends on knowing which client called.
- Nothing crosses the tool channel as an executable. The runner is installed, not delivered.
- Techniques stay prose. Their bodies are the agent's to interpret, and no part of this parses them.
- Concurrency stays where it is. One decision point at a time per session, one cursor per session, and parallelism at session granularity through child workflows.
- Dispatch does not become finer. The gain is that the server decides where a coarse boundary falls, not that boundaries multiply.
- No interpreter for action verbs, and no expansion of step identifiers, which are also the manifest and decision-replay keys.
- The re-dispatch overhead is untouched. That cost follows from where decision points sit in the corpus, and reducing it is corpus work.

## Investigation detail

Every figure here was taken on 2026-08-28 against the server at `c99d9da2` and the workflows branch at `0cebc48f`, by walking each workflow through the real loader rather than by pattern-matching text, so a multi-line condition is attributed to the list item that owns it. The gate classification, the per-site ordering survey, the measured exchange rates behind the delivery-grain decision, the mechanism ledger, three independently reviewed designs of the interaction protocol, and the record of why the runner carries no signature are in the planning folder: [2026-08-28-runner-execution-protocol](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-28-runner-execution-protocol). The protocol verification record there carries a table of claims withdrawn during review, including the earlier gate census and the assumption that a runner could work out for itself which work may run in parallel.

Two areas there remain single-source. The reviews of the gate-evaluation findings and the cost findings did not complete, so the round-trip exchange rate and the per-context establishment cost — the two numbers the delivery grain rests on — are unreviewed and worth re-measuring before engineering is committed. The interaction protocol itself has since been designed three ways, each design independently checked against the code.

Adjacent: #520, which gives a run of steps a name and a home; a runner walks the resolved tree that proposal produces, so the two compose without either depending on the other.

