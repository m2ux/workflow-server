# Runner Execution Protocol — Requirements Specification

## 1. Executive Summary

A workflow definition is a structure: an ordered list of steps, conditions deciding which of them run,
loops that repeat a body, and named endings that decide where control goes next. That structure has
exactly one correct reading.

This specification defines a **runner** — a program that reads the structure and asks an agent only to
carry out what is genuinely prose: a technique's protocol, a judgement, a piece of writing. The server
reproduces every reported transition and accepts a change to a run only when it independently arrives at
the same one.

The system covered here comprises five participants. The **runner** walks the resolved activity tree,
decides conditions, drives repetition, resolves each step's inputs, composes prompts, and reports every
step. The **server** holds the session, resolves definitions, reproduces every reported transition, and
refuses what it cannot reproduce. A **worker** does the run's work — a context spanning an activity or
more, receiving one technique per turn. The **host agent** invokes the runner, spawns workers with the
prompts it composes, and carries a question to the person and an option back, deciding nothing. The
**user** answers decisions that need a person and sees progress.

The scope of this specification is the runner as a tool invoked by an agent. Four capabilities that this
work unlocks are outside that scope and carry no requirements here: the runner as a host that spawns
workers and reaches the person directly, the migration of mechanical content out of technique prose, the
qualification of returned content against its declaration, and a typed language for activity mechanics.

The system aims at three properties, in ascending order of importance. **Efficiency** — fewer, larger,
better-timed deliveries, and the removal of the material that exists only to tell an agent how to
interpret a structure. **Determinism** — the same definitions, values and answers produce the same
sequence of prompts. **Fidelity** — correctness as a property of the arrangement rather than something
checked after the fact, because an agent that never receives the structure cannot depart from it.

## 2. Requirements Sources

### 2.1 Product and Solution Documents

No product or solution document contributes to this specification.

### 2.2 Meeting Transcripts

No meeting transcript contributes to this specification.

### 2.3 Vendor Documents

No vendor document contributes to this specification.

### 2.4 Source Reference Format

Requirements, constraints, and success criteria cite their sources as:

```
*Source: [Source ID] - [specific section or requirement]*
```

When a requirement originates from a specific discussion within a meeting, participant initials MAY be
included for attribution; when it originates from a reference document, the document's author is
included for attribution:

```
*Source: [Source ID] (Initials)*
*Source: [Source ID] (Author Name)*
```

A requirement may cite multiple comma-separated sources.

### 2.5 Reference Documents

**SRC-DOC001**: [Runner — proposal](../2026-08-28-runner-execution-protocol/README.md) — Mike Clay

The proposal is the design record for issue #523. Five companion records sit alongside it and are cited
through the same source reference, each named in the requirement that draws on it: `decisions.md` records
seven settled decisions and three open questions; `investigation.md` records the current-state
measurement; `protocol-verification.md` records three reviewed protocol designs and the claims they
withdrew; `cost-model.md` records the measurements fixing delivery grain; `attestation.md` records why
the runner carries no signature. Where the proposal and the verification record disagree, the
verification record governs, on the proposal's own instruction.

## 3. Use Case Definition

### 3.1 Primary Use Case

Executing a workflow definition so that what ran is what was written. A run begins when a host agent
invokes the runner against a session. The runner opens an activity, receives the resolved tree, and walks
it — deciding each unit's condition, resolving its inputs, composing a prompt, and handing that prompt to
the host agent to spawn or continue a worker with. Each reply is reported to the server, which reproduces
the transition and applies what it can reproduce. Where a unit is a decision, the runner marks it
outstanding and the question travels to the person through the host agent. When the units are exhausted,
the runner evaluates the activity's endings and opens the next.

### 3.2 Personas

**User** — answers decisions that need a person, and follows a run's progress. Holds no view of the
structure and needs none.

**Definition author** — writes and maintains workflow definitions. Needs a run to be evidence about the
definition rather than about the agent that read it, and needs authoring mistakes to surface when the
definitions load.

**Worker** — an agent context that carries out one technique per turn. Needs the technique's prose, its
rules, and the values it requires, and needs to be told exactly which values it owes back.

**Host agent** — holds the two primitives a program lacks: spawning a worker, and relaying a question to
the person. Decides nothing, composes nothing, and tracks nothing.

### 3.3 User Journey

1. The host agent invokes the runner for a session.
2. The runner opens an activity and receives the resolved tree, the current values, and the exits.
3. For each unit whose condition holds, the runner resolves the declared inputs, composes a prompt, and
   passes it to the host agent, which spawns a worker or continues an open one.
4. The worker returns declared values, a decision it could not anticipate, or a set of briefs to fan out.
5. The runner reports the unit to the server, which reproduces the condition, derives the write set,
   applies what it accepts, and returns the delta.
6. On reaching a decision unit, the runner marks it outstanding; the server renders the question and the
   host agent carries it to the user and an option back.
7. On exhausting the units, the runner evaluates the endings, selects a destination, and opens the next
   activity.
8. If the run is interrupted, it resumes at the recorded position rather than at the start of the
   activity.

### 3.4 Key Success Criteria

**SUCCESS-001: A question reaches the person only where the structure does not already determine the answer, and asking costs no fresh agent context.**

*Status*: *pending*

*Rationale*: A person interrupted by something the structure already decides is an avoidable cost, and establishing a context purely to ask a question is the largest single expense in the system.

*Source*: SRC-DOC001 (Mike Clay) - §3 Use cases UC1, §4 User stories

**SUCCESS-002: The step a run is currently executing is visible to the user.**

*Status*: *pending*

*Rationale*: Without it, a person cannot distinguish progress from a stall.

*Source*: SRC-DOC001 (Mike Clay) - §3 Use cases UC2, §4 User stories

**SUCCESS-003: An interrupted run continues from the step it stopped on, so a lost agent context costs one step rather than one activity and no question is asked twice.**

*Status*: *pending*

*Rationale*: Re-entering a whole activity repeats work and crosses already-answered decisions by replaying recorded answers.

*Source*: SRC-DOC001 (Mike Clay) - §3 Use cases UC3, §4 User stories, §9 Resuming after interruption

**SUCCESS-004: Cost accounting per activity continues to work unchanged.**

*Status*: *pending*

*Rationale*: Usage is recorded per activity and a per-step figure is unreachable, so the accounting survives only while hand-offs stay aligned to activities.

*Source*: SRC-DOC001 (Mike Clay) - §3 Use cases UC4, §4 User stories, cost-model.md

**SUCCESS-005: A run is evidence about the definition rather than about the agent that read it — the same definitions with the same answers produce the same sequence of prompts.**

*Status*: *pending*

*Rationale*: Only under this property does a change in behaviour mean a change in the definition.

*Source*: SRC-DOC001 (Mike Clay) - §3 Use cases UC5, §4 User stories, §8.2 Determinism

**SUCCESS-006: A wrong reference or an unparseable condition fails when the definitions load, not mid-run.**

*Status*: *pending*

*Rationale*: An author finds out at authoring time rather than part-way through a run.

*Source*: SRC-DOC001 (Mike Clay) - §3 Use cases UC6, §4 User stories

**SUCCESS-007: A run of steps is reusable without being copied.**

*Status*: *pending*

*Rationale*: A change then lands in one place rather than at every copy.

*Source*: SRC-DOC001 (Mike Clay) - §3 Use cases UC7, §4 User stories

**SUCCESS-008: Work runs concurrently only where something has established that it is independent.**

*Status*: *pending*

*Rationale*: Concurrency becomes a property of the definition rather than a hope.

*Source*: SRC-DOC001 (Mike Clay) - §3 Use cases UC8, §4 User stories

**SUCCESS-009: A worker is given one job and a contract that makes "done" checkable rather than a matter of opinion.**

*Status*: *pending*

*Rationale*: A worker can then do the work without interpreting a structure, and completion is established mechanically.

*Source*: SRC-DOC001 (Mike Clay) - §3 Use cases UC9, §4 User stories

## 4. Functional Requirements

### 4.1 Structure Execution (`P0`)

**REQ-F001: The runner SHALL walk the resolved activity tree and execute each unit in the order the tree declares.**

*Status*: *pending*

*Rationale*: Order is the runner's walk, so there is no self-report to compare a claimed order against. Declared order becomes a property nothing has a channel to violate.

*Source*: SRC-DOC001 (Mike Clay) - §5.4 Where each responsibility sits, §8.3 Guarantees that get stronger

**REQ-F002: The runner SHALL evaluate each unit's condition against the values it holds at that unit, and SHALL skip a unit whose condition evaluates false.**

*Status*: *pending*

*Rationale*: A verdict computed when an activity opens is stale by its second step. The step is the only point at which the answer is correct, and a step skipped for a false condition tells an author something about the condition.

*Source*: SRC-DOC001 (Mike Clay) - §9 Executing a run of steps, §8.3, decisions.md

**REQ-F003: The runner SHALL drive loop repetition and SHALL hold the iteration count against the loop's declared limit.**

*Status*: *pending*

*Rationale*: Iteration is executed and bounded entirely by the agent today, and no code carries out a declared repetition — the end-to-end harness walks a loop body exactly once. Repetition is the one capability the runner writes from scratch.

*Source*: SRC-DOC001 (Mike Clay) - §5.4, §8.3, investigation.md

**REQ-F004: The runner SHALL resolve every declared input of a unit to a value before dispatching that unit, and SHALL refuse the unit when a required input resolves to nothing.**

*Status*: *pending*

*Rationale*: An input that resolves to nothing reaches an agent annotated as unresolved, and the agent improvises. Refusal before dispatch replaces improvisation with a diagnosable event.

*Source*: SRC-DOC001 (Mike Clay) - §8.3 Guarantees that are newly possible, §9 The lifecycle of one unit

**REQ-F005: The runner SHALL record its position durably per step, with a distinct frame per loop.**

*Status*: *pending*

*Rationale*: The session carries no step field, and position cannot be derived from the history because every included step is marked started at the same instant with nothing recording order. A durable record is added rather than derived.

*Source*: SRC-DOC001 (Mike Clay) - §11 Delivery stages, investigation.md

**REQ-F006: The runner SHALL treat a report for a position already recorded as a no-op or a refusal, rather than as a second execution.**

*Status*: *pending*

*Rationale*: Position is authoritative once recorded, which makes a repeated call distinguishable from a fresh one at the point of the call rather than in the trace afterwards.

*Source*: SRC-DOC001 (Mike Clay) - §8.3 Guarantees that get stronger

**REQ-F007: The runner SHALL resume an interrupted run at the next unexecuted unit rather than at the start of the activity.**

*Status*: *pending*

*Rationale*: With position recorded per step, an already-answered decision is never re-reached and replay shrinks back to genuine re-entry.

*Source*: SRC-DOC001 (Mike Clay) - §9 Resuming after interruption

**REQ-F008: The runner SHALL evaluate an activity's declared exits against the current values and SHALL select the destination activity.**

*Status*: *pending*

*Rationale*: The edge routing control from one activity to the next is control the runner owns, and it is what the orchestration loop reduces to.

*Source*: SRC-DOC001 (Mike Clay) - §9 Executing a run of steps, §5.5 What becomes of the agent hierarchy

**REQ-F009: The runner SHALL execute an action unit directly, without composing a prompt for it.**

*Status*: *pending*

*Rationale*: An action unit carries no technique body, so there is nothing for the prompt builder to build. This requirement is derived rather than stated in the source; see the open item recorded against it in the analysis report.

*Source*: SRC-DOC001 (Mike Clay) - §6 The contracts, protocol-verification.md

### 4.2 Prompt Composition and Worker Dispatch (`P0`)

**REQ-F010: The runner SHALL compose each work unit's prompt from the technique body, the resolved input values, and the outputs the unit declares.**

*Status*: *pending*

*Rationale*: The line between runner and worker is the technique's declared signature — structure above it, prose below it, and nothing crossing.

*Source*: SRC-DOC001 (Mike Clay) - §5.2 What the runner is, §5.4, §6 The contracts

**REQ-F011: A composed prompt SHALL be a pure function of the definitions and the resolved input values, independent of which agent asks, when it asks, and what that agent holds in context.**

*Status*: *pending*

*Rationale*: Purity is what makes two prompts comparable at all, and it is the precondition for every determinism guarantee that follows.

*Source*: SRC-DOC001 (Mike Clay) - §8.2 Determinism

**REQ-F012: The runner SHALL make a composed prompt fingerprintable, so that a divergence between two runs is detectable.**

*Status*: *pending*

*Rationale*: A fingerprint turns "the same questions were asked" from an assumption into a checkable claim.

*Source*: SRC-DOC001 (Mike Clay) - §8.2 Determinism, §8.3

**REQ-F013: The runner SHALL return a composed prompt to the host agent for spawning, and SHALL NOT spawn a worker itself.**

*Status*: *pending*

*Rationale*: Spawning is a tool in an agent's tool list rather than an interface a program can call, so the primitive stays with an agent while the composition stays with the runner.

*Source*: SRC-DOC001 (Mike Clay) - §5.2, §10 What the runner is not allowed to do

**REQ-F014: The runner SHALL request continuation of an open worker context where one exists, and a fresh context only where none does.**

*Status*: *pending*

*Rationale*: Establishing a fresh context costs 23,000 to 42,000 tokens before any workflow content arrives. A fresh context for each of the corpus's technique steps would multiply the dominant cost fivefold.

*Source*: SRC-DOC001 (Mike Clay) - §5.2, cost-model.md

**REQ-F015: The runner SHALL accept a worker reply in exactly one of three shapes — `done`, `decide`, or `dispatch`.**

*Status*: *pending*

*Rationale*: A values-only reply leaves two things in the corpus with nowhere to go: work admitted part-way through a run that the definition could not anticipate, and fan-out whose prompts the corpus composes itself.

*Source*: SRC-DOC001 (Mike Clay) - §6 The contracts

**REQ-F016: The runner SHALL check a `done` reply against the unit's declared output identifiers, remap destinations, and declared types, and SHALL reject a reply whose shape disagrees with the declaration.**

*Status*: *pending*

*Rationale*: A step's report is one free-text string checked for non-emptiness, and nothing joins "this step declares an output" to "the session gained it". Checking against the declaration closes that join.

*Source*: SRC-DOC001 (Mike Clay) - §8.3 Guarantees that are newly possible, §9 The lifecycle of one unit

**REQ-F017: The runner SHALL handle a `dispatch` reply by composing each brief it carries into a prompt and passing that prompt to the host agent, holding no more outstanding at once than the reply's declared concurrency limit.**

*Status*: *pending*

*Rationale*: Fan-out is a first-class construct bound as an ordinary step at 22 sites across 8 activity files, and every one is preceded by a step composing its prompts at run time from domain material no runner could derive. The source's fan-out diagram draws the runner reaching each worker directly and states that the host agent's spawn is elided from every flow because it is identical throughout, so composition sits with the runner and the spawn stays with the host agent under REQ-F013.

*Source*: SRC-DOC001 (Mike Clay) - §6, §9 Fan-out, §9 Key flows, §10, protocol-verification.md

**REQ-F018: A brief composed at run time SHALL be a structured prompt carrying the same checks as a runner-composed prompt, rather than an opaque string relayed unaltered.**

*Status*: *pending*

*Rationale*: The brief-composing sites are also the sites that fan out widest, so relaying untouched text would leave the largest dispatches outside every guarantee the runner otherwise gives. Roughly 25 brief-composing techniques change to declare structured output, and in exchange there is one prompt shape and one set of checks.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), §6

**REQ-F019: The runner SHALL gather fan-out results into one array under one declared name in a single call.**

*Status*: *pending*

*Rationale*: No value-path reader in the system handles brackets, so writing a value per iteration under an indexed name is not expressible.

*Source*: SRC-DOC001 (Mike Clay) - §9 Fan-out, protocol-verification.md

**REQ-F020: The runner SHALL accept a `decide` reply raising a decision the definition did not anticipate, and SHALL route it through the decision channel.**

*Status*: *pending*

*Rationale*: Unexpected work admitted part-way through a run needs somewhere to go, and the session already models this kind of decision.

*Source*: SRC-DOC001 (Mike Clay) - §4 User stories, §6 The contracts

### 4.3 Decisions and the Person (`P0`)

**REQ-F021: The runner SHALL mark a decision outstanding on the server and wait, and SHALL NOT present a question to the person.**

*Status*: *pending*

*Rationale*: Presentation is a front end's concern. The runner stays headless, and the arrow between runner and person states where a question originates rather than how it travels.

*Source*: SRC-DOC001 (Mike Clay) - §5.3 How a decision reaches a person, §9

**REQ-F022: The server SHALL render a decision's question, its options, and their resolved consequences.**

*Status*: *pending*

*Rationale*: The server already holds exactly one outstanding decision at a time and already renders it with consequences resolved, so rendering stays where the state is.

*Source*: SRC-DOC001 (Mike Clay) - §5.3, §9 A decision that reaches the user

**REQ-F023: The host agent SHALL carry the rendered question to the person and SHALL return one option identifier from the closed option set.**

*Status*: *pending*

*Rationale*: What a mediating agent can fabricate shrinks to which of *n* fixed options a person chose. An agent remains on the path of the answer, so human presence is established at the level of detection rather than made unrepresentable.

*Source*: SRC-DOC001 (Mike Clay) - §5.3

**REQ-F024: The decision channel SHALL be implemented as an interface with a single agent-relayed implementation, rather than as inline calls.**

*Status*: *pending*

*Rationale*: It costs nothing to build this way now, and it is what lets the channel be replaced later without touching anything else.

*Source*: SRC-DOC001 (Mike Clay) - §5.3 One design consequence for this work

**REQ-F025: The server SHALL verify a dismissed conditional decision against the session values rather than accept the reporting agent's claim.**

*Status*: *pending*

*Rationale*: Dismissal currently relies on agent honesty, with the server checking only that a condition field exists. One evaluation against the session values moves it to a refusal, and is available independently of the runner.

*Source*: SRC-DOC001 (Mike Clay) - §8.3, §11 Delivery stages

**REQ-F026: A decision unit SHALL be handled without establishing a worker context.**

*Status*: *pending*

*Rationale*: Asking a question becomes a turn in a context that already exists rather than the cost of a whole context, which is what makes asking cheap.

*Source*: SRC-DOC001 (Mike Clay) - §9 A decision that reaches the user

**REQ-F027: The existing minimum response interval and auto-advance timers SHALL continue to apply to a relayed decision.**

*Status*: *pending*

*Rationale*: The pacing that governs how a decision is presented is unaffected by who composes the question.

*Source*: SRC-DOC001 (Mike Clay) - §5.3

**REQ-F028: The system SHALL hold at most one outstanding decision per session.**

*Status*: *pending*

*Rationale*: One decision slot exists, five tools are frozen while it is filled, and a second is refused outright. Two members of a fan-out therefore cannot both escalate without a keyed map.

*Source*: SRC-DOC001 (Mike Clay) - §10, protocol-verification.md

### 4.4 Server Reproduction and Write Authority (`P0`)

**REQ-F029: The server SHALL reproduce every transition the runner reports and SHALL refuse any transition it cannot independently arrive at.**

*Status*: *pending*

*Rationale*: Reproduction replaces caller identity as the basis of acceptance. A substitute program producing correct transitions becomes indistinguishable from the genuine one and equally acceptable, so who called stops being a question worth asking.

*Source*: SRC-DOC001 (Mike Clay) - §1, §5.4, attestation.md

**REQ-F030: A step's declared outputs SHALL be applied to the session and written when the step finishes.**

*Status*: *pending*

*Rationale*: More than half of all conditions read a value an earlier step of the same activity produced. Without per-step writes the runner can decide only the minority fed by earlier activities, and the fidelity argument has no purchase. This is the load-bearing requirement of the whole design.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), §11 Delivery stages

**REQ-F031: The server SHALL derive the set of names a step may write and SHALL reject a produced value falling outside that set, naming the reason.**

*Status*: *pending*

*Rationale*: The server already owns the analysis that works out which values a step may write. Applying it per step makes write authority a server verdict rather than an agent claim.

*Source*: SRC-DOC001 (Mike Clay) - §6 The contracts, §11 Delivery stages

**REQ-F032: The server SHALL return, for each reported unit, the accepted names, the rejected names each with a reason, and the resulting values delta.**

*Status*: *pending*

*Rationale*: The runner maintains its own copy of the values in order to decide conditions, and needs the authoritative delta to stay aligned with the session.

*Source*: SRC-DOC001 (Mike Clay) - §6 The contracts

**REQ-F033: The server SHALL send condition expressions rather than condition verdicts.**

*Status*: *pending*

*Rationale*: A verdict computed when an activity opens is stale by its second step, which is the problem being solved rather than a detail. A runner standing at a step never has the problem a three-valued delivery-time check exists to describe.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), §7, protocol-verification.md

**REQ-F034: A missing value SHALL fail a positive test loudly, while absence retains its meaning for negative and presence tests.**

*Status*: *pending*

*Rationale*: The corpus deliberately spells "not in that mode" as a value nobody set, so treating every absence as an error would break the idiom. The rule applies to positive reads only.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled)

**REQ-F035: The server SHALL compute an activity's ending and SHALL reconcile it against the ending reported.**

*Status*: *pending*

*Rationale*: The server currently checks that a claimed outcome maps to a target without establishing whether the condition behind it is true. Computing the ending moves branch truth from convention to refusal.

*Source*: SRC-DOC001 (Mike Clay) - §11 Delivery stages, §8.3

### 4.5 Artifacts (`P0`)

**REQ-F036: The runner SHALL write a declared artifact under its declared name and placement, taking only the content from the worker.**

*Status*: *pending*

*Rationale*: This removes 45 invocations and one technique file, eliminates the class of defect where an agent writes under the wrong name, and halves document traffic — content still returns from whoever wrote it but no longer goes out again as an input.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), §8.3

**REQ-F037: A technique declaring an artifact SHALL state where its output belongs.**

*Status*: *pending*

*Rationale*: The declaration is what the runner writes from, so naming and placement become properties of the definition rather than of an agent's reading.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled)

### 4.6 Definition Loading and Validation (`P0`, except REQ-F047 and REQ-F048 at `P1`)

**REQ-F038: The loader SHALL fail the load when a condition does not parse.**

*Status*: *pending*

*Rationale*: The corpus is at zero parse failures, so moving the check into the loader is free now and dearer later. It turns an authoring mistake into a load-time refusal.

*Source*: SRC-DOC001 (Mike Clay) - §11 Delivery stages, §8.3

**REQ-F039: The loader SHALL verify that every value a step reads has a producer positioned before it, at step granularity.**

*Status*: *pending*

*Rationale*: The existing analysis works at activity granularity. Step granularity becomes possible once step order is authoritative, and it localises a mistake to the step that made it.

*Source*: SRC-DOC001 (Mike Clay) - §8.3, §4 User stories

**REQ-F040: The runner SHALL receive the activity structure as a resolved tree of data, and SHALL hold no parser, no access to definition files, and no knowledge of the source notation.**

*Status*: *pending*

*Rationale*: The stable contract is the tree, not the file format. This is the whole of what makes a later change of definition language a change of one layer rather than a rewrite. The prohibition covers definition files; the filesystem access the runner holds for writing declared artifacts under REQ-F036 is a separate grant.

*Source*: SRC-DOC001 (Mike Clay) - §7 Designed for a later formal language, §10

**REQ-F041: Condition expressions SHALL travel as structured trees rather than as strings.**

*Status*: *pending*

*Rationale*: A language emitting typed expressions natively then needs no adapter to reach the runner.

*Source*: SRC-DOC001 (Mike Clay) - §7 Designed for a later formal language

**REQ-F042: The loader SHALL resolve every ambiguity arising from the source notation, so that the runner never encounters one.**

*Status*: *pending*

*Rationale*: Anything undecidable only because of how the source is written belongs on the loader's side of the boundary. A typed language would not create these problems, so the runner is not built to cope with them.

*Source*: SRC-DOC001 (Mike Clay) - §7 Designed for a later formal language

**REQ-F043: Nothing positional SHALL survive into the resolved tree; where order carries meaning it SHALL be explicit in the tree.**

*Status*: *pending*

*Rationale*: Document order is a property of a text file, and meaning should not depend on how the source happened to be laid out.

*Source*: SRC-DOC001 (Mike Clay) - §7 Designed for a later formal language

**REQ-F044: A bare supplied binding value SHALL always be a literal, and a reference SHALL always be braced.**

*Status*: *pending*

*Rationale*: 85% of technique input bindings are bare strings and undecidable — 349 of 412, of which 193 name a session value and 156 are literals, with both forms appearing in a single binding block. Shipping a component whose argument is that it removes guessing, while it guesses on most of its inputs, defeats the argument.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), §11 Delivery stages, protocol-verification.md

**REQ-F045: The two placeholder token grammars SHALL be unified on the dotted form.**

*Status*: *pending*

*Rationale*: The grammar the resolution precedence uses has no dots while a sibling module's does. Unification closes an existing silent fault where 17 dotted placeholders report as resolved while naming no producer.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), protocol-verification.md

**REQ-F046: A step identifier SHALL be unique within its activity, enforced by one check covering the whole activity.**

*Status*: *pending*

*Rationale*: The schema permits two steps in different loop bodies to share an identifier, but the corpus has zero duplicates across 131 activities — a permission nobody uses. One shared check keeps step lookup correct rather than lucky, keeps the decision-replay key valid, and avoids a second way of naming things.

*Source*: SRC-DOC001 (Mike Clay) - §7, protocol-verification.md

**REQ-F047: The condition guard SHALL cover activity endings, nested directories, and validation targets.**

*Status*: *pending*

*Rationale*: The existing guard misses these surfaces, so a condition attached to one of them escapes the check entirely.

*Source*: SRC-DOC001 (Mike Clay) - §11 Delivery stages

**REQ-F048: The unused early-exit condition field SHALL be removed.**

*Status*: *pending*

*Rationale*: The field is declared and never read, and the first delivery stage deletes it. REQ-NF038 settles the open question over the field's alternative use before that stage lands.

*Source*: SRC-DOC001 (Mike Clay) - §11 Delivery stages

### 4.7 Concurrency (`P1`)

**REQ-F049: Work SHALL run concurrently only where the definition declares it independent.**

*Status*: *pending*

*Rationale*: Concurrency becomes a declared and checked property of the definition rather than an assumption made at run time.

*Source*: SRC-DOC001 (Mike Clay) - §4 User stories, §8.3

**REQ-F050: Independence SHALL NOT be derived from comparing which values adjacent steps read and write.**

*Status*: *pending*

*Rationale*: That test clears 231 adjacent step pairs across 155 groups, dominated by serial command-line pipelines whose real dependency is shared state on disk that no definition declares. Parallelising them would corrupt each other.

*Source*: SRC-DOC001 (Mike Clay) - §8.3, protocol-verification.md

### 4.8 Progress, Commits and Accounting (`P0`)

**REQ-F051: Committing and writing the progress table SHALL remain agent work, dispatched as ordinary units at each activity boundary.**

*Status*: *pending*

*Rationale*: Both look mechanical and are not — a commit message and a progress summary are prose a person reads. Keeping them as techniques holds the line that the runner never composes text. The price is two dispatches per activity boundary that a code path would not need.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled)

**REQ-F052: The runner SHALL hold no repository access.**

*Status*: *pending*

*Rationale*: Follows from REQ-F051 and keeps version control outside the runner entirely.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled)

**REQ-F053: Usage SHALL continue to be recorded per activity.**

*Status*: *pending*

*Rationale*: A per-step figure is unreachable: a step carried out inside a live agent context has no harness-reported figure and the server cannot invent one. The call requires the activity's name and records the change since the last figure for that hand-off.

*Source*: SRC-DOC001 (Mike Clay) - §4 User stories, cost-model.md

**REQ-F054: A hand-off SHALL remain aligned to an activity boundary.**

*Status*: *pending*

*Rationale*: If a hand-off becomes a run of steps that can cross an activity boundary, the required activity name, the reconciliation that finds activities with no usage recorded, and the per-activity elapsed-time spans all stop being well defined at once.

*Source*: SRC-DOC001 (Mike Clay) - cost-model.md

**REQ-F055: The step a run is currently executing SHALL be observable.**

*Status*: *pending*

*Rationale*: Position is recorded per step under REQ-F005, so exposing it lets a person tell progress from a stall.

*Source*: SRC-DOC001 (Mike Clay) - §4 User stories

### 4.9 The Orchestration Workflow (`P0`)

**REQ-F056: Session discovery, initialisation, target resolution, and close-out SHALL remain ordinary activities the runner executes, with their techniques dispatched to agents.**

*Status*: *pending*

*Rationale*: These are real work with side effects rather than loop control, so they stay activities like any other workflow's.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), §5.5

**REQ-F057: The client-dispatch activity SHALL be removed.**

*Status*: *pending*

*Rationale*: That activity is the orchestrator loop the runner becomes, so it is deleted rather than left unreachable.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), §5.5

**REQ-F058: The bootstrap SHALL direct an agent to the runner rather than to a procedure to follow.**

*Status*: *pending*

*Rationale*: The procedure the bootstrap currently describes becomes code, so what remains is a pointer to the program that holds it.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled)

**REQ-F059: The guard keeping the bootstrap procedure self-contained SHALL be removed.**

*Status*: *pending*

*Rationale*: It protects a procedure that no longer exists once REQ-F058 holds.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled)

**REQ-F060: The conduct rules written for an orchestrator, and the worker rule forbidding calls to the control-plane tools, SHALL be removed.**

*Status*: *pending*

*Rationale*: The orchestrator rules are guidance for decisions no agent makes any more, and a worker has no server access to misuse, which makes the prohibition unenforceable advice rather than a constraint.

*Source*: SRC-DOC001 (Mike Clay) - §5.5

**REQ-F061: The rule forbidding an activity from opening with a decision SHALL be removed.**

*Status*: *pending*

*Rationale*: That rule exists because asking a question currently costs a whole worker context. Under REQ-F026 it costs a turn in a context that already exists.

*Source*: SRC-DOC001 (Mike Clay) - §9 A decision that reaches the user

**REQ-F062: The step manifest SHALL be removed.**

*Status*: *pending*

*Rationale*: The manifest validates that an agent reported each step, not that it performed one. The runner hands out each unit and receives each reply, so there is no self-report left to validate.

*Source*: SRC-DOC001 (Mike Clay) - §8.3 Guarantees that get stronger

### 4.10 Inline Technique References (`P0`)

**REQ-F063: An instruction inside a technique's protocol to apply another technique SHALL have a resolved delivery path — either resolved into the prompt as a closure with a declared depth and cycle policy, or converted into a step in the structure.**

*Status*: *pending*

*Rationale*: A worker under the runner receives prose and values and has no server access, so it reaches such an instruction with nothing to apply and improvises the invocation. The loader documents this failure and works around it today by hand-listing nine references, which does not scale to the full set.

*Source*: SRC-DOC001 (Mike Clay) - §11 One dependency that has to be discharged, protocol-verification.md

**REQ-F064: A census of the inline technique references by kind SHALL be completed before the runner stage begins.**

*Status*: *pending*

*Rationale*: The breakdown between mechanical sub-tasks that convert cleanly, compositional cases wanting a routine, and cross-cutting references that should not convert at all decides how much closure resolution the runner still needs — possibly none, possibly a bounded amount for the residue. The proposal counts 137 references across 75 files and the verification record counts 131 across 68; the census settles the figure.

*Source*: SRC-DOC001 (Mike Clay) - §11 One dependency that has to be discharged

## 5. Non-Functional Requirements

### 5.1 Fidelity and Isolation

**REQ-NF001: The workflow structure SHALL NOT be delivered to a worker.**

*Status*: *pending*

*Rationale*: This is the central contribution of the design. Correctness stops being something checked after the fact and becomes a property of the arrangement, because an agent that never receives the structure cannot depart from it. It removes the ability to misreport rather than adding a check for misreporting.

*Source*: SRC-DOC001 (Mike Clay) - §1 Executive summary, §8.3 Fidelity

**REQ-NF002: A worker SHALL hold no position, no server access, and no memory of the run.**

*Status*: *pending*

*Rationale*: A chain of stateful actors each holding partial state and passing summaries down and reports up is what the agent hierarchy is. Removing that state makes the arrangement a program with stateless calls, which is a larger change than flattening the hierarchy.

*Source*: SRC-DOC001 (Mike Clay) - §5.5 What becomes of the agent hierarchy

**REQ-NF003: A worker SHALL receive one technique per turn — its protocol prose, its rules, and the values it needs.**

*Status*: *pending*

*Rationale*: This is the whole of what a worker needs in order to do the work without interpreting a structure.

*Source*: SRC-DOC001 (Mike Clay) - §2 The participants, §4 User stories, §5.4

**REQ-NF004: A worker context SHALL span an activity or more.**

*Status*: *pending*

*Rationale*: The corpus already distinguishes spawning an agent from continuing one, and establishing a context is the dominant cost, so the context is the unit that persists across techniques.

*Source*: SRC-DOC001 (Mike Clay) - §2, §5.2, cost-model.md

**REQ-NF005: The host agent SHALL decide nothing, compose nothing, and track nothing, relaying only what it did not compose and cannot alter.**

*Status*: *pending*

*Rationale*: The host agent holds two primitives a program lacks — spawning and relaying — and nothing else. That is what makes it a proxy rather than a tier in a hierarchy.

*Source*: SRC-DOC001 (Mike Clay) - §2, §5.2, §5.4

**REQ-NF006: The runner SHALL be headless, holding no channel to the person.**

*Status*: *pending*

*Rationale*: Presentation is a front end's concern, and every conversation with the person is agent-mediated within this scope.

*Source*: SRC-DOC001 (Mike Clay) - §5.3

**REQ-NF007: The runner SHALL NOT parse a technique's protocol prose.**

*Status*: *pending*

*Rationale*: 436 of the corpus's 2,459 protocol bullets carry control flow of their own, so a call into a technique is all-or-nothing. The runner establishes that a technique ran and returned what it declared, never which branch it took inside.

*Source*: SRC-DOC001 (Mike Clay) - §10 What the runner is not allowed to do

**REQ-NF008: A technique SHALL be re-executed from its start rather than resumed part-way.**

*Status*: *pending*

*Rationale*: Follows from REQ-NF007 — with the interior of a technique opaque, there is no position inside one to resume from.

*Source*: SRC-DOC001 (Mike Clay) - §8.3 What stays unenforceable, §10

**REQ-NF009: The runner SHALL NOT compose text that a person reads.**

*Status*: *pending*

*Rationale*: This is the line that keeps commit messages and progress summaries with agents under REQ-F051, and it is what makes that division principled rather than arbitrary.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled)

**REQ-NF010: The runner SHALL NOT carry out a validation instruction requiring host privileges.**

*Status*: *pending*

*Rationale*: Validation instructions ask the host whether a command-line tool is authenticated, whether a signing agent is reachable, or whether a key is available. Whether the runner shells out to the host or delegates to an agent is unresolved, and the prohibition stands while it is.

*Source*: SRC-DOC001 (Mike Clay) - §10, protocol-verification.md

### 5.2 Trust Model

**REQ-NF011: The runner SHALL carry no embedded signing key.**

*Status*: *pending*

*Rationale*: A signature establishes who made something, not what was run — an agent can check a signature, set the program aside, and make the calls itself. A key inside a program whose reader is also its adversary is a key the reader can take.

*Source*: SRC-DOC001 (Mike Clay) - attestation.md

**REQ-NF036: The server SHALL accept a transition because it independently arrives at the same one rather than because the caller proves its identity.**

*Status*: *pending*

*Rationale*: The concern throughout is honest mistakes rather than a deliberately dishonest agent, and against honest mistakes the server working out the right answer is what works. Acceptance resting on reproduction makes a substitute program producing correct transitions indistinguishable from the genuine one and equally acceptable, which is what retires the question of who called.

*Source*: SRC-DOC001 (Mike Clay) - attestation.md

**REQ-NF012: The runner SHALL be published as an installable package rather than delivered down the tool channel.**

*Status*: *pending*

*Rationale*: Tool responses are text, and an agent's conversation is the most expensive place in the system to put bytes. Publishing gives distribution and versioning for free and avoids per-platform builds.

*Source*: SRC-DOC001 (Mike Clay) - attestation.md

### 5.3 Layering and Evolution

**REQ-NF013: The resolved tree SHALL be the stable contract between loader and runner, so that a change of source notation touches the loader alone.**

*Status*: *pending*

*Rationale*: Holding this deliberately rather than enjoying it by accident is what keeps a later change of definition language cheap.

*Source*: SRC-DOC001 (Mike Clay) - §7 Designed for a later formal language

**REQ-NF014: The design SHALL carry no compatibility obligation toward a later typed definition language — no dual-format support and no migration path.**

*Status*: *pending*

*Rationale*: That migration is not proposed here, and holding anything open in case of it would be speculative.

*Source*: SRC-DOC001 (Mike Clay) - §7 Designed for a later formal language

**REQ-NF015: The runner SHALL constitute the operational semantics of the workflow mechanics as one executable definition.**

*Status*: *pending*

*Rationale*: When a loop stops, what an absent value does to a comparison, in what order inputs resolve, and what happens when a required one does not are today distributed across prose, a test harness, and the reading habits of agents. Collecting them into one executable definition settles what a formal language would have to settle anyway.

*Source*: SRC-DOC001 (Mike Clay) - §7 Designed for a later formal language

### 5.4 Delivery and Content

**REQ-NF016: The runner-to-server link MAY be as chatty as required.**

*Status*: *pending*

*Rationale*: It is one local process addressing another, so an exchange on it is cheap and the reporting grain is free to be as fine as fidelity wants.

*Source*: SRC-DOC001 (Mike Clay) - §5.1 Container view, cost-model.md

**REQ-NF037: The runner-to-worker link SHALL stay coarse, carrying prose.**

*Status*: *pending*

*Rationale*: An exchange on this link costs roughly what 18,800 characters of fresh content costs. The two working links have opposite grains, and that asymmetry is the whole design.

*Source*: SRC-DOC001 (Mike Clay) - §5.1 Container view, cost-model.md

**REQ-NF017: Technique body composition SHALL exclude provenance decoration, so that a composed body is a pure function of the definitions.**

*Status*: *pending*

*Rationale*: The decoration telling an agent where each value came from is a pure add-on over a composition step that reads no session and no step. Removing it is what makes a body corpus-pure and content-addressable.

*Source*: SRC-DOC001 (Mike Clay) - §8.2 Determinism, protocol-verification.md

**REQ-NF018: The record of already-sent content SHALL key on the stripped body.**

*Status*: *pending*

*Rationale*: The record currently keys on the technique while hashing decorated text, and the decoration differs by document position — so the same technique bound at two positions hashes differently, misses the record, and is delivered twice. Keying on the stripped body fixes an existing waste.

*Source*: SRC-DOC001 (Mike Clay) - §8.2 Determinism, protocol-verification.md

**REQ-NF019: A delivery SHALL NOT carry rules or techniques whose only subject is how to drive a workflow.**

*Status*: *pending*

*Rationale*: Roughly 33,000 characters of every hand-off exist only to tell an agent how to interpret a structure. Once a program reads the structure, that material has no reader.

*Source*: SRC-DOC001 (Mike Clay) - §1, §8.1 Efficiency, attestation.md

### 5.5 Session Integrity

**REQ-NF020: The runner SHALL serialise its reports to the server.**

*Status*: *pending*

*Rationale*: The session store is last-writer-wins. At roughly 1,085 reports per run rather than 79, the concurrent-write window becomes normal traffic rather than an edge case.

*Source*: SRC-DOC001 (Mike Clay) - protocol-verification.md

**REQ-NF021: The unit-reporting call SHALL reload the session before saving.**

*Status*: *pending*

*Rationale*: Delivery already reloads before saving, on the stated grounds that saving an earlier snapshot would silently revert a concurrent write. The reporting call adopts the same discipline.

*Source*: SRC-DOC001 (Mike Clay) - protocol-verification.md

**REQ-NF022: A session whose position record is missing SHALL be refused outright, with a documented way back.**

*Status*: *pending*

*Rationale*: The session schema quietly discards what it does not declare, so a server build unaware of the position record would erase one and leave a valid signature behind — which is then reported as suspected tampering rather than as a version difference. Seven existing optional fields are already exposed to this.

*Source*: SRC-DOC001 (Mike Clay) - investigation.md

**REQ-NF023: Documentation asserting that the server never evaluates a condition SHALL be corrected.**

*Status*: *pending*

*Rationale*: The server already evaluates every step's gate against the current session values when it delivers an activity, and uses the answer to decide which steps to include. Five documentation sites assert the opposite and are out of date whether or not the runner is built.

*Source*: SRC-DOC001 (Mike Clay) - §11 Delivery stages, investigation.md

## 6. Performance Requirements

**REQ-NF024: A single delivery to a worker SHALL carry at least four steps' worth of content.**

*Status*: *pending*

*Rationale*: One exchange costs about what 18,800 characters of new material costs, and the average fully composed technique is 5,275 characters — so paying for an exchange to deliver one step loses roughly 3.6 to 1. One step per exchange is not a candidate design.

*Source*: SRC-DOC001 (Mike Clay) - cost-model.md, §8.1

**REQ-NF025: The delivery unit SHALL be the unbroken run of steps from the current position to the first condition that cannot yet be answered.**

*Status*: *pending*

*Rationale*: The saving is not in sending less per delivery — nothing is being wasted, since the server already withholds every step whose condition reads false. It is in answering the conditions that cannot be answered at delivery time and handing over the next unbroken run in one go, collapsing 23 to 84 separate fetches worth 108,000 to 395,000 tokens.

*Source*: SRC-DOC001 (Mike Clay) - cost-model.md, §8.1 Efficiency

**REQ-NF026: A worker's reply SHALL travel with its next request rather than in a separate call.**

*Status*: *pending*

*Rationale*: A separate call for reporting a result doubles the exchange count, and exchanges are the second-heaviest cost in the system after establishing contexts.

*Source*: SRC-DOC001 (Mike Clay) - cost-model.md

**REQ-NF027: The session store SHALL gain an index or a cache before per-step writes land.**

*Status*: *pending*

*Rationale*: Per-step writes mean roughly 1,085 writes per run instead of 79, against a store that reads and parses every session file on every call with no index, no cache, and no early exit. This is a prerequisite for REQ-F030, not a follow-up to it.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), cost-model.md

**REQ-NF028: Continuous integration SHALL price an exchange, not bytes alone.**

*Status*: *pending*

*Rationale*: None of the four existing benchmarks prices an exchange, and the token benchmark's threshold is on bytes. A first experiment with one-step delivery would therefore appear to succeed while losing on the term that dominates.

*Source*: SRC-DOC001 (Mike Clay) - cost-model.md

## 7. Project and Process Requirements

**REQ-NF029: Delivery SHALL proceed in stages, each useful alone and assuming nothing after it.**

*Status*: *pending*

*Rationale*: Stated as the delivery discipline for the whole programme, so that a stage that ships without its successors still pays off.

*Source*: SRC-DOC001 (Mike Clay) - §11 Delivery stages

**REQ-NF030: The declared stage dependencies SHALL be honoured: server-side answering follows correct-and-widen; position and repetition follow write authority; the runner follows binding resolution, write authority, and position.**

*Status*: *pending*

*Rationale*: Until a step's outputs land when the step finishes, most conditions cannot be decided by anyone but the agent that produced them, and the fidelity argument has no purchase. Write authority is the load-bearing stage, and binding resolution is independent of it.

*Source*: SRC-DOC001 (Mike Clay) - §11 Delivery stages

**REQ-NF031: The binding-resolution migration SHALL land before the runner, as its own change with a guard.**

*Status*: *pending*

*Rationale*: Doing it first means the runner never infers. Doing it later would mean shipping a component whose argument is that it removes guessing, with a near coin-flip heuristic on 85% of its inputs.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), §11 Delivery stages

**REQ-NF032: The named-routine work SHALL land before the runner.**

*Status*: *pending*

*Rationale*: It isolates risk by validating a new definition construct against a stable execution path rather than one changing underneath it, it pays off alone by retiring the shared-checkpoint mechanism, and it discharges part of the inline-invocation dependency the runner would otherwise solve in flight.

*Source*: SRC-DOC001 (Mike Clay) - §11 Where the routine work sits

**REQ-NF033: The cost of one agent exchange and the cost of establishing a fresh agent context SHALL be re-measured before the delivery grain is built against them.**

*Status*: *pending*

*Rationale*: Both figures rest on a single unreviewed pass, the independent review having been cut short when an account spending limit was reached. They are the two numbers that decide how much work is handed over at a time, and REQ-NF024 and REQ-NF025 rest on them.

*Source*: SRC-DOC001 (Mike Clay) - cost-model.md, investigation.md

**REQ-NF034: The gate census and the loop denominators SHALL be re-measured before either is quoted again.**

*Status*: *pending*

*Rationale*: The census of 500 condition sites does not reproduce — an independent parse of 122 activity files gives 382 — and the ordering split derived from it inherits the defect. Loop counts have three defensible denominators depending on whether occurrences, reachable sites, or distinct definitions are counted.

*Source*: SRC-DOC001 (Mike Clay) - protocol-verification.md

**REQ-NF035: The two collectors that disagree about inequality SHALL be reconciled before the missing-value rule lands.**

*Status*: *pending*

*Rationale*: Absence is how the corpus spells "not in that mode", and one of the two collectors deliberately excludes it while the other does not. REQ-F034 cannot be implemented consistently until they agree.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (settled), protocol-verification.md

**REQ-NF038: The open question over where a repeat-until loop keeps its continuation condition SHALL be settled before the correct-and-widen stage lands.**

*Status*: *pending*

*Rationale*: All 19 repeat-until loops carry a structured condition the schema describes as an entry gate, and the open question proposes the unused early-exit field as its home — which would make REQ-F048 a rename rather than a removal. Settling it first is what keeps that stage's deletion correct.

*Source*: SRC-DOC001 (Mike Clay) - decisions.md (open question 2), §11 Delivery stages
