# Requirements Analysis Report

## Source

- **Source ID**: SRC-DOC001
- **Source Type**: document
- **Title**: Runner — proposal
- **Attribution**: Mike Clay
- **Source Path**: `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-08-28-runner-execution-protocol/README.md`
- **Analysis Date**: 2026-08-30

The proposal is the design record for [#523](https://github.com/m2ux/workflow-server/issues/523). Five
companion records sit alongside it and are consulted as supporting evidence: `decisions.md` (seven
settled decisions, three open questions), `investigation.md` (current-state measurement),
`protocol-verification.md` (three reviewed protocol designs and the claims they withdrew),
`cost-model.md` (the measurements fixing delivery grain) and `attestation.md` (why the runner carries no
signature). Where `protocol-verification.md` and the proposal disagree, the proposal itself directs that
the verification record governs, and this analysis follows that instruction.

The target specification does not exist, so every requirement below is new and the full
specification-protocol structure is instantiated.

## Requirements Changes

### New Requirements

#### Section 3 — Use Case Definition

The proposal's nine use cases and its user stories supply the success criteria.

| ID | Criterion | Source section |
|----|-----------|----------------|
| SUCCESS-001 | A question reaches the person only where the structure does not already determine the answer, and costs no fresh agent context to ask | §3 UC1, §4 user stories |
| SUCCESS-002 | The step a run is currently on is visible, so progress is distinguishable from a stall | §3 UC2, §4 |
| SUCCESS-003 | An interrupted run continues from the step it stopped on, so a lost agent context costs one step rather than one activity and no question is asked twice | §3 UC3, §4, §9 Resuming after interruption |
| SUCCESS-004 | Per-activity cost accounting continues to work unchanged | §3 UC4, §4 |
| SUCCESS-005 | A run is evidence about the definition rather than about the agent that read it: the same definitions and the same answers produce the same sequence of prompts | §3 UC5, §4, §8.2 |
| SUCCESS-006 | A wrong reference or an unparseable condition fails when the definitions load, not mid-run | §3 UC6, §4 |
| SUCCESS-007 | A run of steps is reusable without being copied | §3 UC7, §4 |
| SUCCESS-008 | Work runs concurrently only where something has established it is independent | §3 UC8, §4 |
| SUCCESS-009 | A worker is given one job and a contract that makes "done" checkable rather than a matter of opinion | §3 UC9, §4 |

#### Section 4 — Functional Requirements

**4.1 Structure Execution** — the runner's walk (`P0`)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F001 | The runner SHALL walk the resolved activity tree and execute each unit in the order the tree declares | Order becomes the runner's walk, so there is no self-report to compare against and declared order becomes unrepresentable to violate | §5.4, §8.3, §9 |
| REQ-F002 | The runner SHALL evaluate each unit's condition against the values it holds at that unit, and SHALL skip a unit whose condition is false | A verdict computed when the activity opens is stale by its second step; the step is the only point the answer is correct | §9, §8.3, decisions |
| REQ-F003 | The runner SHALL drive loop repetition and SHALL hold the iteration count against the loop's declared limit | Iteration is today executed and bounded entirely by the agent, and no code anywhere carries out a declared repetition | §5.4, §8.3 |
| REQ-F004 | The runner SHALL resolve every declared input of a unit to a value before dispatching it, and SHALL refuse the unit when a required input resolves to nothing | An unresolved input currently reaches an agent annotated as unresolved and the agent improvises | §8.3, §9 lifecycle |
| REQ-F005 | The runner SHALL record its position durably per step, with a frame per loop | Position cannot be recovered from the session or the history today, so it must be added rather than derived | §11 stage 5, §9 |
| REQ-F006 | The runner SHALL treat a report for a position already recorded as a no-op or a refusal rather than a second execution | Position is authoritative, which moves repeat-call detection from detected to refused | §8.3 |
| REQ-F007 | The runner SHALL resume an interrupted run at the next unexecuted unit rather than at the start of the activity | Replay shrinks back to genuine re-entry and an already-answered decision is never re-reached | §9 Resuming after interruption |
| REQ-F008 | The runner SHALL evaluate an activity's declared exits and select the destination activity | The edge that routes control onward is control the runner owns | §9, §5.5 |
| REQ-F009 | The runner SHALL execute an action unit directly, without composing a prompt for it | *Reasonably implied.* An action unit has no technique body, so there is nothing for the prompt builder to build | §6 contracts, §5.4 |

**4.2 Prompt Composition and Worker Dispatch** (`P0`)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F010 | The runner SHALL compose each work unit's prompt from the technique body, the resolved input values, and the outputs the unit declares | The line between runner and worker is the technique's declared signature: structure above it, prose below it | §5.2, §5.4, §6 |
| REQ-F011 | A composed prompt SHALL be a pure function of the definitions and the resolved input values, independent of which agent asks, when it asks, and what it holds in context | This is what makes a prompt comparable between runs at all | §8.2 |
| REQ-F012 | The runner SHALL make a composed prompt fingerprintable, so a divergence between two runs is detectable rather than invisible | Follows from REQ-F011 and is what turns "the same questions were asked" into a checkable claim | §8.2, §8.3 |
| REQ-F013 | The runner SHALL return a composed prompt to the host agent for spawning, and SHALL NOT spawn a worker itself | Spawning is a tool in an agent's tool list, not an interface a program can call | §5.2, §10 |
| REQ-F014 | The runner SHALL request continuation of an open worker context where one exists, and a fresh context only where none does | A fresh context per technique step would multiply the largest cost in the system fivefold | §5.2, cost-model |
| REQ-F015 | The runner SHALL accept a worker reply in exactly one of three shapes: `done`, `decide`, or `dispatch` | Two things in the corpus have nowhere to go under a values-only reply | §6 |
| REQ-F016 | The runner SHALL check a `done` reply against the unit's declared output identifiers, remap destinations and declared types, and SHALL reject a reply whose shape disagrees | A step's report is today one free-text string checked for non-emptiness, with nothing joining a declared output to a session gain | §8.3, §9 lifecycle |
| REQ-F017 | The runner SHALL accept a `dispatch` reply carrying worker briefs and a concurrency limit, and SHALL dispatch those briefs | The corpus composes its own fan-out prompts at 22 sites across 8 activity files, each from domain material no runner could derive | §6, §9 Fan-out, §10 |
| REQ-F018 | A brief composed at run time SHALL be a structured prompt carrying the same checks as a runner-composed prompt, rather than an opaque relayed string | The brief-composing sites are also the widest fan-outs, so relaying untouched text would leave the largest dispatches outside every guarantee | decisions (settled) |
| REQ-F019 | The runner SHALL gather fan-out results into one array under one declared name in a single call | No value-path reader in the system handles brackets, so a per-iteration indexed name is not expressible | §9 Fan-out |
| REQ-F020 | The runner SHALL accept a `decide` reply raising a decision the definition did not anticipate, and SHALL route it through the decision channel | Work admitted part-way through a run needs somewhere to go | §4 user stories, §6 |

**4.3 Decisions and the Person** (`P0`)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F021 | The runner SHALL mark a decision outstanding on the server and wait, and SHALL NOT present a question to the person | Presentation is a front end's concern; the runner stays headless | §5.3, §9 |
| REQ-F022 | The server SHALL render the question, its options, and their resolved consequences | The server already holds exactly one outstanding decision and already renders it | §5.3, §9 |
| REQ-F023 | The host agent SHALL carry the rendered question to the person and return one option identifier from the closed option set | What the mediating agent can fabricate shrinks from everything about the decision to which of *n* fixed options a person chose | §5.3 |
| REQ-F024 | The decision channel SHALL be implemented as an interface with a single agent-relayed implementation, rather than as inline calls | It costs nothing now and is what lets the channel be replaced later without touching anything else | §5.3 |
| REQ-F025 | The server SHALL verify a dismissed conditional decision against the session values rather than accept the reporting agent's claim | Dismissal honesty moves from convention — which relies on agent honesty — to refused | §8.3, §11 stage 2 |
| REQ-F026 | A decision unit SHALL be handled without establishing a worker context | Asking a question becomes a turn in a context that already exists rather than the cost of a whole context | §9 |
| REQ-F027 | The existing minimum response interval and auto-advance timers SHALL continue to apply to a relayed decision | Stated as surviving the change | §5.3 |
| REQ-F028 | The system SHALL hold at most one outstanding decision per session | One decision slot exists; two fan-out members cannot both escalate without a keyed map | §10 |

**4.4 Server Reproduction and Write Authority** (`P0`)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F029 | The server SHALL reproduce every transition the runner reports and SHALL refuse any it cannot independently arrive at | This replaces caller identity as the basis of acceptance, and is the whole of the fidelity argument | §1, §5.4, attestation |
| REQ-F030 | A step's declared outputs SHALL be applied to the session and written when the step finishes | More than half of all conditions read a value an earlier step of the same activity produced; without this the runner can decide only the minority | decisions (settled), §11 stage 4 |
| REQ-F031 | The server SHALL derive the set of names a step may write and SHALL reject a produced value falling outside it | Makes a step's write authority a server verdict rather than an agent claim | §6, §11 stage 4 |
| REQ-F032 | The server SHALL return, for each reported unit, the accepted names, the rejected names each with a reason, and the resulting values delta | The runner maintains its own values and needs the authoritative delta to stay aligned | §6 |
| REQ-F033 | The server SHALL send condition expressions rather than condition verdicts | A verdict computed at activity open is stale by the second step, which is the problem being solved | decisions (settled), §7 |
| REQ-F034 | A missing value SHALL fail a positive test loudly, while absence retains its meaning for negative and presence tests | The corpus deliberately spells "not in that mode" as a value nobody set, so the rule applies to positive reads only | decisions (settled) |
| REQ-F035 | The server SHALL compute an activity's ending and reconcile it against the one reported | Branch truth moves from convention to refused | §11 stage 2, §8.3 |

**4.5 Artifacts** (`P0`)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F036 | The runner SHALL write a declared artifact under its declared name and placement, taking only the content from the worker | Removes 45 invocations, one technique file, and the whole class of defect where an agent writes under the wrong name; also halves document traffic | decisions (settled), §8.3 |
| REQ-F037 | A technique declaring an artifact SHALL state where its output belongs | The declaration is what the runner writes from | decisions (settled) |

**4.6 Definition Loading and Validation** (`P0` unless noted)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F038 | The loader SHALL fail the load when a condition does not parse | The corpus is at zero failures, so this is free now and dearer later | §11 stage 1, §8.3 |
| REQ-F039 | The loader SHALL verify that every value a step reads has a producer positioned before it, at step granularity | Possible only once step order is authoritative; localises a mistake to the step rather than the activity | §8.3, §4 user stories |
| REQ-F040 | The runner SHALL receive the activity structure as a resolved tree of data, and SHALL hold no parser, no file access, and no knowledge of the source notation | This is what keeps a later change of source language confined to the loader | §7, §10 |
| REQ-F041 | Condition expressions SHALL travel as structured trees rather than as strings | A language emitting typed expressions natively then needs no adapter | §7 |
| REQ-F042 | The loader SHALL resolve every ambiguity arising from the source notation, so the runner never meets one | Anything undecidable only because of how the source is written belongs on the loader's side of the boundary | §7 |
| REQ-F043 | Nothing positional SHALL survive into the resolved tree; where order carries meaning it SHALL be explicit in the tree | Document order is a property of a text file | §7 |
| REQ-F044 | A bare supplied binding value SHALL always be a literal, and a reference SHALL always be braced | 85% of technique input bindings are bare strings and undecidable — near a coin flip between the two readings | decisions (settled), §11 stage 3 |
| REQ-F045 | The two placeholder token grammars SHALL be unified on the dotted form | Closes an existing silent fault where 17 dotted placeholders report as resolved while naming no producer | decisions (settled), §11 stage 3 |
| REQ-F046 | A step identifier SHALL be unique within its activity, enforced by one check for the whole activity | The corpus has zero duplicates across 131 activities, so this is a permission nobody uses; it keeps step lookup correct rather than lucky | §7, protocol-verification |
| REQ-F047 | The condition guard SHALL cover activity endings, nested directories, and validation targets (`P1`) | Widening an existing guard to the surfaces it currently misses | §11 stage 1 |
| REQ-F048 | The unused early-exit condition field SHALL be removed (`P1`) | Stated as part of the correct-and-widen stage. See quality issue QI-002 — an open question proposes repurposing this field instead | §11 stage 1 |

**4.7 Concurrency** (`P1`)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F049 | Work SHALL run concurrently only where the definition declares it independent | Concurrency becomes a property of the definition rather than a hope | §4 user stories, §8.3 |
| REQ-F050 | Independence SHALL NOT be derived from comparing which values adjacent steps read and write | That test wrongly clears 231 adjacent step pairs whose real dependency is shared state on disk that no definition declares | §8.3, protocol-verification |

**4.8 Progress, Commits and Accounting** (`P0`)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F051 | Committing and writing the progress table SHALL remain agent work, dispatched as ordinary units at each activity boundary | A commit message and a progress summary are prose a person reads; keeping them as techniques holds the line that the runner never composes text | decisions (settled) |
| REQ-F052 | The runner SHALL hold no repository access | Follows from REQ-F051 and keeps version control outside the runner entirely | decisions (settled) |
| REQ-F053 | Usage SHALL continue to be recorded per activity | Existing accounting keeps working; a per-step figure is unreachable because a step inside a live context has no harness-reported figure | §4 user stories, cost-model |
| REQ-F054 | A hand-off SHALL remain aligned to an activity boundary | A hand-off crossing an activity boundary breaks the required activity name, the no-usage reconciliation, and the per-activity elapsed spans at once | cost-model |
| REQ-F055 | The step a run is currently executing SHALL be observable | Lets a person tell progress from a stall | §4 user stories |

**4.9 The Orchestration Workflow** (`P0`)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F056 | Session discovery, initialisation, target resolution, and close-out SHALL remain ordinary activities the runner executes with techniques dispatched to agents | They are real work with side effects, not loop control | decisions (settled), §5.5 |
| REQ-F057 | The client-dispatch activity SHALL be removed | That activity is the orchestrator loop the runner becomes, so it is deleted rather than left unreachable | decisions (settled), §5.5 |
| REQ-F058 | The bootstrap SHALL direct an agent to the runner rather than to a procedure to follow | The procedure it currently describes becomes code | decisions (settled) |
| REQ-F059 | The guard keeping the bootstrap procedure self-contained SHALL be removed | It protects a procedure that no longer exists | decisions (settled) |
| REQ-F060 | The conduct rules written for an orchestrator, and the worker rule forbidding calls to the control-plane tools, SHALL be removed | They are guidance for decisions no agent makes any more, and a prohibition on access a worker no longer has | §5.5 |
| REQ-F061 | The rule forbidding an activity from opening with a decision SHALL be removed | That rule exists because asking a question currently costs a whole worker context | §9 |
| REQ-F062 | The step manifest SHALL be removed | The runner hands out each unit and receives each reply, so there is no self-report to validate | §8.3 |

**4.10 Inline Technique References** (`P0`)

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-F063 | An instruction inside a technique's protocol to apply another technique SHALL have a resolved delivery path — either resolved into the prompt as a closure with a declared depth and cycle policy, or converted into a step in the structure | A worker under the runner has no server access, so it reaches such an instruction with nothing to apply and improvises the invocation | §11.1 |
| REQ-F064 | A census of the inline technique references by kind SHALL be completed before the runner stage begins | The breakdown decides how much converts to steps and therefore how much closure resolution the runner still needs | §11.1 |

#### Section 5 — Non-Functional Requirements

**5.1 Fidelity and Isolation**

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-NF001 | The workflow structure SHALL NOT be delivered to a worker | An agent that never receives the structure cannot depart from it; this is the central contribution, and it removes the ability to misreport rather than checking for it | §1, §8.3 |
| REQ-NF002 | A worker SHALL hold no position, no server access, and no memory of the run | The arrangement stops being a delegation chain of stateful actors and becomes a program with stateless calls | §5.5 |
| REQ-NF003 | A worker SHALL receive one technique per turn — its protocol prose, its rules, and the values it needs | So it can do the work without interpreting a structure | §2, §4 user stories, §5.4 |
| REQ-NF004 | A worker context SHALL span an activity or more | Establishing a fresh context is the dominant cost, and the corpus already distinguishes spawning from continuing | §2, §5.2 |
| REQ-NF005 | The host agent SHALL decide nothing, compose nothing, and track nothing, relaying only what it did not compose and cannot alter | It is a proxy rather than a tier | §2, §5.2, §5.4 |
| REQ-NF006 | The runner SHALL be headless, holding no channel to the person | Presentation is a front end's concern | §5.3 |
| REQ-NF007 | The runner SHALL NOT parse a technique's protocol prose | 436 of the corpus's 2,459 protocol bullets carry control flow of their own, so a call is all-or-nothing | §10 |
| REQ-NF008 | A technique SHALL be re-executed from its start rather than resumed part-way | The runner establishes that a technique ran and returned what it declared, never which branch it took inside | §8.3, §10 |
| REQ-NF009 | The runner SHALL NOT compose text that a person reads | Holds the line that keeps commit messages and progress summaries with agents | decisions (settled) |
| REQ-NF010 | The runner SHALL NOT carry out a validation instruction requiring host privileges | Validation instructions ask the host whether a tool is authenticated or a key is available. See quality issue QI-001 — the mechanism is unresolved | §10 |

**5.2 Trust Model**

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-NF011 | The runner SHALL carry no embedded signing key, and the server SHALL accept a transition because it independently arrives at the same one rather than because the caller proves its identity | A key inside a program the reader controls is a key the reader can take, and a signature says who made something, not what was run. A substitute producing correct transitions becomes equally acceptable | attestation |
| REQ-NF012 | The runner SHALL be published as an installable package rather than delivered down the tool channel | Tool responses are text, and the agent's conversation is the most expensive place in the system to put bytes | attestation |

**5.3 Layering and Evolution**

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-NF013 | The resolved tree SHALL be the stable contract between loader and runner, so a change of source notation touches the loader alone | This is the whole of what makes a later change of definition language cheap | §7 |
| REQ-NF014 | The design SHALL carry no compatibility obligation toward a later typed definition language — no dual-format support, no migration path | Stated explicitly as a non-obligation | §7 |
| REQ-NF015 | The runner SHALL constitute the operational semantics of the workflow mechanics as one executable definition | Those answers are today distributed across prose, a test harness, and the reading habits of agents | §7 |

**5.4 Delivery and Content**

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-NF016 | The runner-to-server link MAY be as chatty as required; the runner-to-worker link SHALL stay coarse and carry prose | The two working links have opposite grains, and that asymmetry is the whole design | §5.1, cost-model |
| REQ-NF017 | Technique body composition SHALL exclude provenance decoration, so a composed body is a pure function of the definitions | The decoration differs by document position, so the same technique bound at two positions currently hashes differently and is delivered twice | §8.2, protocol-verification |
| REQ-NF018 | The record of already-sent content SHALL key on the stripped body | Follows from REQ-NF017 and fixes an existing waste | §8.2 |
| REQ-NF019 | A delivery SHALL NOT carry rules or techniques whose only subject is how to drive a workflow | Roughly 33,000 characters of every hand-off exist only to tell an agent how to interpret a structure | §1, §8.1, attestation |

**5.5 Session Integrity**

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-NF020 | The runner SHALL serialise its reports to the server | The store is last-writer-wins, and at per-step reporting the concurrent-write window becomes normal traffic rather than an edge case | protocol-verification |
| REQ-NF021 | The unit-reporting call SHALL reload the session before saving | Delivery already does this; the activity transition does not | protocol-verification |
| REQ-NF022 | A session whose position record is missing SHALL be refused outright, with a documented way back | The session schema quietly drops what it does not declare, and the resulting mismatch is reported as suspected tampering rather than a version difference | investigation |
| REQ-NF023 | Documentation asserting that the server never evaluates a condition SHALL be corrected | The server already evaluates every step's gate when it delivers an activity; the documentation is out of date whether or not the runner is built | §11 stage 1, investigation |

#### Section 6 — Performance Requirements

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-NF024 | A single delivery to a worker SHALL carry at least four steps' worth of content | One exchange costs about what 18,800 characters of new material costs; the average composed technique is 5,275 characters, so one step per exchange loses roughly 3.6 to 1 | cost-model, §8.1 |
| REQ-NF025 | The delivery unit SHALL be the unbroken run of steps from the current position to the first condition that cannot yet be answered | This is where the saving is: 23 exchanges observed and 84 in principle, worth 108,000 to 395,000 tokens | cost-model, §8.1 |
| REQ-NF026 | A worker's reply SHALL travel with its next request rather than in a separate call | A separate reporting call doubles the exchange count again | cost-model |
| REQ-NF027 | The session store SHALL gain an index or a cache before per-step writes land | Roughly 1,085 writes per run instead of 79, against a store that currently reads and parses every session file on every call. This is a prerequisite, not a follow-up | decisions (settled), cost-model |
| REQ-NF028 | Continuous integration SHALL price an exchange, not bytes alone | None of the four existing benchmarks prices an exchange, so a first experiment with one-step delivery would appear to succeed | cost-model |

#### Section 7 — Project and Process Requirements

| ID | Statement | Rationale | Source section |
|----|-----------|-----------|----------------|
| REQ-NF029 | Delivery SHALL proceed in stages, each useful alone and assuming nothing after it | Stated as the delivery discipline for the whole programme | §11 |
| REQ-NF030 | The declared stage dependencies SHALL be honoured: server-side answering follows correct-and-widen; position and repetition follow write authority; the runner follows binding resolution, write authority, and position | Until a step's outputs land when the step finishes, most conditions cannot be decided by anyone but the agent that produced them, and the fidelity argument has no purchase | §11 |
| REQ-NF031 | The binding-resolution migration SHALL land before the runner, as its own change with a guard | Shipping a component whose argument is that it removes guessing, while it guesses on 85% of its inputs, defeats the argument | decisions (settled), §11 stage 3 |
| REQ-NF032 | The named-routine work SHALL land before the runner | It isolates risk against a stable execution path, pays off alone by retiring the shared-checkpoint mechanism, and discharges part of the inline-invocation dependency | §11.2 |
| REQ-NF033 | The cost of one agent exchange and the cost of establishing a fresh agent context SHALL be re-measured before the delivery grain is built against them | Both rest on a single unreviewed pass, and they are the two figures that decide how much work is handed over at a time | cost-model, investigation |
| REQ-NF034 | The gate census and the loop denominators SHALL be re-measured before either is quoted again | The 500-site figure does not reproduce, and the ordering split derived from it inherits the defect | protocol-verification |
| REQ-NF035 | The two collectors that disagree about inequality SHALL be reconciled before the missing-value rule lands | Absence is how the corpus spells "not in that mode", and one collector deliberately excludes it | decisions (settled) |

### Updated Requirements

None. The target specification does not exist, so there is no prior requirement to modify.

### Deprecated Requirements

None. No prior specification exists to retire requirements from.

## Source Coverage Matrix

| Source section | Normative? | Covered by |
|----------------|-----------|------------|
| §1 Executive summary | yes | REQ-NF001, REQ-NF019, REQ-F029, REQ-F011, SUCCESS-005 |
| §2 The participants | yes | REQ-NF003, REQ-NF004, REQ-NF005, REQ-NF006, REQ-F013, REQ-F021, REQ-F029 |
| §3 Use cases | yes | SUCCESS-001 – SUCCESS-009 |
| §4 User stories | yes | SUCCESS-001 – SUCCESS-009, REQ-F007, REQ-F020, REQ-F038, REQ-F039, REQ-F049, REQ-F053, REQ-F055, REQ-NF003 |
| §5 Architecture — Container view | yes | REQ-NF016, REQ-F013, REQ-F021 |
| §5.2 What the runner is, and who spawns a worker | yes | REQ-F013, REQ-F014, REQ-F010, REQ-NF004, REQ-NF005 |
| §5.3 How a decision reaches a person | yes | REQ-F021 – REQ-F024, REQ-F027, REQ-NF006 |
| §5.4 Where each responsibility sits | yes | REQ-F001 – REQ-F008, REQ-F010, REQ-F029, REQ-NF003, REQ-NF005 |
| §5.5 What becomes of the agent hierarchy | yes | REQ-F056 – REQ-F060, REQ-NF002, REQ-NF005 |
| §6 The contracts | yes | REQ-F009, REQ-F015 – REQ-F020, REQ-F031, REQ-F032 |
| §7 Designed for a later formal language | yes | REQ-F040 – REQ-F043, REQ-F046, REQ-NF013 – REQ-NF015, REQ-F033 |
| §8.1 Efficiency | yes | REQ-NF019, REQ-NF024, REQ-NF025 |
| §8.2 Determinism | yes | REQ-F011, REQ-F012, REQ-NF017, REQ-NF018, SUCCESS-005 |
| §8.2 The further uplift deliberately not proposed | no | out of scope — named as a separate corpus migration |
| §8.3 Fidelity — enforcement ladder | yes | REQ-NF001 (frames the strength every guarantee below is stated at) |
| §8.3 Guarantees that get stronger | yes | REQ-F001, REQ-F002, REQ-F003, REQ-F006, REQ-F016, REQ-F025, REQ-F029, REQ-F035, REQ-F062 |
| §8.3 Guarantees that are newly possible | yes | REQ-F004, REQ-F012, REQ-F016, REQ-F036, REQ-F038, REQ-F039, REQ-F049, REQ-F050 |
| §8.3 How far shape checking reaches | no | out of scope — widening output declarations is corpus work needing nothing from this proposal; recorded in Implementation Notes |
| §8.3 What stays unenforceable, honestly | yes | REQ-NF007, REQ-NF008 (the two that constrain the design); the third is a statement of limits |
| §9 Executing a run of steps | yes | REQ-F001, REQ-F002, REQ-F008, REQ-F010, REQ-F029, REQ-F032 |
| §9 A decision that reaches the user | yes | REQ-F021 – REQ-F023, REQ-F026, REQ-F061 |
| §9 Fan-out, where the agent composes the briefs | yes | REQ-F017, REQ-F019 |
| §9 Resuming after interruption | yes | REQ-F005, REQ-F007, SUCCESS-003 |
| §9 The lifecycle of one unit | yes | REQ-F002, REQ-F004, REQ-F016, REQ-F029 |
| §10 What the runner is not allowed to do | yes | REQ-NF007, REQ-F013, REQ-F017, REQ-F028, REQ-NF025, REQ-NF010, REQ-F040 |
| §11 Delivery stages | yes | REQ-NF029, REQ-NF030, REQ-F038, REQ-F047, REQ-F048, REQ-F025, REQ-F035, REQ-F044, REQ-F045, REQ-F030, REQ-F005, REQ-F003, REQ-NF023, REQ-NF027 |
| §11 Delivery stage 7 — the runner as host | no | out of scope — explicitly a later layer; its one in-scope consequence is REQ-F024 |
| §11.1 One dependency before stage 6 | yes | REQ-F063, REQ-F064 |
| §11.2 Where the routine work sits | yes | REQ-NF032 |
| §12 Future features | no | out of scope — a scope boundary, recorded in Implementation Notes |
| §12.1 The runner as host | no | out of scope — later layer; REQ-F024 preserves the seam it needs |
| §13 Decisions | yes | REQ-F018, REQ-F030, REQ-F033, REQ-F034, REQ-F036, REQ-F037, REQ-F044, REQ-F045, REQ-F051, REQ-F052, REQ-F056 – REQ-F059, REQ-NF027, REQ-NF031, REQ-NF035 |
| §14 Companion records | no | a document index; carries no obligation |

Every section carrying an obligation maps to at least one requirement. No coverage gap remains.

## Document Updates Required

1. **Create** `docs/runner-execution-protocol-requirements.md` with the full seven-section
   specification-protocol structure.
2. **Section 2.5 Reference Documents** — add the source listing:
   `**SRC-DOC001**: [Runner — proposal](../.engineering/artifacts/planning/2026-08-28-runner-execution-protocol/README.md) — Mike Clay`
3. **Section 2.4 Source Reference Format** — instantiate the standard format block; every requirement in
   this specification cites `*Source*: SRC-DOC001 (Mike Clay)` with the originating section named.
4. **Sections 2.1, 2.2 and 2.3** — instantiate as headed sections recording that no product or solution
   document, no meeting transcript, and no vendor document contributes to this specification.
5. **Section 3 Use Case Definition** — populate from §3 and §4 of the source: primary use case (executing
   a workflow definition so that what ran is what was written), the four personas the source names (user,
   definition author, worker, host agent), the user journey drawn by the key flows, and SUCCESS-001
   through SUCCESS-009.
6. **Sections 4 through 7** — instantiate with the requirement entries listed above, each in the
   four-part format, each with status `pending`.

## Quality Issues Identified

- **QI-001 — Unresolved: who carries out a validation instruction.** The source lists "take on the
  environment" among the things the runner may not do, and then states that whether the runner shells out
  to the host or delegates to an agent is unresolved. REQ-NF010 records the prohibition; the mechanism
  needs settling before that requirement can be implemented. The verification record notes this reason
  does not favour the runner either way.
- **QI-002 — Conflict over the early-exit field.** Delivery stage 1 calls for the unused early-exit field
  to be deleted. Open question 2 of the decision record proposes that same field is the right shape to
  hold a repeat-until loop's continuation condition, making it a rename rather than a deletion. REQ-F048
  states the deletion as written, but the two cannot both hold; the open question should be resolved
  before stage 1 lands.
- **QI-003 — Conflicting counts for inline technique references.** The source says 137 references across
  75 files; the verification record says 131 across 68 files. REQ-F063 and REQ-F064 are stated without a
  count for that reason. The census REQ-F064 requires should settle the figure.
- **QI-004 — Three questions are open and unresolved.** Whether equality coerces numerically or the write
  path enforces the declared type, affecting 81 equality comparisons; where a repeat-until loop keeps its
  continuation condition (see QI-002); and whether value-setting actions are re-authored as technique
  outputs, of which only 28 of 84 carry a value a program could apply. None blocks the requirements above,
  but each leaves an implementation decision unmade.
- **QI-005 — Withdrawn figures survive in the source.** The proposal's efficiency and determinism
  arguments quote a gate census of 500 sites that does not reproduce; the measured figure is 382. No
  requirement depends on the number, and REQ-NF034 requires re-measurement, but the source text should be
  corrected so a later reader does not re-quote it.
- **QI-006 — Two cost figures rest on an unreviewed pass.** The cost of one exchange and the cost of a
  fresh context both come from an investigation cut short by a spending limit, and they are the two
  figures fixing the delivery grain in REQ-NF024 and REQ-NF025. REQ-NF033 requires re-measurement before
  building against them.
- **QI-007 — Action units are underspecified.** The source's contract diagram does not include an action
  unit, though the verification record's unit type does, and 179 action steps exist in the loaded corpus
  with no technique body to compose. REQ-F009 is stated as a reasonably-implied requirement and needs
  confirmation.
- **QI-008 — Write-set width may collide with an existing guard.** Committing a step's outputs when the
  step finishes writes intermediates that a session-contract guard raises a finding against, and those
  intermediates are exactly the same-activity readings the design exists to unblock. REQ-F030 and REQ-F031
  are stated without resolving whether the declarations widen, a scratch namespace appears, or the guard
  changes its basis.

## Implementation Notes

- **Priority tags.** `P0` marks what the runner cannot exist without; `P1` marks the corrections and
  widenings that pay off alone and are sequenced first but do not gate the runner. Section 4 subsection
  headings carry the tag rather than each entry, matching how the protocol groups functional requirements
  into domain subsections with priority tags.
- **Scope boundaries.** Four capabilities are unlocked by this work and explicitly excluded from it:
  the runner as host, migrating mechanical content out of technique prose, qualifying returned content
  against its declaration, and a typed language for activity mechanics. They are not requirements. One
  design consequence of the first is in scope and is captured as REQ-F024 — building the decision channel
  as a replaceable interface.
- **The declaration lever.** Only 11% of the corpus's 730 declared outputs carry named sub-members, so
  for most outputs REQ-F016 establishes that a value returned under the right name and nothing more.
  Widening those declarations needs nothing from this work and is not stated as a requirement, but it is
  what determines how much REQ-F016 actually settles.
- **Statuses.** Every requirement is created with status `pending`. Moving any of them away from
  `pending` needs explicit confirmation during requirements review.
- **Numbering.** Identifiers are assigned contiguously from `REQ-F001`, `REQ-NF001` and `SUCCESS-001`
  because the specification is new. Performance requirements in section 6 and project requirements in
  section 7 take `REQ-NF###` identifiers, the protocol defining no separate category for either.
- **Precedence within the source.** Where the proposal and the verification record disagree, the
  verification record governs, on the proposal's own instruction. Requirements derived from a settled
  decision are marked `decisions (settled)` in the source column and take precedence over any softer
  statement of the same matter in the proposal body.
