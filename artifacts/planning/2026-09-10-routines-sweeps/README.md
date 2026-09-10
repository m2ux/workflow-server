# What a routine makes obsolete, and what the plan owes before any of it is scheduled

> Verified outcome · 2026-09-10 · companion to the [routines proposal](../2026-09-03-routines/README.md), for [#531 W3/W4](https://github.com/m2ux/workflow-server/issues/531)

The routines proposal describes a construct that is not built: no `routines/` directory exists, and
`StepSchema` declares exactly four members. Stage 0 alone has landed. So every candidate in this
folder is something standing in the repository today that the construct would supersede, narrow, or
leave alone — and the question this folder answers is which of the three, measured rather than
argued.

**The construct holds. The plan around it does not.** Nothing here reopens materialisation, the
signature boundary, identifier prefixing or nesting. What the sweeps found instead is a plan whose
stages are costed against a tree that has moved: two of stage 8's four named reference sites have
been deleted from the corpus, stage 4 is costed for a change that landed with stage 0, stage 1's
acceptance baseline names a count that is now wrong, three acceptance criteria cannot be satisfied by
the mechanism they name, and stage 2 — whose entire deliverable is recording the behaviour changes a
migration makes at live sites — was assigned nothing by any of the six sweeps.

## How this was produced

Six sweeps ran over separate surfaces. Every candidate each produced was then put to an agent
instructed to **refute** it from the repository rather than to confirm it from the sweep's own
reasoning, with a standing instruction to take the weaker verdict whenever the evidence for the
stronger one turned out to be thin. A seventh pass then asked what surface, claim, count, stage or
guard nobody had covered, and where two documents disagreed.

So a surviving verdict here is one that was re-derived independently, a withdrawn one is recorded
rather than dropped, and a figure that appears once with no second reading behind it is marked as
such.

The five supersession surfaces produced **111 candidates**. After refutation:

| Verdict | Count | What it means |
|---|---|---|
| REMOVE | 13 | The construct does this job, so leaving it means two paths do one job |
| DEPRECATE | 13 | It has to go, but not before something else lands |
| NARROWS | 30 | It survives with a smaller job, or at fewer sites than the sweep charged |
| KEEP | 31 | It looks superseded and is not |
| STALE | 23 | The construct is correct and a description of it in the proposal needs correcting |
| WITHDRAWN | 1 | The claim did not survive re-measurement |

Nearly half the sweep's output is therefore *do not remove this* or *fix the record*, which is the
result a refutation pass exists to produce. The key-driven stale sweep is counted separately: 30
candidates, of which 3 were withdrawn whole and 7 narrowed to a scope clause rather than a rewrite.

Whole withdrawals are rare and sub-claim withdrawals are not, which is the more useful reading: five
candidates were withdrawn outright across all seven passes, while **19 claims inside surviving
candidates** were refuted and recorded by name — six on the corpus surface, seven arguments on the
design surface, four on the server surface, and one each on the canon and documentation surfaces. A
verdict can be right about a construct and wrong about its size, and those entries carry a confidence
column saying so.

**The tree moved under the work, and that is itself a finding.** The sweeps measured server
`9ca71c19` and corpus `2b8b7215`; the verifications ran 13 server and 14 corpus commits later, at
`c1c9682d` / `26e79d8a`, extracting the sweeps' own baseline with `git archive` so a disagreement is
about the same bytes; the completeness pass measured `ee95e4cd` / `a4a5d88b`, 23 and 28 commits past
the baseline. Two of the plan defects below exist only because of that movement.

## What the plan owes first

These change the plan rather than the code, so they come before the removals. Each was found
independently on at least one surface and re-derived by a refutation pass.

**1. Stage 8 has lost half its constituency, and gained an occurrence nobody named.** The fan work
deleted `meta/activities/patterns/01-orchestrator-workers.yaml` (corpus `67ac93f0`) and
`04-isolated-fan-out.yaml` (`b5471e45`) — two of the four reference sites stage 8 names. Meanwhile
the four-technique fan-out run has five occurrences across four files, not three plus a variant, and
`02-supervisor.yaml` is the one the design never mentions. Its acceptance criterion, that the drift
baseline "falls by the fan-out windows and by nothing else", cannot hold against either error. The
stage needs re-deriving from the corpus rather than editing. Four surfaces reached this independently.

**2. Stage 7's constituency is structurally identical to what the fan just replaced, and nobody asked
the question.** The graph now carries a destination that runs one activity once per element of a
collection, and the canon routes orchestrator-workers and subagent-isolation there. The three `prism`
per-unit passes stage 7 converts are still 41-line activities whose entire step list is one `forEach`
over `analysis_units`, reached by the graph as a single destination — the exact substitution the
corpus has now performed twice. Whether a routine or an instance fan is the right home for them is a
question the proposal predates.

**3. The load path the design diagram draws does not exist.** The whole boundary rests on
materialisation running after identifier resolution and before contract derivation. But
`deriveActivityContract` has two call sites, both in `scripts/check-activity-variables.ts`, and the
loader never calls it — it performs five of the six drawn steps and not that one. Both call sites read
loader output that is already materialised, so a routine reference is gone before the derivation ever
meets it, and stage 3's criterion that "a test fails if the order is swapped" has no order to swap.
Three mechanisms could supply the boundary and the proposal names none.

**4. A routine has free variables after all.** `readSignature` collects `{token}` interpolations from
a technique's protocol blocks, rules and artifact filename templates, strips the ones the signature
names, and the derivation adds the remainder to the referring activity's reads at a single line. Those
tokens live in technique markdown, not in step fields, so materialisation cannot rewrite them: any
routine body binding a technique whose prose interpolates a bag name reads a name its signature does
not declare. The design's own worked signatures already do this three times over. So the stage-4
signature check either reports every prose-sourced read as an undeclared input, or drops the category
and loses the tight boundary that is one of the construct's two claimed advantages — and stage 4's
walker seed, drawn from the declared inputs alone, cannot supply the values either.

**5. "One resolution rule rather than two" is false.** The proposal derives the shared `meta` home
from a routine resolving the way a technique reference already does. Measured over 672 corpus
technique bindings, the two existing resolvers agree on 264 and disagree on 408: the fragment resolver
reads any `::` head as a workflow and throws on a second separator, while the technique loader decides
workflow-versus-group by filesystem probe and admits unbounded depth. The design owes either an
explicit no-group-grammar statement for routine names or a reconciliation of the two.

**6. Stage 4 is costed for work that landed with stage 0.** The proposal states as current fact that
the variable merge "compares an absent default as `null` and reports disagreement with any present
one … Two lines". It does not: both comparisons are guarded on the values being defined, the present
default is carried onto the silent declaration, and the doc comment states the rule. `git log -L` puts
the change in commit `3a36b0db` — the stage 0 commit — with a diff of exactly those two lines. Three
consequences: stage 4 loses a cost item, the construct-inventory row is stale *today* rather than
contradicted later, and the zero-contradiction simulation the design rests on was run against what is
now live behaviour rather than a prospective rule.

**7. Stage 1's baseline names a count that has moved.** Its criterion requires the drift guard to
reproduce "26 maximal windows, five of them nested". Run at the tree, the proposal's own search
reports 24 windows — 19 top level and 5 nested — over 132 activity files. The nested figure is the
half that held, which is why the drift went unnoticed. Stages 6 and 8 both grade convergence by that
baseline falling *and by nothing else*, so both inherit the defect. State the criterion as the
search's output at the revision the guard lands, not as a literal.

**8. Three acceptance criteria cannot be satisfied by the mechanism they name.**

- *A routine with no reference site anywhere fails the load.* The load is per-workflow, and the
  resolution rule the proposal adopts admits a cross-workflow reference — so a per-workflow load of
  `work-package` sees no reference site and fails while one exists a directory away. The rule it
  replaces has corpus-wide reach by construction, enumerating every workflow id before collecting
  anything.
- *A verifying schema generator, so a forgotten regeneration fails continuous integration.* Five of
  the six files in `schemas/` are generator output. `technique.schema.json` is hand-authored, carries
  an `$id` the generator's preamble never writes, has no `generate()` call, and is documented as
  generated. A variant written to the criterion's wording regenerates the five, diffs them, and stays
  blind to the sixth — or goes permanently red on a file the change does not touch.
- *The baseline falls by the windows this removes, and does not fall by any others.* This is the only
  mechanical evidence stages 6 and 8 converged, and on the corpus branch it is a manual comparison of
  two guard runs: `check:delta` needs a submodule pointer that branch does not carry, and the corpus
  pull-request job runs `check:all` and nothing else.

**9. Behaviour changes at live sites with no recorded decision — which is stage 2's whole
deliverable.** The four assumption runs are four different runs: of six step positions, exactly one is
identical in every field at all four hosts. `record-batch-response` carries no review-mode conjunct at
two of the four, and its own ungated convergence loop can set the flag that opens it, so **that step
runs in review mode at two hosts and not at the other two today**. Per-item gate dismissibility
changes in whichever direction it is settled: drop the site condition and the corpus loses its only
dismissible per-item assumption gate; keep it in the routine body and three hosts gain one they do not
have. The proposal's own example body hard-codes gates and a bound that no host writes. Across 111
candidates, zero were assigned to stage 2, and "stage 2" is named twice in the entire folder.

**10. The design's worked signature declares one id as both an input and an output.** At all seven
live sites both resolve to the same name, so the collision is invisible and the worked conversion runs
clean. It stops being invisible the moment a site reads one document and writes another, which is
ordinary for a fold. The reference lifecycle has terminals for unresolved, cyclic, unbound and
overbound and none for a colliding declaration, and the substitution table says nothing about an id
that is also an output. Neither the proposal nor the sweep names this, and it sits inside a construct
whose verdict is KEEP.

Sixty-nine plan defects are recorded in total, each in the verification for its surface. The ten above
are the ones that change what a stage delivers or whether it can be graded.

## The removals, in four clusters

| Cluster | What binds it | Subject | Stage |
|---|---|---|---|
| **A — the checkpoint fragment mechanism** | One shared-body construct that a signature-carrying routine replaces outright | One `fragments` block of 57 lines and two bodies, 8 reference steps across 4 activity files, the 238-line resolver with both its object and raw-text paths, and 7 of the guard's 9 rules | 5 |
| **B — the duplicated runs and the declarations that carry them** | Structure copied because there is no construct to name it | Six byte-identical 32-line convergence blocks under one hash prefix (192 lines), 7 `challenge_findings` write declarations, 6 `has_resolvable_assumptions` read declarations, 8 write declarations for the assumption run's internals, 15 step-id spellings for 6 positions | 5, 6 |
| **C — statements of a mechanism that stops existing** | Prose and canon rows describing how a shared run is expressed | The checkpoint-fragment inventory row, four statements in the schema guide, the checkpoint model's `ref` row and mechanism paragraph, a guard roster bullet, and sixteen closed four-kind step enumerations | 3, 5 |
| **D — stale today, and not caused by routines** | Debt the sweep surfaced by reading the same vocabulary | The stage-0 loop residue, and the already-retired rule half of the shared-body mechanism, whose statements survived it | now |

Cluster D is the one to act on first, because it is the only cluster that is a defect today. Twenty-seven
key-one occurrences sit outside stage 0's file list, of which 17 are statements to rewrite and 5 want a
scope clause rather than an edit. The schema guide's loop-field table is the most serious single site:
it names a field that fails the load and omits the one field an agent actually interprets. Fourteen
statements outside the comprehension folder still describe the retired rule half, and one guard carries
16 lines of a branch that can never fire, because the schema refuses the construct it reads.

The corpus's own catalogue already names this activity — `AP-129 stale-restatement-after-change`,
whose text says the test is occurrence count against the tree rather than against the change's file
list, and whose *do not flag* clause exempts planning artifacts. The method is canon here, not an
import. Its Fix asks for the count to be recorded in the change manifest, and no committed artifact in
this repository has ever done so.

## What merely narrows

Do not file these as removals. Nineteen of the 26 guard rows narrow rather than move: the guards that
gain a second definition directory to walk, and the ones that report on content the migrations move.
Three canon entries gain a clause naming the routine rather than losing a subject, because neither
construct they name is retired by any stage — activity steps remain the composition layer and the
borrowable pattern library remains borrowable. Two of the fragment guard's nine rules survive the
mechanism: `duplicate-checkpoint` keeps its rule with a remedy naming a routine, and `duplicate-rule`
was never a fragment rule at all, as the guard's own header says.

Two findings run the other way and are worth having. `check-artifact-guides` already implements the
falling-only per-guard baseline stage 1 asks for — as design, with a loader, a default path and a
stale-entry rule, and with the file absent because the debt is zero. And `check-resource-anchors`
reaches `routines/` for free, because its scan is directory-shaped rather than path-shaped.

## The keep list

Seventy-two entries are recorded across the six verifications, each with the discriminators that
separate it from the thing it resembles. The ones most likely to be deleted by a confident
implementer:

- **`duplicate-rule` and `duplicate-checkpoint`, inside the guard being gutted.** Five discriminators
  for the first: it indexes rules buckets and never reads a `ref` value, its remedy names a home no
  stage touches, a routine declares no rules at all, it fires only across two or more workflows, and
  the proposal itself says it stays.
- **The surviving `meta/activities/patterns/` activities.** Every mechanical signal says dead: no
  graph reaches them, the loader skips the directory, nothing validates them. But having no consumer
  is the expected state of a library — the repository states that policy in its own triage rationale,
  and records a guard being changed *to* walk these exact files because mirroring the loader left them
  unmeasured. Two have already been deleted for a good and different reason, which makes the rest
  easier to delete by momentum, and `02-supervisor.yaml` is the occurrence stage 8 now needs.
- **`breakCondition` on the loop step.** Zero corpus sites, and its site was removed by a corpus
  commit. It is nonetheless a field materialisation must substitute over, it has a guard rule written
  to refuse it on the wrong loop shape, and the guard's own local interface omits it — so deleting the
  schema field leaves a rule reading a name nothing declares, and `scripts/` sits outside typecheck,
  so nothing would say so.
- **The shared entry-condition spread on any new step member.** It is the single field that disables
  the design's own safety net: without it, three type errors name the three sites a fifth step kind
  must change; with it, the whole of `src/` compiles clean against an unhandled kind. Those three
  errors are the only exhaustiveness signal in the repository.
- **The fragment resolver's candidate-workflow helper.** It looks like the one shared
  `[workflow::]name` resolver, ready to serve routines. It is not the technique rule — wrong for 360
  of 672 corpus bindings, and it throws on the 48 carrying two separators.
- **`schemas/technique.schema.json`.** Documented as generated, with no generator. Regenerating it is
  a no-op that leaves the drift, and adopting the Zod source wholesale rewrites twenty published
  strings at once, two of which say the wrong noun. It is served to agents, not only rendered.
- **The textual fragment injector.** The proposal authorises deleting the textual implementation "when
  the runner stops delivering activity text". There is no runner — the word appears in three planning
  folders and no source module. It has two consumers retiring on different schedules, and blinding the
  second makes 70 recorded ledger judgements silently vacuous rather than failing loudly.

## Sequencing against the nine stages

| Stage | What comes out with it | What it owes first |
|---|---|---|
| **Now, independent of every stage** | Cluster D: the stage-0 loop residue and the retired rule half. Plus one dead guard branch of 16 lines | Nothing. This is due debt, and the sweep has the occurrence counts a manifest needs |
| **0 — landed** | — | Four of its five recorded effects reproduce exactly. `breakCondition` reproduces as a guard rule rather than a deletion, which settles gap 4 of the proposal's own review by measurement |
| **1 — the drift guard** | — | Restate the baseline as the search's output at the landing revision. The falling-only mechanism it wants already exists in a registered guard |
| **2 — settle the run** | — | The twelve behaviour differences, two of them live changes with no recorded decision. Nothing in this folder was assigned here, and that is the gap, not the evidence |
| **3 — the construct** | Cluster C's step-kind enumerations, sixteen sites of which one is generated and one is the only compiler-enforceable one | The load path (defect 3), the free-variable carve-outs (4), the resolution rule (5), a Malformed terminal the lifecycle lacks, and a verifying generator that can see all six schema files (8) |
| **4 — the boundary** | — | Drop the merge change already landed (6). Name the register the column criterion assumes, which `GuardSpec` does not hold. Price the fifteen discovery sites, four rules, one of them outside the registry |
| **5 — migrate the run** | Cluster A entire, and Cluster B's assumption-run half | The dismissibility decision (9), the internals misclassification, twelve pinned coverage entries the renames orphan, and eight schema pointers rooted in the subtree being deleted |
| **6 — converge the convergence loop** | Cluster B's convergence half: 192 lines under one hash | Seven `challenge_findings` declarations, not six. A criterion that can be graded on the branch it lands on (8) |
| **7 — the technique parameter** | The three `prism` per-unit passes | Whether an instance fan is now the right home (2) |
| **8 — the fan-out routine** | Deferred | Re-derive the constituency from the corpus (1). Its concurrency criterion names a variable and a rule at zero sites |

## Figures that moved, and figures with one reading

Six figures the folder states were re-measured by the completeness pass and had moved: the drift
baseline from 26 windows to 24, the generated schema count from six to five, the binding-fidelity
ledger from 72 entries to 70, declared option keys from 285 to 283, registered guard-script lines from
7,699 to 7,769, and a declared-checkpoint figure of 113 that could not be re-derived from the rule the
document states — a parse of the same population gives 115.

One class-(d) claim was **withdrawn**: the assertion that a hard-zero variable guard reports
`undeclared-use` on a materialised internal. It does not fire, because both the read and the write
collectors are namespace-filtered and the crossing rule needs a consumer a prefixed internal cannot
have. Two documents in this folder still assert the opposite, so the class has three instances rather
than four.

The guard classification narrowed: three guards read raw activity YAML non-recursively and are absent
from the class they belong to, making it 15 of 40 rather than 12. And one corpus guard sits in no class
at all, because the classification is scoped to the registry and that guard is excused from it by name
— with a recorded reason asserting 107 findings against a measured 106.

Figures that reproduce to the digit are worth as much: 255 of 635 duplicated write declarations at
40.2% across 88 distinct bodies; six byte-identical convergence blocks under one hash prefix; 115
checkpoint steps of which 66 carry a structured condition, 2 carry a gate alone and none carry both;
40 registered guards against 44 scripts on disk, the suite green in 3.4 seconds; and stage 5's whole
subject unchanged by 28 commits of corpus movement.

## What nobody swept

Three surfaces were reached by none of the six sweeps, and each is work the construct lands on.

- **The test fixture corpora.** 23 synthetic workflow trees and 59 fixture activity files, ten test
  files consuming them and four going through the real server. A `routines/` discovery pass and a fifth
  step kind reach all of them on landing. The word "fixture" appears zero times in the thirteen records
  of the proposal folder. The fan work's fifteen-tree fixture root is the measured precedent for what a
  new construct costs here.
- **The session record.** 1,648 lines across three files, cited by nothing. Two identifier populations
  move under materialisation: the composed checkpoint key, which the proposal accepts explicitly, and
  the positional step keys, which it never mentions. The proposal declines a key-mapping table as
  "permanent server cruft" while the tree already carries one for legacy checkpoint responses.
- **The walker as a construct.** Its promised routine-level entry has no entry point: the walk takes a
  workflow id, starts a session and reads activity definitions requiring exits and an artifact prefix,
  and a routine is never a transition destination. That is a second walker, and no stage budgets it.

Also unswept and cheaper: seventeen hand-maintained MCP tool descriptions, one of which already
narrates the graph fan, so the surface is demonstrably edited when a construct lands.

## Investigation detail

Ground truth first, each measured from the repository rather than from the proposal, and each closing
with the commands that re-take its own figures.

| Artifact | What it establishes |
|---|---|
| [Guard obligations](ground-truth/guard-obligations.md) | Every registered guard, what it demands, hard zero or ledger and on which branch the ledger lives, its exemption surface, and the four ways a routines migration puts it in the blast radius — including the rules a routine body breaks by construction. Plus the coverage walk, the committed artifacts a corpus-moving change invalidates, and what stage 5's criterion actually needs |
| [The mechanisms a routine retires](ground-truth/fragment-mechanism.md) | Four populations measured corpus-wide: the fragment mechanism, the duplicated runs at the grain a routine would carry them, the declarations a signature subsumes, and the prose-encoded runs — the last marked as the weakest, being a judgement about prose rather than a count |
| [Stage 0's landed state](ground-truth/stage-0-state.md) | What stage 0 did, what it left behind, and the key list the stale sweep runs on. Settles gap 4 of the proposal's own review by measurement |

Then the six sweeps and their refutations. Act on the verification; the sweep is kept because a
withdrawn candidate is evidence.

| Surface | Verified outcome | Candidates before refutation |
|---|---|---|
| The corpus definitions | [corpus-vocabulary](verification/corpus-vocabulary.md) | [sweep](sweeps/corpus-vocabulary.md) |
| The server code | [server-code](verification/server-code.md) | [sweep](sweeps/server-code.md) |
| The rules and the canon | [canon-rules](verification/canon-rules.md) | [sweep](sweeps/canon-rules.md) |
| The documentation and the site | [docs-and-site](verification/docs-and-site.md) | [sweep](sweeps/docs-and-site.md) |
| The proposal itself | [design-itself](verification/design-itself.md) | [sweep](sweeps/design-itself.md) |
| Statements a change falsifies, by key | [stale-restatement](verification/stale-restatement.md) | [sweep](sweeps/stale-restatement.md) |

[The completeness pass](verification/completeness.md) closes the folder: what surface, claim, count,
stage and guard nobody covered, which two documents disagreed and which reading the repository
supports.

Measured against the [routines proposal](../2026-09-03-routines/README.md) and its companion records.
The activities themselves are borrowed from the [parallel-activities](../2026-09-09-parallel-activities/index.md)
work, whose supersession sweep, refutation pass and key-driven stale sweep this folder applies to a
second construct.
