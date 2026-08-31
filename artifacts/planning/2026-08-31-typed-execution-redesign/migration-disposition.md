# Migration disposition — what to spend on, and what to stop spending on

The companion to [issue-disposition.md](./issue-disposition.md), which asks what the typed-execution
design *does* to each open issue. This file asks a different and more immediately useful question:
**given a piecemeal migration with the server in active production use, what should be worked now?**

The two answers differ. Work can dissolve under the target and still be worth doing today, because it
prototypes an abstraction the target needs — routines are the clearest case. Work can survive the
target untouched and still be worth deferring, because it is cheaper once a stage has landed. And some
work is now spending on mechanism the migration replaces, which is what this file exists to name.

Scope: all 21 open issues, resolved to work-item grain — roughly 55 items.

---

## The verdicts

| Verdict | Meaning | Count |
|---|---|---|
| **Safety** | Lands before or alongside the migration; the migration is unsafe or lossy without it | 6 |
| **Keep** | Value survives intact. Schedule on its own merits | ~25 |
| **Reshape** | Worth doing, but the item as written needs amending because the target changes what "done" means | 10 |
| **Defer** | Real value, materially cheaper after a named stage. Parked with a trigger, not dropped | 13 |
| **Abandon** | Spends on mechanism the target replaces. The work would be discarded | 7 |

**Defer is not abandon.** Every deferred item names the stage that unblocks it. An item with no
trigger is an item nobody will pick up again.

---

## Abandon — seven candidates

These are the recommendation the evaluation was asked for. Each is work that would be built and then
removed, and in four of the seven cases the removal is already scheduled by the design.

### #436 W1 — the activity audience field

Adds a schema field, two delivery injection points, three hand-written rule carve-outs and one
orchestrator protocol step, so that an activity can declare which role executes it.

**Why abandon.** The item exists because the meta workflow's client-dispatch activity has to run in
the orchestrator and nothing lets it say so. Under the runner, the orchestrator is code and that
activity's loop is the runner's loop — the dispatch it was fighting for does not happen at all. The
measured saving the item carries, a 165-second setup dispatch, arrives free with the runner rather
than being bought with a schema field.

Under effect typing the same guarantee is one containment check: an activity needing to spawn cannot
be given to a context with no permission to spawn. Adding the field now means retiring it later along
with three carve-outs written specifically to accommodate it.

### #404 W3 — teach agents to fetch cheaply

Protocol guidance instructing agents to prefer reference bundles, use the resources map the delivery
already carries, and understand what a lazy fetch costs.

**Why abandon.** The runner fetches; agents stop. This is documentation whose entire audience is the
driving role that the migration deletes — and it is delivered on every dispatch while it exists, so it
is also a small ongoing cost of its own.

### #404 W8 — a worker never walks more than one activity

Make the field telling a worker where its context stands arrive on every delivery, then confirm on
real sessions that a run of activities actually forms under one identity.

**Why abandon.** Batching amortises harness context establishment across activities, because today
each dispatch is a fresh context. A runner keeps one context alive across a run, which removes the
cost batching exists to spread — activity-count batching is the wrong axis under the target.

The item has also already spent one cycle: on the first work-package run after the limit shipped, no
context anywhere took a second activity, and nothing was refused because no worker could learn it had
room. Spending a second cycle on the same mechanism is the specific waste this list is for.

### #404 W11 — confirm re-delivered characters have fallen

A read over roughly ten completed gate-crossing sessions, reporting re-delivery events against a
677,132-character baseline.

**Why abandon.** It measures the delivery-identity mechanism that content addressing replaces, and it
is gated on a sample that has not accumulated. Under a compiled, content-addressed corpus the question
it asks is answered statically rather than sampled — the epic's acceptance criterion for W5 asks it
directly and does not need ten sessions to do so.

**Keep one thing from it:** the 677,132-character baseline is the number W5's acceptance criterion
should be measured against. Record it where W5 can read it before closing this.

### #513 stage 6 — deliver the parsed form to agents

Once expressions are parsed at load, ship the parsed structure with the activity so the agent walks a
structure instead of reasoning over a grammar.

**Why abandon.** Agents stop evaluating gates. Stages 1 through 4 are on the critical path; this one
serves the reader the migration removes.

### #397 W3b — verified call joints

Already dormant and evidence-gated in the issue as written: built only if post-delivery evidence shows
runtime misbinding a static check cannot catch, and then only for operation-grade callees, shipping as
marked blocks with checked seams behind a flag.

**Why abandon rather than leave dormant.** The evidence that would trigger it is evidence of a binding
error the type system catches by construction. Leaving it dormant costs nothing today but leaves a
trigger nobody will reassess against the new design. Close it into the epic's W6 as a resolved
question instead.

### #518 W5.1 — relocating orchestrator rules to an orchestrator-adjacent home

Six orchestrator-only rules move to a new home, and every entry point addresses the rule family it
needs rather than the file.

**Abandon the relocation; keep the removal.** Under the target there is no orchestrator agent, so a
home for rules written to it is a home for text that gets deleted. What is worth doing now is the
cheaper half the item contains anyway: **stop delivering those six rules in the worker bundle.** That
is a delivery-scope change with an immediate per-dispatch saving, it is correct under both the current
and the target architecture, and it needs no new home.

See [Reshape](#reshape--ten-items) for how the item should read.

---

## Safety — six items that land first

These protect the migration rather than advancing it. Each is cheap, and each prevents a class of
silent failure during the transition.

| Item | What it protects |
|---|---|
| **#513 stage 1** — measure which live predicates change answer when the two number conversions become one | Every later rewrite. A rewrite that silently flips a gate produces no signal anywhere. Nothing that rewrites a predicate may start before this |
| **#513 stage 3** — parse at load; an unparseable gate fails the load | The corpus is at zero parse failures, so this is free today and rises in cost every month. It is also the first piece of the type system, and it helps both execution paths |
| **#402 W1** — dismissal under either gate form | Unblocks #338 W3, which is the 67-site dialect migration. Critical path to one dialect |
| **#338 W3** — migrate the roughly 67 step conditions | The corpus half of one dialect. Gated on #402 W1 |
| **#401 W2** — repository derivation, session creation and planning-folder resolution server-side | Live production damage today: a repository bound from a link rather than a checkout, an empty directory where source was expected, 81,762 tokens lost on one session |
| **#401 W3, reduced to a refusal** — a second dispatch into an occupied folder is refused | See below. This is the highest-value small change on the tracker |

### The reattach refusal, specifically

#401 W3 as written builds reattachment: a second dispatch into an occupied folder continues the child
it finds, with cursor, completed activities and variables intact. Six known hazards sit behind it, each
found by reviewing a reverted first attempt.

Under an append-only session record, reattachment is free — you append, never overwrite — so building
it now on the snapshot model is work that gets deleted. But the fault it fixes is **active data loss**:
every resume between now and then overwrites the run it was asked to continue, silently, and hands back
the identifier the previous child had. Measured on a real work package: one completed activity and five
history events before, none and two after, the same identifier throughout.

**The resolution is to refuse rather than to reattach.** A dispatch into an occupied folder stops and
says so. It costs the caller one call; continuing costs them the run. It is a small change, it throws
nothing away when the record lands, and it converts silent loss into a visible error — which is the
property that matters while the real fix is in flight.

---

## Reshape — ten items

Worth doing; the item as written needs amending.

| Item | Amendment |
|---|---|
| **#523** — the runner | Five amendments, given in full below |
| **#519** — fragments need a shared home | Split. The **classification** — which bodies are generic and which are domain — is the module-layout decision and survives; do it. The **mechanism** — a new resolution rule for shared bodies — waits, because a routine file has a home by virtue of being a file. Narrow the issue to the eight rule texts at eighteen sites; the two checkpoint bodies at seven sites go to #520 |
| **#518 W5.1** | Restate as a delivery-scope change: orchestrator-only rules stop appearing in the worker bundle. Drop the new-home half |
| **#513 stage 5** — write the formal artifacts | The constraint model per tier survives and is wanted. The grammar-as-generator-source assumes a bespoke parser; if the authoring language is embedded, the grammar is a type definition. Settle the front-end question (epic W1) before writing the artifact |
| **#437 W2** — widen the key-write guidance | Correct today and worth shipping. Note that under a chained session record a key failure means something narrower — authorship degrades, content stays readable — so the message is revisited at epic W4 rather than being final |
| **#436 W2** — procedure written where constraints belong | 23 of 47 rule entries read as procedure, and the procedure they describe is the driving loop the migration deletes. Reshape from *relocate 23* to *identify which of the 23 survive the driver's deletion, and relocate only those*. Substantially less work than the item as written |
| **#401 W3** | Reduce to the refusal, above. Reattachment moves to epic W4 |
| **#400 W1** — one presentation contract | The item offers two branches for headless mode: give it structural reach, or give it no existence at all. **Take the deletion branch.** Under the target, interaction posture is a value a session is constructed with, so building structural reach now builds it twice. Collapsing the four contradictory licences is the live fix and survives either way |
| **#399 W3** — lift the convergence loop into meta | The "parameterized shell moved under a shared group as a named pattern" is a routine. Deliver it as one under #520 rather than as a bespoke technique-group move, and the two items become one |
| **#338 W4** — retire sweep at the next schema major | The gate "next schema major" now reads as "the intermediate form". Retarget it to epic W2 so it is not waiting on an event that will not occur under its own name |

### The five amendments to #523

1. **Input contract is the intermediate form, not the loaders' object graph.** Sharing code couples the
   runner to server internals; sharing a named, versioned structure does not. Built against a frozen
   form, the epic's W2 arrives free and the language front-end plugs in later without touching the
   runner.
2. **Derive-and-warn before derive-and-refuse.** The criterion *"refuses one it cannot reproduce"* is a
   production hazard applied globally on day one, because the equivalent check is advisory today. Record
   derivation as a second opinion beside the reported exit, measure the disagreement rate on real
   sessions, then refuse — for runner-driven sessions first.
3. **Graders retire per path, not globally.** While any session is agent-driven, the manifests are that
   path's only fidelity mechanism.
4. **Worker-mechanics prose becomes conditionally delivered before it is deleted.** It cannot leave the
   corpus while an agent might drive, but it is a bundle the server chooses to include — and choosing
   not to include it for a runner-driven dispatch banks the saving immediately.
5. **Record which path drove each session.** Neither #523 nor #520 names it. It is what makes 2 and 3
   possible and what lets the runner's benefit be measured rather than argued.

---

## Defer — thirteen items, each with a trigger

| Item | Trigger |
|---|---|
| **#519** mechanism half | Epic W6 (modules) |
| **#518 W5.4** — two of three catalog entries (engine internals narrated to an agent that cannot act on them; schema semantics restated outside the schema) | Epic W3. Both describe the driving prose that the runner deletes. **The third — a variable declaration constraining the values it admits — is Keep**, and is the cheapest piece of the type system after gate parsing |
| **#492** — replacing wrapper prose with tools | Epic W3. The target answers it: a technique with no judgement content is a step the runtime calls directly. Nothing is stranded — the deliverable was withdrawn before any file was touched |
| **#404 W5** — the setup-activity audit half | Epic W4. Server-side bootstrap absorbs the setup activities, so auditing them now audits things that disappear. **The commit-batching half is Keep** |
| **#404 W7** — duplicate content inside one delivery | Epic W5. Writing a dedup pass that a content-addressed store replaces |
| **#404 W9** — a repeat fetch arrives as a marker | Epic W5. Same |
| **#404 W10** — the activity body collapses | Epic W5. Same. This is the largest measured number in the deferral set — 38.4% of a resumed delivery — and it is deferred rather than abandoned precisely because the saving is real. It arrives with the hash store instead of before it |
| **#402 W2** — fragment references in activity-file rules | The #519/#520 decision. May not be needed at all |
| **#401 W1** — profiles | Epic W6. A typed constructor under the target, with no live-damage driver of its own |
| **#397 W1** — protocol variants | Epic W6 (a sum type). **Extract the Initial/Final wrap removal as its own change and do it now** — zero containers author such blocks, so it is pure deletion |
| **#397 W3a** — deliver the mentioned techniques | Epic W5. Delivery mechanism that content addressing changes |
| **#397 W4** — the drifted-variant-arms catalogue entry | #397 W1, itself deferred |
| **#338 W2** — finish the fragments | The #519/#520 decision |

---

## Keep — schedule on merit

Two groups. The first is on the migration's path and should be pulled forward; the second is genuinely
independent of it.

### On the path — pull these forward

| Item | Why it is on the path |
|---|---|
| **#520** — routines | Its parameterisation *is* the language's function signature: inputs with defaults, outputs as full variable declarations. Designing it once against seven real call sites de-risks the target's most important abstraction, and materialise-at-load is compile-time inlining. Land it **before or with** the importer, or the importer is rewritten |
| **#397 W2** — check the calls we already write | Signature checking on the current substrate. Classifies 56 argument-omitting sites and seeds the intermediate form's call graph |
| **#398 W1** — one slug computation shared by guard and runtime | Two implementations of one rule disagreeing is the exact class the migration eliminates, and the shared-module discipline is what the form generalises. Note the standing agreement with #397 W2: whichever lands second builds on the first's module rather than beside it |
| **#404 W1** — resolve each technique once per delivery | Survives as the inner loop of build-time composition. Pure win now |
| **#404 W2** — say what each delivery cost | The instrument the migration is measured with. Wanted before, not after |
| **#404 W6** — report fan-out as warn-only | Becomes a compiler metric; the baseline is wanted now |
| **#404 W4** — startup fixed payloads | Deleting a 44 KB schema read the orchestrator never uses is a one-line win today |
| **#491 finding 1** — borrowed techniques checked in the wrong scope | 143 bind sites unverified where they actually execute. Signature checking, and live |
| **#497** — corpus tests move to the corpus | Independent of the language: the corpus branch already borrows tooling for guards. Doing it now means every subsequent migration stage measures itself where it changes |
| **#513 stages 2 and 4** — settle the grammar, remove the second dialect | The form wants one dialect, and doing it on the current substrate makes the importer simpler |
| **#518 W5.4** (value-set half) | An enum. The type system, one field at a time |

### Independent — the migration neither helps nor hinders

| Issue | Items |
|---|---|
| **#438** Review Path | W1–W5, entirely. Corpus content: what reviewers catch by hand. The cleanest "just do it" epic on the tracker |
| **#310** Graph Reach | W1–W3. Coverage of the code knowledge graph |
| **#437 W1** | Dependency pinning and the known-bad denylist. Security, orthogonal |
| **#400** | W2 approvals that apply, W3 the binding sweep, W4 the ledger close-out. All live damage, all corpus content. W3's defects are exactly what signature checking would catch, so fixing them now also means fewer importer surprises |
| **#399** | W1 name the fan-out contract (inside a technique body, which stays prose), W2 inventory the demand, W4 move comprehension onto the wiki techniques |
| **#398** | W2 disposition the citation tail, W3 classify the framings |
| **#338 W1** | Five content defects |
| **#491** findings 2, 3, 4 | A re-entered activity with no way forward, a guard missing from the registry, and no activity raising an issue for a deferred item |
| **#511** | The issue-creation switch declared as a result |

---

## What this changes about priority

Three observations worth carrying into triage.

**The most measurable work is the most replaced.** #404 carries the largest numbers on the tracker —
16,453, 67,772, 38.4%, 677,132 — and four of its eleven items are abandon-or-defer candidates,
including the three with the biggest figures. A number is not an argument for doing something first;
it is an argument for the saving being real, which content addressing collects in one change rather
than four.

**The cheapest items are the ones that protect the migration.** Every Safety item is small. The
reattach refusal is a few lines and stops active data loss. Stage 1 of the expression work is a
measurement. Neither carries a headline number, and both should outrank items that do.

**Two items are the type system arriving early, and neither is labelled that way.** #513 stage 3
(an unparseable gate fails the load) and #518 W5.4 (a variable declaration constrains the values it
admits) are gate parsing and enums. They are cheap on the current substrate, they help both execution
paths, and each is a piece of the target delivered as ordinary maintenance.
