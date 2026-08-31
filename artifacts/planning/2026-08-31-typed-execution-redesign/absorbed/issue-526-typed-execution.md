## Summary

A workflow definition describes a structure: an ordered list of steps, gates deciding whether each one runs, loops repeating a body, and named outcomes deciding where control goes next. Today a language model reads that structure and carries it out, guided by prose the server ships alongside the definitions, and the server grades what the model reports back. Everything mechanical about a run — walking the steps, deciding the gates, driving the loops, choosing the next activity — is done by reading rather than by executing.

That one arrangement produces most of what is on this tracker. Because the model drives, roughly 33,000 characters of every dispatch teach it how to drive. Because it reports rather than executes, the strongest claim available about a finished run is that an agent said it did the right things. And because the definition language cannot state the rules its own definitions must obey, those rules live outside it: 33 checking scripts totalling 6,471 lines, 148 catalogued anti-patterns, and 34 design principles, none of which can run where a definition changes.

This epic proposes the alternative. The mechanical work moves to a program. The definitions become a checked language, so a rule about them is something a build can fail on rather than something a script has to remember. And the content the model actually needs — the prose describing how to exercise judgement — stays exactly as it is. This epic covers one work item per stage.

## The three gaps

**What a run proves is a report, not a record.** Seven enforcement layers sit around a transition, of which two refuse the call and five record a warning. Both hard gates protect the server's own bookkeeping — the seal over the state file, and the rule that a run may not advance past an unanswered question. Everything about the work itself is graded from what the agent says: the step manifest records that it claimed to run each step, the activity manifest what it claimed to complete, the reported outcome what it claimed to reach. The fidelity document's own limitations section concedes the consequence in three places — step execution is not provable, condition truth is not verified, and human presence at a gate cannot be shown. The three-second minimum on answering a gate is the shape of the problem in miniature: it exists because the agent owns the channel to the person, so the cheapest forgery has to be raised by a timer rather than ruled out.

**Most of what a dispatch carries teaches the reader to be an interpreter.** Roughly 33,000 characters per dispatch are protocol rules and worker mechanics — how to walk a step, how to evaluate a gate, how to report a manifest, how to choose between two delivery forms. A substantial apparatus has grown to ration that payload, and it works: content is hashed, each agent context keeps a ledger of what it has received, a repeat arrives as a short marker, small step contents are sent eagerly against a character budget, and a run of activities is bounded by two limits and three exemptions. What it rations is largely instructions for a job a program would do without being told. The residue is measurable: 16,453 characters byte-identical inside one response, 67,772 characters re-sent across one run, and 38.4% of a resumed delivery consisting of the activity body, which is the one part that cannot collapse.

**The rules the definitions must obey have no home in the definitions.** Of fifteen rules governing how a predicate may be written, ten live in prose, in code comments, or nowhere — a count this tracker already carries. The rest of the semantics is spread across the checking scripts, and reading them together shows what they are. One checks that two declarations of the same variable agree on type, which is type unification. One checks that no step consumes a value no earlier step produces, which is use-before-definition. One checks that a gate never reads a decision made after it, complete with five hand-argued exemptions that each correspond to a standard narrowing or control-flow join. The largest, at 856 lines, checks the whole binding graph. These are not lints. They are the meaning of the language, written outside the language, where nothing forces them to stay true — which is how the recorded judgements about one guard came to sit 249 corpus commits behind the definitions they judge.

## The design

**The mechanical work moves to a program, and the model is called.** A runtime holds the position in the run, decides each gate from the session state, drives iteration, resolves each step's bindings, and works out the next activity. It calls an agent to execute a technique — whose body is prose and stays prose — and it calls a person to answer a decision. The server accepts a transition because it independently recomputes the same one, never because a caller claims it.

**A step's outputs land when the step finishes.** Today a step's results reach the session when its whole activity ends, so the majority of gates — those reading a value an earlier step of the same activity produced — cannot be decided by anything but the agent. Across 79 activity deliveries in the committed baseline, the server logs 313 gates it cannot answer and not one delivery answers all of its own. Moving the write to step completion is what makes the runtime able to decide them, and it is the load-bearing decision: everything else is downstream of it.

**The definitions become a language with types.** The bag of session variables becomes a record type; an activity's declared reads and writes become its signature; a technique becomes a function with typed inputs and outputs whose body is prose; a gate becomes an expression checked against the variables it names. The proposal is to embed that language in TypeScript and compile it to a machine-readable intermediate form — a plain data structure the runtime reads, so the language a definition is written in and the engine that runs it stay independent, and an importer for the current definitions is possible without the runtime knowing.

With types in place, whole classes of check stop being checks. Two declarations disagreeing about a variable is a type error. A gate reading a value nothing binds is a type error. The two predicate dialects that currently disagree — 281 predicates written one way, 109 the other, and of thirteen written both ways five returning opposite answers — become one form with one meaning. The three things neither dialect can express today, a presence test, an emptiness test, and a comparison of one variable against another, come for free.

**What a step is permitted to do becomes part of its type.** Alongside its inputs and outputs, a step declares which kinds of effect it may have — reading the repository, writing to it, reaching the network, spawning an agent, asking a person, publishing. An activity's permissions are the union of its steps'; a workflow declares a ceiling; compiling checks that nothing exceeds it. Two live problems become one static property. The private-remediation workflow, whose guarantee is that nothing discloses, declares no permission to publish, and a step that would disclose fails to compile — replacing a 280-line reachability check. And an activity that needs to spawn an agent cannot be given to a context that has no such permission, which is the missing declaration this tracker already asks for, arrived at without adding a field or writing three hand-made exceptions to rules.

**The corpus is compiled once and delivered by hash.** Today a delivery is composed on the spot: the routine that annotates each step with where its inputs come from re-reads essentially every technique file, once per step it inlines, and one observed call walked the catalogue three times. Instead, compile the definitions ahead of any session into a store where every composed technique, every merged rule block and every resource section is addressed by a hash of its own bytes. A delivery is then a list of hashes plus whatever bytes the receiving context does not already hold. Two identical blocks are one hash, a repeat request is a marker, and the activity body collapses like everything else. A further capability comes with it that measurement cannot supply today: the cost of a path can be computed before it is run.

**The session becomes an append-only record.** State is what you get by replaying it. Resuming is replaying to the recorded position, and attaching to a session that already exists is free, because nothing is ever overwritten — which is the fault that today silently rebuilds the run it was asked to continue, measured on a real work package as one completed activity and five history events before, and none and two after, with the same identifier handed back throughout. The record is chained, each entry sealed against the one before, so tampering is visible and a rotated signing key degrades the claim about who wrote an entry without making the content unreadable.

**Fidelity becomes three properties instead of seven layers.** Given the definition version and the recorded sequence of agent returns and human answers, a run replays exactly. Every value carries the step, the technique call and the content that produced it. And the record is chained and tamper-evident. Five graders retire along with the parameters that feed them, and so does the three-second timer, because a runtime that renders a question knows whether it did. What stays genuinely unprovable narrows to two things: the truth of what an agent says it produced, and whether a person was really there.

**What stays exactly as it is.** Technique bodies stay prose — capability, protocol and rules — and nothing here parses them. An activity keeps naming only its own outcomes while the workflow names where each leads, which is what lets one remediation workflow borrow fourteen activities from another without editing files it does not own. Techniques keep declaring their inputs and outputs. Content keeps being resolved when it is needed rather than up front, and a question is still raised at the moment a run reaches it.

## The work

**W1 — Settle when a step's outputs land, and settle the intermediate form.** No code. Two decisions, because both decide what the session record must carry: whether a step's declared outputs enter the variable bag when the step completes, and what shape the machine-readable form takes that both the authoring side and the runtime read. Delivery is a written decision with its reasoning, which is what the rest is built against.

**W2 — The intermediate form, and an importer for the current definitions.** Publish the form and a converter that reads the 122 activity files and 17 workflows as they stand. This proves the corpus survives the pivot before any runtime work starts, and it is what keeps the option of an incremental path open. Acceptance is that every workflow converts and the converted form reproduces the existing walk.

**W3 — One runtime, absorbing the end-to-end walker.** The walker that already exists in the test suite — 895 lines that walk the step tree, evaluate gates, select options and choose outcomes — becomes the runtime, on the runtime side of the boundary. It holds the position with a frame per enclosing loop, decides gates, drives iteration, resolves bindings, derives every transition, and hands an agent a run of steps ending at the first gate it cannot answer. The five graders and the parameters that feed them retire with it, as does the prose that taught an agent to drive. This item carries the runner proposal already on the tracker in full.

**W4 — The session as an append-only record, with setup derived rather than performed.** Replaces the snapshot-and-seal arrangement with a chained record that state is folded from. Attaching to an occupied folder continues the run it finds. Working out which repository a session binds, where its planning folder lives, and creating the session itself all happen in one call from typed code rather than from a forty-eight-line algorithm an agent hand-executes each run — the one that has bound a repository named in a link rather than derived from a checkout, and cost one session 81,762 tokens. Two of the six known hazards survive as real questions and are settled here: a recorded position naming an activity the workflow no longer declares, and a run abandoned at an unanswered gate.

**W5 — A corpus compiled once and delivered by hash.** Composition moves to build time and every piece of deliverable content gets a stable address. A delivery becomes a list of addresses plus the bytes the recipient lacks. Acceptance carries the existing measurements: no byte-identical block appears twice in one response against a worst case of 16,453 characters, a repeated request returns a marker against a baseline of 18 repeats and 67,772 characters in one run, and the activity body collapses against a measured 38.4% share of a resumed delivery.

**W6 — The authoring language, and effects as types.** The embedded language, its checker, and the effect declarations. Each check the guard suite performs is dispositioned: retired because the type system subsumes it, kept because it checks a convention no type expresses, or recorded as declined with the reason. The private-remediation guarantee is restated as a permission ceiling and holds at least as strongly as the 280-line check it replaces.

**W7 — The corpus as a package that checks itself.** The definitions become a package depending on the runtime package, so the tests that exercise what a definition says run where the definition changes. The 16 corpus-reading tests move, the four recorded measurements move with them, and the commit stamps and freshness assertions that exist only to notice a measurement drifting from its subject are refunded rather than rewritten — the drift currently standing at 249 corpus commits.

## Why now is cheap

**Every input already exists and is already shared.** The expression evaluator, the structured-condition evaluator, the outcome-to-destination bindings and the loaders are server code that the guards and the test walker already consume. The transition algorithm is written down twice — once as prose in the orchestrator's own instructions, once as code in the test walker — and the two agree. The walker is 895 lines and passes today.

**The corpus is at its most tractable point.** An independent walk of the 122 activity files through the real loader counts 231 inline gates, 97 structured conditions, 54 outcome gates, 11 gates on other step kinds and one early-exit condition — and every one parses, every one evaluates, none fails an authoring rule, and none names anything outside the session variables. Every collection a loop walks is named by a plain variable and no gate anywhere interpolates. Making an unparseable gate a build failure costs nothing today and costs more every month it waits.

**The measurement apparatus is in place.** Delivery is already counted per step, per technique and per resource; every dispatch records what it cost; and the benchmarks that price a definition change at merge already run on every pull request. The acceptance criteria below are reads against instruments that exist.

**Waiting compounds in a specific way.** Each incremental fix adds mechanism to a substrate that cannot hold the rule the fix states, so the mechanism is maintained separately from the thing it governs. Three separate items on this tracker ask why content is re-sent — a duplicate block inside one response, a repeat fetch answered in full, and an activity body that cannot collapse — and all three have one cause, which is that payloads are composed per request rather than compiled once.

## Scope

The server, a new runtime package, an authoring language and its checker, the session record, and the corpus prose that instructs an agent to drive. The two decisions in W1 are settled before any code, because both decide what the session record must carry.

## Decisions this proposal leaves open

- **Whether the authoring language becomes the source of truth, or a front end over definitions that stay canonical.** The intermediate form makes either workable. The choice decides whether the guard suite retires or merely shrinks.
- **How much of the corpus is translated and how much re-authored.** Mechanical translation preserves behaviour and preserves the accreted prose; re-authoring is where the delivery saving actually lands.
- **Where the pull loop runs.** An agent round trip is measurably cheaper than an orchestrator one, but only a context that can reach a person settles a decision, so a gate forces a hand-off wherever the loop lives.
- **Whether step identifiers become unique across a whole activity, or the recorded position carries a scope path.** Identifiers are unique only within their scope today, and one existing tool already resolves a collision silently to the wrong step.
- **The two exchange rates the delivery grain rests on.** A round trip costing about what 18,800 characters cost, and a fresh context costing 23,000 to 42,000 tokens to establish, are both unreviewed in their source. They want re-measuring before a grain is fixed, and any criterion below that depends on one inherits that condition.

## Acceptance criteria

- [ ] A written decision records whether a step's declared outputs enter the variable bag at step completion, with the evidence behind it, and the intermediate form is specified.
- [ ] All 17 workflows and 122 activities convert to the intermediate form, and the converted corpus reproduces the existing walk — same transitions, same artifacts, and no more delivered characters.
- [ ] A runtime walks an activity's steps, decides each gate from the session, drives iteration, and calls an agent per run of steps ending at the first gate it cannot answer.
- [ ] The server derives every transition independently and refuses one it cannot reproduce; a gate the agent reports stopping at is accepted only when the runtime recomputes the same verdict from the returned values.
- [ ] The runtime and the end-to-end walker are one implementation, and the properties the test suite records become runtime invariants.
- [ ] The five graders that exist to mark an agent's report are removed, along with the parameters that carried them and the prose that taught an agent to drive.
- [ ] A gate whose expression does not parse fails the load.
- [ ] A second attach into a folder holding a running session continues it, with its position, completed activities and variables intact; a finished one is not resumed; and the record shows a resumed run as distinct from a first one.
- [ ] Repository derivation, session creation and planning-folder resolution complete in one call from typed code, and a working directory that is not a checkout is refused rather than created.
- [ ] The session record is chained and tamper-evident, and a rotated signing key is reported as an authorship failure rather than as unreadable state.
- [ ] Composition happens at build time, every deliverable block has a stable address, and a delivery names addresses plus only the bytes the recipient lacks.
- [ ] No byte-identical block appears twice in one response, against a worst case of 16,453 characters; a repeated request returns a marker, against 18 repeats and 67,772 characters in one measured run; and the activity body collapses, against a measured 38.4% share of a resumed delivery.
- [ ] The cost of a path can be computed from the compiled corpus without running it.
- [ ] Every check in the guard suite is dispositioned — retired as subsumed, kept as a convention no type expresses, or declined with the reason recorded.
- [ ] The private-remediation guarantee is expressed as a permission ceiling and holds at least as strongly as it does today.
- [ ] No test on the code branch reads the corpus, and something enforces that rather than stating it; no recorded measurement carries a corpus commit identifier, because none needs one.
- [ ] Every guard that survives is green, the reference walk completes, and the full test suite passes.

## Non-goals

- **Techniques stay prose.** Their bodies are the agent's to interpret and nothing here parses them. The corollary is a real constraint rather than a preference: 436 of the corpus's 2,459 protocol bullets open with a conditional or a repetition, so a call to an agent is atomic and the runtime cannot resume one part-way.
- **The runtime is not attested.** The server accepts a transition because it derives the same one, so nothing depends on knowing which client called.
- **Parallel execution inside a session.** One decision at a time, one recorded position, and parallelism at session granularity through child workflows. A typed step graph makes independent subtrees visible, which is worth revisiting once the record and the position exist, but the corpus does not currently express which work is independent.
- **Promoting every guard to a load failure.** It hardens the mechanism instead of removing it: the checks stay outside the language, still separately maintained, still unable to run where a definition changes, and the corpus-debt triage file would need a suppression mechanism for every finding currently tolerated.
- **Splitting the repository.** The two branches stay as they are. The corpus becomes a package depending on a runtime package, which is a dependency relationship rather than a split.
- **Constraining technique outputs to make a run reproduce from the definition alone.** The prose judgement is the product. A run reproducing from its recorded returns is what audit needs, and claiming more would be false.
- **A big-bang replacement.** The intermediate form is the pivot, and both engines must agree on the walk before anything is removed.
- **Closing anything on filing.** See Tracking.

## Tracking

Each work item is delivered as its own pull request when picked up:

- [ ] W1 — the write-timing decision and the intermediate form, settled in writing before any code
- [ ] W2 — the intermediate form and an importer; gated on W1
- [ ] W3 — one runtime, absorbing the end-to-end walker; gated on W1 and W2. Carries #523 in full
- [ ] W4 — the session as an append-only record, with setup derived server-side; gated on W1. Carries #401 W2 and W3
- [ ] W5 — a corpus compiled once and delivered by hash; gated on W2
- [ ] W6 — the authoring language and effects as types; gated on W2
- [ ] W7 — the corpus as a package that checks itself; gated on W6. Carries #497

**W1 to W3 are the first milestone and stand on their own.** They deliver fidelity by derivation on the definitions as they are today, which is the property the present architecture structurally cannot reach. W5 to W7 are what pay off on top of that. An epic that answers most of the tracker should earn that milestone before the rest is committed.

**No issue closes on filing.** Fourteen of the twenty-one open issues are wholly or substantially answered by this design rather than by work aimed at them, and each closes when the work item that answers it lands, with the item named in the closing comment. Until then they remain the best statement of what is wrong, and several hold evidence this epic depends on. The full disposition — which dissolve, which fold in, which survive untouched — is in the planning folder.

## Investigation detail

Full record — the diagnosis and the design, every count with how it was taken and what it is safe to claim, the disposition of all twenty-one open issues, and the twelve alternatives weighed and dropped with the reason for each:
**[engineering/artifacts/planning/2026-08-31-typed-execution-redesign](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-31-typed-execution-redesign)**

The gate census, the delivery-grain exchange rates, the mechanism ledger and three independently reviewed designs of the agent interaction protocol are in the runner proposal's own folder, [2026-08-28-runner-execution-protocol](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-28-runner-execution-protocol), and are reused here rather than re-derived. The predicate survey and its 48 findings are in [2026-08-24-shorthand-expression-grammar-for-workflow-yaml](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-24-shorthand-expression-grammar-for-workflow-yaml).

