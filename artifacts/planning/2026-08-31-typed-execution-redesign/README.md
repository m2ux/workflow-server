# Typed execution — a ground-up redesign record

**Date:** 2026-08-31
**Server:** `b2f7b8f6` (main). **Corpus:** `workflows` worktree at the same date.
**Purpose:** Record a from-scratch redesign of the workflow server aimed at fidelity, efficiency and
cost, and state what each of the twenty-one open issues becomes under it.

This folder is the investigation-detail home for the typed-execution epic
([#526](https://github.com/m2ux/workflow-server/issues/526)). It holds the diagnosis, the design, the
measured evidence behind every number the epic carries, the per-issue disposition, and the
alternatives that were weighed and dropped.

The running order that carries the design into a system in production use is the two-paths initiative
([#527](https://github.com/m2ux/workflow-server/issues/527)), which this folder also serves.

| File | Holds |
|---|---|
| `README.md` | The diagnosis, the design, the sequencing, and the risks |
| [evidence.md](./evidence.md) | Every count in the epic, with how it was taken and against what |
| [issue-disposition.md](./issue-disposition.md) | All twenty-one open issues: dissolves, survives, or becomes a work item |
| [migration-disposition.md](./migration-disposition.md) | All ~55 work items: safety, keep, reshape, defer, abandon — what to work while the server stays up |
| [rejected-alternatives.md](./rejected-alternatives.md) | Designs weighed and dropped, with the reason |

---

## 1. The diagnosis

Every structural defect on the tracker descends from one decision: **a language model is the
interpreter**. The server holds definitions, hands them out, and grades what comes back. That single
choice generates the rest of the system's shape.

| Symptom | Measured |
|---|---|
| Fidelity is attestation, not derivation | Seven layers, two hard gates and five advisory. The fidelity document's own Limitations section concedes that step execution, condition truth and human presence are each unprovable |
| Most of what a dispatch carries teaches the reader to be an interpreter | Roughly 33,000 characters per dispatch of protocol rules and worker mechanics (#523) |
| A cache exists to undo re-delivery of content that need not be sent | 16,453 characters byte-identical inside one response; 67,772 characters re-sent across one run; 38.4% of a resumed delivery is the activity body (#404 W7, W9, W10) |
| Gates cannot be answered because writes land too late | 313 gates unanswerable across 79 activity deliveries; well over half of all gate sites read a value an earlier step of the *same* activity produces (#523) |
| The predicate language is untyped and doubled | 281 string predicates against 109 block predicates; of thirteen predicates written both ways, five return opposite answers (#513) |
| The type system exists, implemented as a lint suite | 33 `check-*.ts` scripts totalling 6,471 lines, 148 catalogued anti-patterns, 34 design principles, and a triage file of hand-classified corpus debt |
| A second interpreter already exists, on the wrong side of the test boundary | `tests/e2e/walker.ts`, 895 lines: walks the step tree, evaluates gates, selects options, chooses endings |
| The corpus cannot check itself | 16 corpus-reading tests stranded on the code branch; binding-fidelity verdicts 249 corpus commits behind their subject (#497) |

The system has independently arrived at needing a compiler, a runtime, a type system, a linker and a
cache. It has all five. Each is built ad hoc, over an untyped substrate, and sited where it cannot do
the job it was built for.

### The one move

**The orchestrator is a program, not an agent.**

Today an entire model context exists to read state and decide which activity comes next — a job whose
answer is deterministic and which the server already computes for its own delivery decisions. Delete
that role and four things go with it: a context, its harness establishment cost, the ~33,000
characters of prose that teach it to do the job, and its capacity to drift.

Everything else in this design follows from taking that one move seriously.

---

## 2. The three gaps

### What a run proves is a report, not a record

The enforcement layers grade a self-report. `step_manifest` records that the agent *said* it ran each
step; `activity_manifest` records what it *said* it completed; the reported exit records the outcome
it *claimed*. Two hard gates exist — the seal over the state file, and the checkpoint gate — and both
protect the server's own bookkeeping rather than the work.

The consequence is that the strongest available claim about a completed run is that an agent reported
a conforming sequence. Where the report and the work disagree, nothing anywhere holds the difference.

The three-second minimum on a checkpoint response is the shape of the problem in miniature. It exists
because the agent owns the channel to the user, so the cheapest forgery — resolving a gate instantly,
having shown nobody anything — has to be raised by a timer rather than ruled out.

### Most of what a dispatch carries teaches the reader to be an interpreter

Of the content delivered on a dispatch, the part that describes the work is a minority. The rest is
protocol: how to walk steps, how to evaluate a gate, how to report a manifest, how to choose between
delivery forms, what to do when a call returns something unexpected. Roughly 33,000 characters of it,
on every dispatch, forever, because the agent drives.

The apparatus that grew around this cost is substantial and correct-given-its-premise: content
hashing, per-context ledgers, unchanged-reference markers, eager and lazy step selection, headroom
fractions, per-technique size caps, a cumulative character budget, and a batch bound with two limits
and three carve-outs. All of it rations a payload that is mostly instructions for a job a program
would do without being told.

### The rules the definitions must obey have no home in the definitions

The definition language cannot state its own constraints, so they live elsewhere: 6,471 lines of
guard script, 148 anti-patterns, 34 principles, and prose. #513 puts the count directly — of fifteen
rules governing predicates, ten live in prose, code comments, or nowhere.

Read the guard suite as a compiler and its subject becomes clear. `check-activity-variables` is type
unification across declaration sites. `check-self-provisioned-input` is use-before-definition.
`check-decision-order` is definite-assignment analysis, complete with five hand-argued exemptions
that each correspond to a standard narrowing or control-flow join. `check-binding-fidelity`, at 856
lines, is the type checker for the binding graph. `check-stealth-isolation` is an effect-containment
proof. These are not lints. They are the semantics of the language, written outside it, in a place
where nothing forces them to stay true.

---

## 3. The design

### 3.1 A typed language over an intermediate form

Authoring moves to a **TypeScript-embedded language that compiles to a serialisable intermediate
form**. The intermediate form, not the language, is the contract between authoring and runtime, so a
second front end — or an importer for the existing YAML — stays possible without the runtime knowing.

The variable bag becomes a row type. An activity's `reads` and `writes` become its signature. A
technique becomes a typed function whose body is prose. A gate becomes a typed expression over the
bag.

```ts
const implement = activity({
  id: 'implement',
  reads:  { implementation_plan: Plan, branch_name: Str, is_review_mode: Bool },
  writes: { test_status: Str, has_open_assumptions: Bool.default(false) },
  effects: [WriteRepo, WritePlanning],
  steps: [
    forEach(s => s.implementation_plan.tasks, task => [
      call(implementTask, { current_task: task }),
      call(cargo.test, { build_scope: `-p ${task.crate}` }),
      decide('symbol-provenance', { when: s => s.has_uncertain_symbols, /* … */ }),
    ]),
    ...assumptionReconciliation({ gate_message: '…' }),
  ],
  exits: { done: isDefault },
});
```

Why an embedded language rather than a bespoke grammar: the type checker exists and is mature;
authors get completion, go-to-definition and rename; a bad binding is an editor diagnostic rather
than a CI script somebody has to write and maintain. The corpus is agent-authored, so the authoring
floor is a smaller cost here than it would be elsewhere.

**What collapses into the type system:**

| Today | Under the design |
|---|---|
| Two predicate dialects that disagree | One typed expression. `==` on `number` requires `number`, so the coercion hazard #513 has to measure before it can migrate does not exist |
| #513's three missing operators — presence, emptiness, variable-to-variable comparison | Free: `T \| undefined` narrowing, `.length === 0`, an ordinary comparison |
| `check-activity-variables` | Type unification across declaration sites |
| `check-decision-order`, 213 lines and five exemptions | Definite-assignment analysis. A defaulted variable is `T`; an undefaulted one is `T \| undefined`. Four exemptions fall out of narrowing and control-flow joins; the fifth — mutually incompatible gates — is genuine path-sensitivity, where the analysis reports *cannot prove* rather than guessing |
| `check-self-provisioned-input`, `check-inherited-inputs`, `check-binding-fidelity` | Signature checking |
| Rule and checkpoint fragments (#519) | Values with module homes |
| Routines (#520) | Typed functions returning steps |
| Profiles (#401 W1) | A typed constructor over the initial bag; a locked seed is `readonly` |
| The `action` step kind | Of 84 `set` actions: 50 are valueless because an agent supplies the value — those are technique outputs; 28 carry a literal — those are bindings; 6 need expansion. `log` / `message` / `emit` are runtime effects; `validate` is a technique. The kind the schema already marks for removal has three destinations |

**What stays prose, correctly:** a technique's Capability, Protocol and Rules, and every resource.
That is the payload for the model, and nothing in this design parses it.

### 3.2 Effect typing

Type the effects as well as the data: `ReadRepo`, `WriteRepo`, `Network`, `Spawn`, `AskUser`,
`WritePlanning`, `Publish`. An activity's effect set is the union of its steps'; a workflow declares a
bound; compilation checks containment.

Two live problems become one static property:

- **`check-stealth-isolation`, 280 lines, becomes a type.** The private-remediation workflow bounds
  out `Publish`. A step that discloses fails to compile. The guarantee stops depending on reachability
  analysis over seeded values.
- **#436 W1's missing audience field falls out rather than being added beside the schema.** The
  harness is depth-1, so a spawned context does not carry `Spawn`. An activity that needs `Spawn`
  therefore cannot be worker-audience — a type error, in place of three prose rules with hand-written
  carve-outs and one activity everybody agrees is an unacknowledged exception.

The limit is worth stating plainly: the type declares what is permitted. Where permission must be
*enforced* — the private-remediation case — the host has to sandbox. The type buys a checkable
declaration that cannot be forgotten, not containment.

### 3.3 The runtime walks; the model is called

Three participants, with the boundary drawn where capability actually differs:

- **Runtime, deterministic** — cursor with a frame per enclosing loop, gate evaluation, iteration,
  binding resolution, transition derivation, artifact contract, persistence.
- **Agent, judgement** — executes techniques, returns typed outputs.
- **Person, decision** — answers checkpoints.

Two properties are load-bearing.

**A step's declared outputs enter the bag when the step completes.** Without it a runtime can decide
only the gates fed by an earlier activity, and the majority — fed by an earlier step of their own —
stay unanswerable. #523 names this as the item to settle before any code, and the answer is yes: it
decides what the session file carries and everything else is downstream of it.

**A call-out is a turn inside a living context, never a fresh spawn.** There are 611 technique steps
across 117 activities; paying a 23,000-to-42,000-token establishment for each would multiply the
largest cost in the system by five.

Those two pull against each other, and the tension is the interesting part of the design. Writes at
step completion make gates answerable — and also make the runs short, while a unit below roughly four
steps loses money against an 18,800-character round trip. The resolution is to apply **derivation one
level down**: hand the agent a run of steps *together with the parsed gates*, let it stop where a gate
goes false, and have it report which gate and why. The runtime recomputes that gate from the returned
outputs and accepts the stop only if it reproduces it. This is #523's derivation-rather-than-attestation
rule applied per gate instead of per transition — authority rests on the runtime reproducing the
result, never on the caller's claim.

### 3.4 A compiled, content-addressed corpus

The delivery-cost epic is a caching problem manufactured by composing payloads per request. The
provenance builder walks the whole workflow per bundled step and re-reads technique files from disk;
one observed call walked the catalogue three times.

Compile the corpus to a **content-addressed store at build time**. Every composed technique, every
merged rule block, every resource section has a stable hash before any session opens. A delivery is a
manifest of hashes plus the bytes this context does not hold.

That retires most of #404 by construction: W1 because composition happens once at build rather than
per step per request; W7 because two identical blocks are one hash; W9 because a repeat fetch is a
marker; W10 because the activity body is a hash like everything else. W2's cost line becomes a byte
count.

A capability falls out that the current architecture cannot reach: with a compiled corpus, **a path
can be priced statically**. The delivery-cost question turns from a measurement epic gated on
completed sessions into a compile-time budget check.

### 3.5 Fidelity by construction

Seven layers become three properties:

1. **Determinism.** Given the definition version and the recorded input sequence — agent returns and
   human answers — the run replays byte-identically. A transition is computed, not checked.
2. **Provenance.** Every value in the bag carries its producer: step, technique call, agent turn,
   content hash. Half-built today in `binding-provenance.ts`, as a delivery decoration rather than a
   runtime fact.
3. **Attestation.** An append-only, hash-chained event log, sealed per entry rather than as an HMAC
   over a whole snapshot. The chain gives tamper-evidence *and* lets a rotated key degrade the
   authorship claim without destroying readability — which is the honest report, and which the
   current seal cannot make.

What stays genuinely unprovable shrinks to two things: the *content* of what an agent claims it
produced, and human presence at a checkpoint. Everything else the runtime did, it did.

Five graders retire along with the parameters that feed them — the step manifest, the activity
manifest, the reported-exit check, the skipped-step accounting, and the technique-fetch check. So does
the three-second timer: where the runtime renders the question, it knows whether it did.

**Precision about determinism.** This is replay-determinism. Given the recorded returns, the run
reproduces exactly. Re-running the agent does not reproduce them. Replay-determinism is what audit
needs; it should not be sold as more.

### 3.6 The session is an event log

State becomes a fold over an append-only log.

- **Resume is replay to the cursor, and reattach is free** — you append, never overwrite. #401 W3's
  silent destruction of a resumed run cannot occur: a completed child is visible in its own log, a
  cursor that cannot be entered is a fold error at a known offset, and identity is the log's identity.
- **Bootstrap (#401 W2) becomes the log's first events**, produced by typed derivation rather than a
  forty-eight-line algorithm hand-executed from prose — the one that bound the wrong repository and
  cost one session 81,762 tokens.
- The throwaway-session-then-promote machinery and `migration.ts` retire.

### 3.7 Packages

```
@wf/ir        the intermediate form and its schema — the only authoring↔runtime contract
@wf/lang      the authoring language, its type rules, the compiler
@wf/runtime   the interpreter: cursor, gates, loops, bindings, transitions, effects. Pure.
@wf/store     event log, artifact store, content-addressed corpus cache
@wf/host-mcp  the MCP adapter
@wf/host-cli  headless driver for CI, walks and benchmarks
@wf/corpus    the definitions
```

`@wf/runtime` and the end-to-end walker become one implementation, which #523 names and which is
right: the properties the test suite records become runtime invariants.

#497 dissolves. A corpus that compiles has a toolchain by definition — it is a package depending on a
runtime package, and `npm test` inside it compiles, type-checks, walks and prices delivery. No stamps,
no freshness assertions, no pointer comparison, no 249-commit drift.

---

## 4. What is kept

The redesign is weaker if it discards these, and each is an existing strength rather than a
concession.

- **Exits in the activity, destinations in the workflow graph.** The best structural idea in the
  system. It is what lets `remediate-vuln` borrow fourteen of `work-package`'s activities without
  editing files it does not own, and it is the open/closed principle correctly applied. Kept verbatim.
- **Goal → Workflow → Activity → Technique → Tool.** A sound decomposition.
- **Techniques as prose with declared inputs and outputs.** The right boundary between mechanism and
  judgement.
- **Just-in-time checkpointing** and lazy resolution.
- **The user-facing agent.** It talks to the person, matches intent to a workflow, and presents gates.
  Only the orchestrator role becomes code.

---

## 5. Sequencing

Two decisions gate the rest and belong before any code.

| Order | Item | Why here |
|---|---|---|
| 1 | Settle write timing and the intermediate form | Both decide what the session file carries |
| 2 | The intermediate form plus a YAML importer | Proves the corpus survives the pivot before runtime work starts |
| 3 | One runtime, absorbing the end-to-end walker | Two implementations become one; test properties become runtime invariants |
| 4 | The session as an append-only log | Unblocks #401 W2 and W3 outright |
| 5 | Compiled, content-addressed delivery | Retires the bulk of #404 |
| 6 | The authoring language and effect typing | Retires the bulk of the guard suite and the isolation and audience special cases |
| 7 | The corpus as a package that checks itself | Closes #497 |

Steps 1 to 3 alone deliver derivation-based fidelity, which is the property the current architecture
structurally cannot reach. They are the minimum viable slice and the natural first milestone.

---

## 6. Risks

1. **The runtime becomes a single point of failure.** A walker defect breaks every workflow, where
   today a confused agent breaks one run. Mitigated by the walker already existing and being tested,
   and by replay-based property tests — but the failure mode genuinely changes.
2. **Prose carries control flow too.** 436 of the corpus's 2,459 protocol bullets open with a
   conditional or a repetition, so a call-out is atomic and the runtime cannot resume one part-way.
   Accept the bound; let the compiler report conditional-heavy protocols as a granularity smell.
3. **The authoring floor rises.** An embedded language is not hand-writable by a non-engineer. Against
   that, the current substrate needs 6,471 lines of guard, 148 anti-patterns and 34 principles to stay
   honest, and a type error is better feedback than any of them. It is a trade, not a free win.
4. **Effect types declare; they do not contain.** Where containment matters, the host must sandbox.
5. **Migration is the real cost.** 122 activities, 575 technique files, roughly 2.5 MB of corpus.
   Techniques barely move — parse the signature, keep the prose. Activities change shape but translate
   mechanically, and the existing loaders are most of an importer already.
6. **This epic competes with incremental work already in flight.** Several open epics fix, piece by
   piece, defects this design removes. The honest framing is a fork in the road, not a superset:
   see [issue-disposition.md](./issue-disposition.md) for which open work becomes moot, which becomes
   a work item here, and which is unaffected either way.

---

## 7. Decisions this record leaves open

Carried forward from #523 where they overlap, and stated here as the questions a first milestone has
to answer:

- **Whether a step's declared outputs land in the bag at step completion.** The recommendation is
  yes. The majority of gate sites depend on the answer and everything else is downstream of it.
- **Where the pull loop runs.** An agent round trip is measurably cheaper than an orchestrator one,
  but only a context with a channel to the user can settle a decision point, so a gate forces a
  hand-off wherever the loop lives.
- **Whether step identifiers become unique across an activity, or the cursor carries a scope path.**
  Identifiers are unique only within their scope today, and one existing tool already resolves a
  collision silently to the wrong step.
- **Whether the authoring language is the source of truth or a front end over a YAML corpus that
  stays canonical.** The intermediate form makes either workable; the choice decides whether the
  guard suite retires or merely shrinks.
- **How much of the existing corpus is translated versus re-authored.** Mechanical translation
  preserves behaviour and preserves the accreted prose; re-authoring is where the delivery saving
  actually lands.
