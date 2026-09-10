# Breaking the corpus-definition sweep

A refutation pass over [../sweeps/corpus-vocabulary.md](../sweeps/corpus-vocabulary.md). Every
construct that sweep names was located again, read in full, and re-measured from the repository —
never from the ROUTINES proposal at
[../../2026-09-03-routines/README.md](../../2026-09-03-routines/README.md) and never from the
sweep's own arithmetic. The instruction was to break each verdict, and to take the weaker rung of
the ladder wherever the case for the stronger one turned out to rest on something other than the
repository.

**All 29 candidates reproduced: every construct exists, and the sweep's citations land on the right
lines almost without exception.** Twenty-five verdicts survived the attempt to break them and four
were downgraded. No candidate was withdrawn whole; **nine specific claims inside surviving
candidates were withdrawn**, and each is named in [What was withdrawn](#what-was-withdrawn) rather
than quietly dropped.

The three downgrades from REMOVE share one shape, and it is a boundary the design has not drawn.
CV4 charges a five-line condition block to stage 5 on the ground that removing it "changes no
behaviour", when the server mechanism the sweep itself cites shows that it does. CV5 assigns
`assumption_review_presentation` to a routine's `internals`, when the proposal's own worked example
puts that name inside a string the *reference site* binds and never declares it at all. CV19 charges
twenty-one declarations to stage 8, when two of the four files holding them have been deleted from
the corpus and the remaining "hazard" it reports — a pattern library sitting in no workflow's graph —
is the library's documented design, stated in the corpus README and again in a guard's own triage
rationale. In each case the verdict dissolves once you ask the design *where the thing goes* instead
of assuming it goes. The fourth downgrade, CV24, is different in kind: the measurement is exact and
the verdict word is simply the wrong one from the sweep's own glossary.

Against that, the sweep's largest and most exposed figures hold to the digit, and I want to say so
plainly because a refutation pass that only reports breakage misrepresents what it read.

## The sweep's baseline has moved, and it matters

The sweep declares its ground: "Server tooling at `9ca71c19` on `main`; corpus at `2b8b7215` on the
`workflows` branch." The working tree is not there. Server tooling is at `c1c9682d`; the corpus
submodule is at `26e79d8a`, **fourteen commits past** `2b8b7215`. Two of those commits are
load-bearing for this sweep:

- `67ac93f0 Retire the pattern activity the graph fan replaces` — deletes
  `meta/activities/patterns/01-orchestrator-workers.yaml`, 55 lines.
- `b5471e45 Retire the isolation pattern nothing could reach` — deletes
  `meta/activities/patterns/04-isolated-fan-out.yaml`, 65 lines.

So I measured twice: at the working tree, and at `2b8b7215` extracted to a scratch directory with
`git archive`, so that a divergence is never mis-scored as a sweep error when it is really the
repository moving underneath. Every figure below says which tree it came from when the two differ.
`work-package/`, `prism/`, `prism-audit/`, `prism-evaluate/` and `workflow-authoring/` are byte-identical
across the two commits, so CV1 through CV17, CV20, CV24 and CV26 through CV29 are untouched by the
drift. Only `meta/` and `workflow-design/resources/` changed, and they carry CV18, CV19, CV21, CV22
and CV23.

**At its own baseline the sweep's headline numbers are exact.** 122 activity files, 635 activity-level
write declarations, 88 distinct bodies appearing at two or more files, 255 declarations that are
copies of such a body, 40.2% — all four reproduce to the digit. So does the fourteen-site
`dispatch-workers` table, row for row. At the working tree the same census gives 128 files, 633
declarations, 85 shared bodies, 242 copies, 38.2%, and eleven `dispatch-workers` sites; the whole of
that movement is accounted for by six new `fan-conformance` activities, two new
`midnight-system-review` activities, the two deleted pattern activities, and one dispatch site
converted to a graph fan at `substrate-node-security-audit/activities/03-primary-audit.yaml`.

Other figures that reproduce exactly, at both trees, and that I could not shake:

- **The convergence blocks.** Six `doWhile` blocks at `02-design-philosophy.yaml:177-208`,
  `04-research.yaml:137-168`, `05-implementation-analysis.yaml:83-114`, `06-plan-prepare.yaml:115-146`,
  `07-assumptions-review.yaml:74-105` and `08-implement.yaml:159-190` — 32 lines each, dedented and
  hashed to one SHA-256 prefix, `9365f28c74d12705`. 192 lines. Including the sweep's own hash prefix.
- **The checkpoint gate census.** 115 checkpoint steps over the whole tree, of which 66 carry a
  structured `condition` as written, 2 carry `when` alone, none carries both, and 47 carry neither.
  Identical at both commits.
- **The prose census.** 586 technique markdown files under `workflows/*/techniques/` at the sweep's
  baseline, 444 Protocol links resolving to another technique's `.md`, across 145 files, 85 of them
  naming two or more distinct other techniques. Four figures, four exact reproductions. (593 / 445 /
  146 / 85 at the working tree.)
- **`write-artifact` bind sites.** 42 at the qualified spelling plus 4 bare, 46 in all, against 15 for
  `verify-artifact-conforms` and 15 for `review-assumptions::record`.
- **The guard suite.** `npx tsx scripts/check-all.ts` reports 40 guards in 3.1 seconds, 40 pass, 0 fail.
  `npx tsx scripts/check-fragments.ts` prints, verbatim, "fragments: OK — every ref resolves, every
  fragment is used, no inline duplicates".
- **Nothing is built.** `grep -rn "kind: routine" workflows/ src/ scripts/ schemas/` returns nothing,
  `ls workflows/*/routines` reports no such file or directory, and `src/schema/activity.schema.ts:167`
  declares `StepSchema` as a discriminated union over exactly four members.

And where the sweep corrected the proposal, it was right to. `challenge_findings` carries seven
activity-level write declarations, not the six at README:208 and README:905. The comprehension loop
is 79 lines, not the 75 at README:43 or the 80 at `re-derivation.md:56`. No assumption host declares
"eight declared writes" as README:37-38 asserts — the four hosts declare 15, 11, 12 and 17.

## What the verdicts mean here

- **REMOVE** — the construct has no successor. It goes entirely at the named stage, and nothing that
  survives the migration needs it.
- **DEPRECATE** — it has to go, and it cannot go yet. Taking it out before the named thing lands
  either reddens a hard-zero guard while a caller survives, or removes a live capability with no
  recorded decision behind the removal.
- **NARROWS** — it survives with a smaller job. Some of its population, its clauses or its fields go;
  the construct itself stays and still has work to do.
- **KEEP** — the routines construct leaves it alone. Either no stage reaches it, or the construct is
  the mechanism a routine preserves rather than replaces.
- **STALE** — the construct is correct as it stands and a *record in the routines folder* describes it
  falsely. The fix is to the record, not the corpus.
- **WITHDRAWN** — a claim I could not sustain against the repository. Recorded, never dropped.

## Verdicts after refutation

| Id | Construct | Sweep | Verified | Confidence |
|---|---|---|---|---|
| CV1 | The `fragments.checkpoints` block — two gate bodies, 57 lines | REMOVE | **REMOVE** | CONFIRMED |
| CV2 | The eight `ref:` reference steps | REMOVE | **REMOVE** | CONFIRMED |
| CV3 | A fragment body's inherited reads, and the dismissibility its shared condition confers | NARROWS | **NARROWS** | CONFIRMED |
| CV4 | The site condition on the per-item gate at `07-assumptions-review` | REMOVE | **DEPRECATE** | CONFIRMED |
| CV5 | Eight write declarations for the run's two internals | REMOVE | **NARROWS** | CONFIRMED |
| CV6 | The other twenty of the twenty-eight assumption-run declarations | NARROWS | **NARROWS** | CONFIRMED |
| CV7 | Fifteen hand-written step-id spellings for six positions | REMOVE | **REMOVE** | CONFIRMED |
| CV8 | The `#{item.field}` per-iteration discriminator, twelve corpus sites | KEEP | **KEEP** | CONFIRMED |
| CV9 | Six byte-identical 32-line convergence loop blocks | REMOVE | **REMOVE** | CONFIRMED |
| CV10 | `challenge_findings` — seven write declarations, no reader, no step mention | REMOVE | **REMOVE** | CONFIRMED |
| CV11 | `has_resolvable_assumptions` — six declared *reads* at the six identical sites | REMOVE | **REMOVE** | CONFIRMED |
| CV12 | The four `combine` output remaps at seven sites, four ids to seven names | KEEP | **KEEP** | CONFIRMED |
| CV13 | The 79-line `deep-dive-iteration` loop at the comprehension site | NARROWS | **NARROWS** | CONFIRMED |
| CV14 | Two `assumption-reconciliation` while loops across two workflows | KEEP | **KEEP** | CONFIRMED |
| CV15 | `iteration_mode` and `analyse-challenge::run-loop` | STALE | **STALE** | CONFIRMED |
| CV16 | The prism per-unit passes — three the proposal names, two it does not | NARROWS | **NARROWS** | PLAUSIBLE |
| CV17 | `all_artifact_paths` at ten prism activities, and the accumulating `set` at eleven sites | NARROWS | **NARROWS** | CONFIRMED |
| CV18 | The compose-then-dispatch fan-out run at fourteen sites in seven files | NARROWS | **NARROWS** | CONFIRMED |
| CV19 | Five fan-out write declarations at four `meta` and two `substrate` activities | REMOVE | **NARROWS** | CONFIRMED |
| CV20 | The two `02-execute-analysis` activities in `prism-audit` and `prism-evaluate` | KEEP | **KEEP** | CONFIRMED |
| CV21 | `schema-construct-inventory.md:68` — the checkpoint-fragment row | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CV22 | `schema-construct-inventory.md:36-37` and design principle 26 — the composition-layer enumeration | NARROWS | **NARROWS** | CONFIRMED |
| CV23 | `schema-construct-inventory.md:38-42` — four rows spelling a step run in prose | NARROWS | **NARROWS** | CONFIRMED |
| CV24 | `audit-schema-validation.md:29` — corpus prose stating what the fragment guard checks | STALE | **NARROWS** | CONFIRMED |
| CV25 | `AP-114 pass-orchestration-in-technique` — its Fix names one destination | NARROWS | **NARROWS** | CONFIRMED |
| CV26 | `AP-38 no-duplicate-technique-steps` | KEEP | **KEEP** | CONFIRMED |
| CV27 | `duplicate-rule` and `duplicate-checkpoint` — two rules over an empty population | KEEP | **KEEP** | CONFIRMED |
| CV28 | The produce-then-persist pair — 46 bind sites, 39 adjacencies, 36 distinct producers | KEEP | **KEEP** | CONFIRMED |
| CV29 | `decisions.md:432-433` — "every activity that would refer to one declares a single `done` exit" | STALE | **STALE** | CONFIRMED |

CV16 is the one PLAUSIBLE. Its verdict word survives but the population it was reasoned from does
not, and what remains — that stage 7 narrows the three passes the proposal already names — is a
weaker claim than the candidate was written to make.

---

## Plan defects

These change the plan rather than the code. Each is a fix the design owes, and each was found inside
a candidate whose verdict I let stand.

### PD1 — Stage 8's acceptance criterion names two files that no longer exist

README:937-939 reads: "Four reference sites: `01-orchestrator-workers`, `04-isolated-fan-out`,
`05-lead-researcher` and the follow-up loop inside it. The completeness `validate` at
`04-isolated-fan-out` stays with the referring activity or becomes a declared input, and the record
says which."

`meta/activities/patterns/` holds four files today: `02-supervisor.yaml`, `03-plan-and-execute.yaml`,
`05-lead-researcher.yaml` and `README.md`. Both `01-orchestrator-workers.yaml` and
`04-isolated-fan-out.yaml` were deleted, and they were deleted **because a competing mechanism
landed for exactly stage 8's constituency**: a graph-level instance fan. The corpus now says so
directly at `meta/activities/patterns/README.md:9` — "Running units together is the graph's layer:
bind the exit that reaches the per-unit activity to a destination naming that activity and the
collection to run it over" — and its catalog map at `:19` gives the orchestrator-workers row as
*(graph)* rather than a borrow.

So stage 8 as specified cannot be delivered: two of its four reference sites are gone, and the
completeness-`validate` disposition it demands concerns a file with no content to dispose of. The
stage needs re-derivation against what the graph fan left behind, and the re-derivation has to say
whether a fan-out routine is still wanted at all now that the canon prescribes the graph for the
same informal pattern.

### PD2 — Stage 6 removes six `challenge_findings` declarations and there are seven

README:905 reads: "`challenge_findings` is an internal, and its six activity-level write declarations
are removed." I count seven, at `02-design-philosophy.yaml:23`, `04-research.yaml:29`,
`05-implementation-analysis.yaml:31`, `06-plan-prepare.yaml:34`, `07-assumptions-review.yaml:34`,
`08-implement.yaml:32` and `15-codebase-comprehension.yaml:22` — exactly the seven convergence sites.
The sweep reaches seven too, and README:208 and `re-derivation.md:257` both say six.

This is not a rounding difference; it is an acceptance criterion that cannot be satisfied. Remove six
and the seventh survives at the comprehension site, where the same stage has that site "reference the
challenge pass from inside its own loop" (README:898-899). `check-activity-variables` then reports the
survivor under `unused-declaration` — "the contract declares a name the activity neither reads nor
writes", hard zero with no ledger (`scripts/check-activity-variables.ts:14`, `:249-255`) — so the stage
lands red on its own criterion.

### PD3 and PD4 — the assumption run's boundary is undrawn, and two candidates disagree across it

Stage 5's criterion at README:886-888 is: "The eight write declarations for the run's two internals
are gone from the four hosts." CV5 supplies those eight as
`assumption_review_presentation` (4) plus `current_assumption` (4).

`current_assumption` is an internal without argument: it is the `forEach` `variable:` of the interview
loop, which sits inside the routine body, and no step writes it. `assumption_review_presentation` is
not. It is the declared output of two techniques —
`work-package/techniques/review-assumptions/assemble-open-set.md:18` and `assemble-one.md:18` — and
`assemble-open-set` is bound at a step the sweep's own CV7 places **outside** the routine:
`present-resolved-assumptions` at `04-research.yaml:170`, `05-implementation-analysis.yaml:116` and
`08-implement.yaml:192`, and `present-residual-assumptions` at `07-assumptions-review.yaml:107`.

The proposal's own worked example settles the direction and settles it against CV5. The example
routine (README:218-274) declares `internals` as `assumption_presentation` and `current_assumption` —
a renamed internal, not the corpus name — while the corpus name appears only once in the whole
example, inside the literal string the *reference site* binds at README:288:

    gate_message: "Open assumptions remain after research ({assumption_review_presentation}). ..."

So under the design as written, `assumption_review_presentation` stays a host-activity name: the host
produces it and interpolates it into a `gate_message` argument. Its four write declarations survive.
Stage 5's criterion is wrong by four, and CV5 drops from REMOVE to NARROWS on that ground.

**PD4 is the boundary itself.** There is a seventh step position in this run that no record counts, and
it is precisely the one that produces the contested value. It varies three ways across the four hosts:
its id (`present-resolved-assumptions` ×3 against `present-residual-assumptions` at `07`), its site
gate (`07` carries `when: is_review_mode != true && has_open_assumptions == true`; the other three
carry none), and whether it carries the `action: message` block that renders the value (04, 05 and 08
do, byte-identically; `07` does not). Counting it, the run is **seven positions with sixteen distinct
spellings over 28 step instances**, not six with fifteen over 24. Whichever side of the boundary it
falls, something has to absorb that three-way variation, and no record names it.

### PD5 — the per-item gate's dismissibility is a live behaviour change with no recorded decision

`src/schema/activity.schema.ts:75` states the rule — "On a checkpoint step, only `condition` (not
`when`) enables condition_not_met dismissal" — and `:85` repeats it. The server enforces it at
`src/tools/workflow-tools.ts:2399-2404`, and the enforcement is the part that matters here:
`respond_checkpoint` **checks only that the `condition` field is present**. It never evaluates it. So
`condition` on a checkpoint is a capability flag, not a semantic gate.

Two consequences the design has not addressed. First, the four batch gates get their `condition` from
`work-package/workflow.yaml:18-28` by inheritance at load
(`src/loaders/fragment-resolver.ts:127`), and the proposal's example gate carries `message` and
`options` and no condition, with the entry test moved to the reference site's `when`. That takes four
of the corpus's 70 dismissible gates down to non-dismissible. Second, CV4's condition block at
`07-assumptions-review.yaml:131-135` is the only site condition on any of the eight reference steps,
and under the proposal's signature the per-item gate is a body step with no field for it. Both are
behaviour changes at live sites, which README:814-818 puts under the walk-before-merge rule; neither
has a disposition.

### PD6 — CV11 and CV12 both claim `has_resolvable_assumptions`, in opposite directions

CV11 removes six *read* declarations because, once the loop moves into the routine, "the write survives
as a bound output at each site and the read declaration has nothing left to describe". CV12 keeps all
28 remap lines as reference-site `outputs` bindings, which is stage 6's own criterion at README:900-901.
Together those say `has_resolvable_assumptions` is written *inside* the routine body (by
`analyse-challenge::combine`), read *inside* it (by the loop's `continueWhile`), and *exported* to the
host. README:210-211 admits three categories and no fourth: "every name its body reads or writes is
one of the three". A name that is read by the body, written by the body, and exported is either an
output the body also consults or an internal that also leaves, and the design does not say which is
legal.

The six sites use `doWhile`, so nothing needs seeding before the first iteration and the arrangement is
at least coherent at runtime. It is the signature model that has to admit it, and stage 6's criteria
do not.

### PD7 — the canon's composition-layer enumeration is already incomplete, before any routine

CV22 reads design principle 26 (`workflows/workflow-design/resources/design-principles.md:117-119`) as
"an exhaustive list of two, and a routine is a third member of it", and dates the incompleteness to
"the day a `kind: routine` step loads".

It is incomplete now. The same table that CV22 quotes prescribes a **graph instance fan** as the answer
for two informal patterns — `schema-construct-inventory.md:38` ("orchestrator-workers / fan-out then
consolidate" → "**Graph, an instance fan**") and `:41` ("subagent-isolation / each unit its own commit"
→ "**Graph, an instance fan declaring `isolation: worktree`**") — while principle 26's closing sentence
still says "Reuse a shared capability by binding it from an activity (or borrowing that activity), not
by `Apply [other-technique]` inside a Protocol", naming no graph route at all. The drift already
trimmed principle 26's borrowable-pattern list from five names to three and left that sentence
untouched. So the fix the sweep charges to stage 3 is owed today, and a routine would be the *fourth*
member of the enumeration rather than the third.

### PD8 — the shared challenge body needs a perspective list the criteria do not name

Stage 6's criterion at README:896-897 takes the two routines' signatures "from the loop block as it
stands". The block as it stands binds `analyse-challenge::challenge` with
`challenge_perspectives: '["stakeholder-gap", "rejected-paths", "evidence-strength"]'` at the six
identical sites, and with `'["pedagogy", "rejected-paths"]'` at `15-codebase-comprehension.yaml:100`.
The shared body therefore needs the perspective list as an input, and the criterion that six sites
"reference the outer routine with no arguments" (README:898) holds only for the six — the comprehension
site must bind one.

### PD9 and PD10 — the worked example is not usable as a specification

Two smaller things that make the example at README:218-274 unsafe to implement against. Its routine is
named `assumption-reconciliation`, which is already the `id` of two live loop steps —
`work-package/activities/03-requirements-elicitation.yaml:185` and
`workflow-design/activities/03-requirements-refinement.yaml:149`, the CV14 pair. Different namespaces,
so not illegal, but an implementer reading `assumption-reconciliation` will not know which one is
meant. And its body binds `review-assumptions::interview` with `inputs: { assembly_mode: interview }`;
neither the operation nor the input exists — `workflows/work-package/techniques/review-assumptions/`
holds `TECHNIQUE.md`, `assemble-one.md`, `assemble-open-set.md`, `collect.md`, `reconcile.md` and
`record.md`, and `grep -rn "assembly_mode" workflows/` returns nothing.

### PD11 — the sweep's own re-measurement instructions do not reproduce one of its figures

The sweep closes by asserting that "each rule is stated in full above so the figure is re-derivable
without them". One is not. CV25's "Requiring the Protocol line to carry an imperative governing the
link gives **333 links across 116 files**" does not name the imperatives. Taking
`Apply|Run|Invoke|Execute|Use|Call|Follow|Perform` on the linking line, over the same 586-file corpus
and the same link-resolution rule that reproduced 444/145/85 exactly, I get **169 links across 76
files**. I cannot say the sweep is wrong; I can say the figure is not re-derivable from what it states,
and it is the only one in the document of which that is true.

---

## What was withdrawn

Nine claims. Each stays here with the reason.

1. **CV3's "24 bindings against today's four `ref:` lines and nothing else."** Reasoned from a
   conversion the design does not perform. See CV3 below.
2. **CV5's `assumption_review_presentation` as an `internals` entry.** Refuted by the proposal's own
   worked example. See PD3.
3. **CV16's "the stage's constituency is five activity files, not three."** `07-dispute-pass.yaml` and
   `10-reflect-pass.yaml` are not per-unit passes. See CV16 below.
4. **CV16's "the same shape with a different collection input"** for `05-behavioral-synthesis-pass`.
   All three per-unit passes iterate `over: analysis_units`.
5. **CV18's "the run's constituency is fourteen occurrences in seven files, not four in three."**
   Measured by grepping an operation name rather than by reading the runs. See CV18 below.
6. **CV18's "the other nine bind a compose operation … and therefore the `kind: technique` input stage
   7 introduces."** The nine are not members of the run, so they impose nothing on stage 8.
   README:797-799 stands.
7. **CV19's "note the hazard: none of the four `meta` files is in any workflow's graph."** That is the
   library's documented design, not a hazard. See CV19 below.
8. **CV23's reading of `schema-construct-inventory.md:38`** as a step sequence offered "as the
   alternative to borrowing the activity". At the sweep's own baseline that row already read "**Graph,
   an instance fan**". See CV23 below.
9. **CV23's `:41` bullet.** The row it quotes no longer exists in any form.

Six figures were also corrected rather than withdrawn: CV10's grep total (14 lines, not 13), CV15's
`current_unit.pipeline_mode` gates (seven, not three) and its fifteen `*_mode` inputs (fewer —
`isolation_mode` is gone from the corpus entirely), CV16's `02`-versus-`03` diff (seven lines, not
eight), CV28's adjacencies and distinct producers (36 and 31, not 39 and 36), and CV29's exit
predicates (7, not 14).

---

## CV1 — The two shared gate bodies

**Verified: REMOVE at stage 5. CONFIRMED.**

Reproduces in every particular. `workflows/work-package/workflow.yaml:15` opens the corpus's single
`fragments` declaration and `techniques:` at `:72` closes it, so the block spans 57 lines.
`assumption-interview` occupies `:17-49` — 33 lines, three options at `:31`, `:37` and `:44` — and
`assumption-decision` occupies `:50-71`, 22 lines, three options at `:53`, `:59` and `:65`. The only
other `fragments` token in any corpus YAML is the prose mention of a changelog fragment at
`work-package/activities/12-strategic-review.yaml:196`.

Between them the two bodies read four names and write three. Of the reads, `is_review_mode` at `:22` is
a declared workflow variable (`:76`); `has_open_assumptions` at `:26`, `assumption_review_presentation`
at `:29` and `current_assumption` at `:51` are activity-scoped. Of the writes, `assumption_outcome` at
`:36`, `:43`, `:58`, `:64` and `:71` is a workflow variable (`:112`); `has_deferred_assumptions` at
`:42` and `:70` and `needs_individual_interview` at `:49` are activity-scoped only. Five of the seven
names the routing file's gate bodies touch belong to one activity's state.

I tried to break the both-directions argument and could not. `scripts/check-fragments.ts` declares nine
rules in its own header (`:11-28`) and its violation type enumerates the same nine (`:56-65`):
`malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `unused-fragment`,
`inline-duplicate-of-fragment`, `duplicate-rule`, `duplicate-checkpoint`, `undeclared-effect-variable`.
`decisions.md:447-449` names seven of them as going with the mechanism, leaving `duplicate-rule` and
`duplicate-checkpoint`. Delete the block while the eight refs survive and the loader throws at
`src/loaders/fragment-resolver.ts:63-65` while `check-fragments` raises `unresolved-ref` at `:207-208`;
delete the refs while the block survives and `unused-fragment` fires at `:242`. The guard is hard zero
with no ledger by its own declaration at `:30`, so either half is a red suite.

## CV2 — The eight reference steps

**Verified: REMOVE at stage 5. CONFIRMED.**

Exactly eight `ref:` lines in corpus YAML, at exactly the files, lines and step ids the sweep tables.
The exclusion clause deserves a note in the sweep's favour: `grep -rn "ref:" workflows/cicd-pipeline-security-audit/`
returns ten hits and every one is markdown prose about GitHub Actions `actions/checkout` — a nominal
collision on the token `ref:` with nothing to do with fragments, correctly set aside. The two
`.github` hits are workflow-checkout parameters in `workflows/.github/workflows/verify-corpus.yml:41`
and `:57`.

The borrowing claim holds. `workflows/remediate-vuln/workflow.yaml:203-216` names fourteen
`work-package` activity files — `02` through `15` — which includes all four fragment hosts and all
seven convergence sites, and a borrowed activity resolves its bare refs against its source workflow
rather than the borrower (`src/loaders/fragment-resolver.ts:132-142`). No activity references either
fragment twice, so the identifier-prefixing collision case has no instance.

## CV3 — What a fragment inherits and a routine has to declare

**Verified: NARROWS at stage 5. CONFIRMED. One claim withdrawn.**

This is the sweep's sharpest finding and the inheritance half of it survives intact.

The shared condition does reach four sites from one place: `src/loaders/fragment-resolver.ts:127` is
`if (body.condition) step.condition = structuredClone(body.condition);`, exactly as cited. The
dismissibility rule is stated twice in the schema and enforced once in the server, all three
citations exact. The checkpoint census reproduces: 115 checkpoint steps, 66 with a structured
`condition` as written, 2 with `when` alone, none with both, 47 with neither — so 70 dismissible gates
at load, four of which get their dismissibility from a file other than their own.

I can strengthen the finding beyond what the sweep claims. `src/tools/workflow-tools.ts:2399-2404`
rejects `condition_not_met` only when `checkpoint.condition` is absent; it never evaluates the
condition. So dismissibility is a capability conferred by the *presence* of the field, and converting
the batch gates the way README:248-251 and README:291 do withdraws that capability at four live sites
regardless of what any predicate would have evaluated to.

**Withdrawn: the arithmetic.** "A one-step routine for `assumption-interview` declares three inputs and
three outputs, and each of the four reference sites binds three `with` arguments and three output maps
— 24 bindings against today's four `ref:` lines and nothing else."

Two problems. The design's own idiom does not spend a parameter per read: the worked example folds the
gate's whole message — and with it `{assumption_review_presentation}` and the phase it names — into a
single `gate_message` input (README:224-225, README:288), and binds one of three declared outputs at
the site (README:289-290). That is two bindings per site, not six. Second, "and nothing else" is
contradicted by the sweep's own CV6: today those same names carry 28 write declarations at the four
hosts, twelve of them for the three the fragment writes. The lone-gate case is closer than the sweep
allows, and the honest statement is that a one-step routine costs a signature and a site binding where
a fragment costs one line — which is a real cost, and not the 6-for-4 regression claimed.

The verdict is unchanged, because it never rested on the arithmetic. The mechanism is reproducible, the
inheritance is not, and the migration owes an explicit answer on whether the batch gate keeps a
`condition`.

## CV4 — The one site condition with no home in the signature

**Verified: DEPRECATE at stage 5. Downgraded from REMOVE. CONFIRMED.**

The construct reproduces exactly. `07-assumptions-review.yaml:129` is the per-item gate,
`:130` its `ref: assumption-decision`, and `:131-135` a five-line `condition` on
`is_review_mode != true`. It is the only site condition on any of the eight reference steps, and it is
legal precisely because `assumption-decision` declares none — `src/loaders/fragment-resolver.ts:118-121`
rejects a condition on both sides. The enclosing `forEach` opens at `:117` of the same activity and
carries `when: is_review_mode != true && needs_individual_interview == true && has_open_assumptions ==
true` at `:123`, so the sweep's redundancy argument is textually right: the inner predicate cannot be
reached with `is_review_mode == true`.

**Where it breaks.** The sweep's disposition is "REMOVE … Removing it changes no behaviour because the
enclosing gate subsumes it — but it does remove the gate's dismissibility at that one site". Those two
clauses cannot both stand, and the second is the true one. The server does not evaluate a checkpoint's
`condition` (`src/tools/workflow-tools.ts:2399-2404`); it requires the field to exist before it will
accept a `condition_not_met` dismissal. So the field's truth value is irrelevant to what removing it
does. Today an agent at that gate can dismiss it; with the block gone, the same call throws `Cannot
dismiss checkpoint '<id>': it has no condition field`. That is a behaviour change at a live site, of
exactly the class README:814-818 requires a walk for, and the sweep's own reasoning about the enclosing
loop is a semantic argument about a field the mechanism treats syntactically.

Downgraded to DEPRECATE: the block does have to go — under the proposal's signature the per-item gate
is a body step with no field to hold it (README:269-271) — but it cannot go before the design records
what happens to per-item dismissibility, which is PD5. Removing it first drops a capability with
nothing on record saying that was intended.

## CV5 — Eight declarations for two values that never leave

**Verified: NARROWS at stage 5. Downgraded from REMOVE. CONFIRMED.**

The measurement is exact and I reproduce all of it. `assumption_review_presentation` carries four write
declarations at `04-research.yaml:23`, `05-implementation-analysis.yaml:25`,
`07-assumptions-review.yaml:28` and `08-implement.yaml:26`, and zero declared reads anywhere in the
corpus. `current_assumption` carries four, at `04-research.yaml:44`,
`05-implementation-analysis.yaml:38`, `07-assumptions-review.yaml:37` and `08-implement.yaml:42`, and
zero declared reads. Neither appears in any `workflow.yaml` `variables[]`. Eight declarations, zero
declared reads.

The asymmetry reproduces too — `assumption_review_presentation` appears in the steps of three of its
four declaring hosts, at `04-research.yaml:177`, `05-implementation-analysis.yaml:123` and
`08-implement.yaml:199`, each inside a byte-identical `action: message` block, and at no step of
`07-assumptions-review.yaml`. But the sweep's gloss — "one of the four declarations describes a value
the file never mentions again" — reads as an anomaly when it is the mechanism working: at `07` the value
is consumed by the fragment's own message at `work-package/workflow.yaml:29`, which lives in the
routing file. That is a CV3 observation about inheritance, not a defect in `07`.

**Where it breaks.** The verdict turns on both names being internals, and only one is. See PD3 for the
full argument: `assumption_review_presentation` is the declared output of two live techniques, is
produced by a step outside the boundary CV7 draws, and appears in the proposal's own worked example
only inside a site-bound `gate_message` literal — never in its `internals`, which name
`assumption_presentation` and `current_assumption`.

Downgraded to NARROWS: `current_assumption`'s four declarations become one `internals` entry;
`assumption_review_presentation`'s four stay, because the host activity still produces the value and
the reference site still consumes it. Stage 5's criterion at README:886-888 is wrong by four
declarations.

## CV6 — The twenty remaining assumption-run declarations

**Verified: NARROWS at stage 5. CONFIRMED.**

Reproduces to the digit at both trees. The seven names carry **38** write declarations across **eight**
activity files: `has_deferred_assumptions` 7, `has_open_assumptions` 8, `open_assumptions` 7,
`assumption_outcome` 4, and `assumption_review_presentation`, `current_assumption`,
`needs_individual_interview` 4 each. Per file: `02-design-philosophy` 3,
`03-requirements-elicitation` 3, `04-research` 7, `05-implementation-analysis` 7, `06-plan-prepare` 3,
`07-assumptions-review` 7, `08-implement` 7, `workflow-design/03-requirements-refinement` 1. **28 of
the 38 sit at the four hosts.**

Declared write totals per host are 15, 11, 12 and 17. The sweep's correction of README:37-38 holds
exactly: no host declares eight writes, and the strongest case the corpus supports is
`05-implementation-analysis.yaml`, where ten of eleven declared writes describe the two shared runs and
the eleventh is `changed_files`.

`assumption_outcome` reproduces as the one name that genuinely crosses: 4 declared writes, 6 declared
reads at `02-design-philosophy`, `03-requirements-elicitation`, `04-research`,
`05-implementation-analysis`, `06-plan-prepare` and `workflow-design/03-requirements-refinement`, ten
activity-level declarations at eight distinct files, three workflow-level declarations
(`work-package/workflow.yaml:112`, `workflow-design/workflow.yaml:27`, `remediate-vuln/workflow.yaml:80`),
and no step of any activity writes it — the only writer in the corpus is a fragment option effect.

## CV7 — Fifteen spellings for six positions

**Verified: REMOVE at stage 5. CONFIRMED, with the population corrected upward.**

Every cell of the table reproduces. Batch gate: `research-assumption-interview`,
`analysis-assumption-interview`, `residual-assumption-batch`, `implementation-assumption-interview` —
four. Batch record: `record-batch-response` ×3, `record-batch-decision` at `07` — two. Interview loop:
`assumption-interview` ×3, `assumption-interview-loop` at `07` — two. Per-item present:
`present-assumption` ×4 — one. Per-item gate: four prefix variants. Per-item record:
`record-response` ×3, `record-decision` at `07` — two. Fifteen distinct identifiers, six positions,
24 instances, and the observation the sweep says is the one worth carrying reproduces: three of six
positions diverge at exactly one host, `07-assumptions-review`, and one position is uniform.

**Correction rather than refutation.** The run has a seventh position, and the sweep's own CV5 depends
on it. `present-resolved-assumptions` / `present-residual-assumptions` sits immediately before the
batch gate at all four hosts, binds `review-assumptions::assemble-open-set`, and is the only producer
of the value CV5 calls an internal. Counting it: **seven positions, sixteen distinct spellings, 28 step
instances**, and one more position that diverges at `07` — three of seven now, and the divergence there
is not only the id but the site gate and the presence of the `action: message` block. See PD4.

The verdict stands. Fourteen of the sixteen spellings go under a routine, every one of the 28
identifiers changes, and that is the sessions-in-flight cost README:1130-1137 accepts.

## CV8 — The per-iteration discriminator

**Verified: KEEP. CONFIRMED.**

Twelve sites, exactly as tabled, and I reproduce each: `meta/activities/02-resolve-target.yaml:64`,
`workflow-authoring/activities/06-scope-and-draft.yaml:98` and `:135`,
`workflow-authoring/activities/09-validate-and-commit.yaml:128` and `:175`,
`work-package/activities/03-requirements-elicitation.yaml:116`,
`work-package/activities/04-research.yaml:242`,
`work-package/activities/05-implementation-analysis.yaml:144`,
`work-package/activities/07-assumptions-review.yaml:129`,
`work-package/activities/08-implement.yaml:220`,
`work-package/activities/10-post-impl-review.yaml:162`,
`work-package/activities/14-complete.yaml:92`. Three discriminate on a round counter at the top level
rather than on a loop item — `scope-confirmed#{scope_round}`,
`audit-disposition#{remediation_round}`, `approve-to-commit#{remediation_round}` — which is what the
sweep says. The design reserves `#` for exactly this and takes a full stop as the prefix separator
because the server splits a checkpoint id on the first `#` to find its base definition
(README:544-546). Untouched at all twelve.

## CV9 — Six byte-identical loop blocks

**Verified: REMOVE at stage 6. CONFIRMED.**

The strongest measurement in the sweep, and it holds without qualification. Located by the
`id: assumption-convergence` line, closed at the first line indented no deeper than the `- ` opener,
dedented and hashed: six blocks, 32 lines each, one SHA-256 prefix `9365f28c74d12705`, 192 lines. Line
ranges exactly as tabled. The block includes the perspective list
`["stakeholder-gap", "rejected-paths", "evidence-strength"]` and all four output remaps, verified by
reading `02-design-philosophy.yaml:177-208` in full.

Nothing in the guard suite compares step sequences: `ls scripts/` matched against `repeat` and against
`routine` returns nothing, which is the surface stage 1 exists to add. The proposal's own search
reproduces — 26 maximal shared windows, 21 top level and 5 nested, 122 activity files parsed at its
baseline.

## CV10 — `challenge_findings`, declared seven times and mentioned in no step

**Verified: REMOVE at stage 6. CONFIRMED. One figure corrected.**

Seven activity-level write declarations at exactly the lines tabled, and those seven are exactly the
seven convergence sites. Zero declared reads. Zero step occurrences at any activity file — every
activity hit is a `- name: challenge_findings` line under `variables.writes`. The name exists in the
declarations only because the contract derivation reads it out of the bound technique's composed
signature: `analyse-challenge/challenge.md:18` declares it an output,
`analyse-challenge/combine.md:12` an input.

**Corrected: the grep total is fourteen lines, not thirteen.** `grep -rn "challenge_findings"
workflows/` returns four in `challenge.md` (`:18`, `:37`, `:38`, `:44`), two in `combine.md` (`:12`,
`:38`), one anti-pattern example at `anti-patterns.md:1615`, and seven activity declarations. The
sweep's own partition sums to fourteen; only its stated total says thirteen.

The count of seven is the one that matters, and it makes stage 6's acceptance criterion unsatisfiable.
See PD2.

## CV11 — Six read declarations nobody counts

**Verified: REMOVE at stage 6. CONFIRMED, and strengthened.**

Reproduces line for line. `has_resolvable_assumptions` is declared as a write at eight activity files
and as a read at six — `02-design-philosophy:10`, `04-research:10`, `05-implementation-analysis:12`,
`06-plan-prepare:11`, `07-assumptions-review:9`, `08-implement:9` — and those six are exactly the six
byte-identical convergence sites. At each, the name has exactly two step occurrences and both are
inside the block CV9 removes: the `continueWhile` `variable:` at `02:183`, `04:143`, `05:89`, `06:121`,
`07:80`, `08:165`, and the `combine` output remap at `02:206`, `04:166`, `05:112`, `06:144`, `07:103`,
`08:188`. Nothing outside the block reads it.

I can put a mechanism behind the conclusion the sweep reaches by reasoning.
`scripts/check-activity-variables.ts:249-255` reports `unused-declaration` for a contract that
"declares a read of '<name>' that no step, gate, loop or transition consults", and the guard is hard
zero with no ledger (`:25`). Once the loop moves into the routine, no step, gate, loop or transition of
those six activities consults the name, so the six read declarations are not merely redundant — they
redden the suite until removed. That is a stronger case than "nobody counts these six".

The two out-of-scope readers reproduce: `03-requirements-elicitation.yaml:190` and
`workflow-design/activities/03-requirements-refinement.yaml:154` each read the name in a
`continueWhile`, and neither is a convergence site, so their declarations stay.

## CV12 — Four output ids, seven destination names

**Verified: KEEP at stage 6. CONFIRMED.**

Read from both sides of the remap. The six identical sites bind all four ids to `assumptions_log`,
`has_resolvable_assumptions`, `has_open_assumptions` and `open_assumptions`; the comprehension site
binds three, at `15-codebase-comprehension.yaml:109`, `:110` and `:111`, to
`comprehension_artifact`, `needs_comprehension` and `has_open_questions`, leaving `residual_opens`
unbound. Four output ids, seven distinct destination names. README:303's "the same three outputs to
five different names" is wrong twice over and the sweep's correction is right.

`residual_opens` is marked optional in `analyse-challenge/combine.md:32`, which is what makes the
three-of-four binding legal and what `re-derivation.md:136` carries forward. The sweep's flag is worth
repeating: this is the one place in the migration where the line count does not fall, because the
copies are the varying part.

## CV13 — The seventh convergence site

**Verified: NARROWS at stage 6. CONFIRMED.**

Measured by the same block-extraction rule as CV9: `15-codebase-comprehension.yaml:79-157`, a `while`
loop of **79 lines**. README:43's 75 and `re-derivation.md:56`'s 80 are both wrong and the sweep's 79
is right. Reading the body: `deep-dive` at `:89-91`, `revise-questions` at `:92-94`, the
`challenge`/`combine` pair at `:95-111`, two `write-artifact` calls at `:112-126`, and a sufficiency
gate at `:127-157`. Seventeen of the 79 lines are the shared pair, which is what a nested reference
takes out.

`revise-questions` sitting between the analysis and the challenge is what forces the two-level split —
the seven sites share only the two steps after it, which is why the shared body is `challenge-concerns`
and not the whole loop. The sufficiency gate stays with the activity, which keeps
`work-package::codebase-comprehension::comprehension-sufficient` alive in
`ACCEPTED_HEADLESS_AUTO_ADVANCE` (`scripts/check-review-mode-gating.ts:52-53`).

One addition, which is PD8: the perspective list differs here (`["pedagogy", "rejected-paths"]` at
`:100` against the three-element list at the six identical sites), so the shared body needs it as an
input and the comprehension site must bind it.

## CV14 — Two reconciliation loops nothing reaches

**Verified: KEEP. CONFIRMED.**

Both loops read in full and diffed. `work-package/activities/03-requirements-elicitation.yaml:184-196`
and `workflow-design/activities/03-requirements-refinement.yaml:148-160` are each a 13-line `while`
loop named `Assumption Reconciliation Loop`, with `continueWhile` on `has_resolvable_assumptions ==
true`, no `maxIterations`, and a single-step body whose id is `reconcile-iteration` at both. `diff` of
the two extracted blocks reports exactly one changed line — line 13, the technique bound:
`review-assumptions::reconcile` against `reconcile-design-assumptions`. Twelve of thirteen identical.

Both findings-about-the-plan survive. Neither file is on any stage's list. And the stage-1 guard as
specified cannot see them: README:820-823 asks for "any run of two or more consecutive steps that
appears in two or more activity files with any difference between the copies, matching on step kind and
binding and ignoring identifiers and site gates" — this run is one step, so the window criterion
excludes it before the binding question arises. (The sweep's ellipsis drops "with any difference
between the copies", which is the clause that makes the guard a *drift* reporter rather than a
duplication reporter; the step-count ground is the one that holds.)

One thing to add, which is PD9: the proposal names its exemplar routine `assumption-reconciliation`
at README:218 — the id of both these loop steps.

## CV15 — The proposal's exemplar for a gate that cannot live in prose

**Verified: STALE. CONFIRMED. Two figures corrected.**

The core reproduces. `grep -rn "iteration_mode" workflows/ src/ scripts/` returns nothing.
`grep -rn "run-loop" workflows/` returns nothing.
`workflows/work-package/techniques/analyse-challenge/` holds three files — `TECHNIQUE.md`,
`challenge.md`, `combine.md`. `conversion-trial.md:274` and `investigation.md:305-321` argue from
constructs that do not exist.

**Corrected on the sweep's live-successor sweep, in both directions.** `isolation_mode` no longer
appears anywhere in the corpus — `grep -rn "isolation_mode" workflows/` returns nothing, it having
gone with the isolated-fan-out retirement — so the fifteen `*_mode` technique inputs the sweep counts
is now smaller by at least the site it cites at
`meta/techniques/orchestration-patterns/TECHNIQUE.md:16`. And `current_unit.pipeline_mode` gates
**seven** YAML steps, not three: `01-structural-pass.yaml:40`, `:48`, `:56`, `:63`,
`02-adversarial-pass.yaml:38`, `03-synthesis-pass.yaml:38`,
`05-behavioral-synthesis-pass.yaml:38`.

Both corrections cut the same way as the verdict. Nothing in the corpus today is a parameter that
exists because a gate cannot live inside technique prose, and the closest live thing is more
thoroughly a YAML gate than the sweep says.

## CV16 — The prism per-unit passes, and the two the proposal does not name

**Verified: NARROWS at stage 7. PLAUSIBLE. The central claim withdrawn.**

The measurements reproduce, one of them with a small correction. `07-dispute-pass.yaml` and
`10-reflect-pass.yaml` are 27-line files that `diff` in **five** lines — `id`, `name`, `description`,
the step `id`, and the technique reference. Exact. `02-adversarial-pass.yaml` and
`03-synthesis-pass.yaml` are 41-line files that `diff` in **seven** lines, not eight: `id`, `name`,
`description`, the loop's `id` and `name`, the step `id`, and the technique reference — which is
precisely the seven the sweep enumerates, so its stated figure of eight contradicts its own list.

**Withdrawn: "the stage's constituency is five activity files, not three."** I read both extra files in
full and they are not per-unit passes. `07-dispute-pass.yaml` has **no loop step of any kind**. It
reads `target`, not `analysis_units`. It declares no `current_unit` write. It carries no
`pipeline_mode` gate. Its single technique step binds `dispute-analysis` over `{target}` at `:13-18`,
followed by a separate `kind: action` step at `:19-24` holding the accumulating `set`.
`10-reflect-pass.yaml` is the same shape. What these two share with `02`/`03`/`05` is the *name*
`all_artifact_paths`, its byte-identical write declaration, and the accumulating `set` action — which
is CV17's population, not CV16's. They share no run: no iteration, no item variable, no collection, no
mode gate. A routine parameterised over a per-unit pass cannot hold them, and a routine over "run one
lens, then accumulate its paths" is a two-step body whose only shared content is the accumulate action
while the operation and its input both vary.

**Also withdrawn: "the same shape with a different collection input"** for
`05-behavioral-synthesis-pass.yaml`. Its loop is `over: analysis_units` at `:24`, the same collection
as `02` and `03`. What differs is the `reads` list (`behavioral_output_paths` for
`all_artifact_paths`), the `prior_artifact_paths` input at `:33`, and the gate value at `:38`. That is
the collection *not* varying, which strengthens stage 7: its three declared inputs at README:926-928 —
the operation, the prior-paths collection and the pipeline mode — are exactly the three fields that do
vary across the three passes.

What survives: the three per-unit passes narrow at stage 7, keeping their `id`, `name`, `description`
and `done` exit and losing the loop body. That is a weaker claim than the candidate was written to
make, hence PLAUSIBLE. The dispute/reflect pair is a genuine byte-identical pair of a different shape
and belongs on the keep list, not in stage 7.

## CV17 — One accumulating action, written eleven times

**Verified: NARROWS at stage 7. CONFIRMED.**

Every figure reproduces, including the ones that could most easily have drifted. Eleven
`target: all_artifact_paths` sites at exactly the eleven lines tabled. Of them, ten carry a
description and it is one of two byte-identical strings: `Accumulated artifact paths across units.`
at four (`01:75`, `02:37`, `03:37`, `05:37`) and `Accumulated artifact paths across the run.` at six
(`07:24`, `08:48`, `09:42`, `10:24`, `11:54`, `12:41`) — the sweep's six-and-four, correct.
`prism-evaluate/activities/02-execute-analysis.yaml:77` carries none.

The paired write declaration — name, type `array`, description `Accumulated list of all artifact paths
across all units` — is byte-identical at ten prism activity files, at exactly `01:11`, `02:10`, `03:10`,
`05:10`, `07:9`, `08:9`, `09:9`, `10:9`, `11:10`, `12:12`. `current_unit` is byte-identical at four
(`01`, `02`, `03`, `05`). The claim that this is the single most-copied declaration body in the corpus
survives my own duplicated-declaration census, which finds no ten-file group elsewhere.

The verdict's substance holds and the ratio is the thing worth carrying: `all_artifact_paths` is a
workflow-spanning accumulator, written by `prism-evaluate` too and read by six activities including
`02-adversarial-pass` and `03-synthesis-pass` themselves, so it survives as a bound output name at
every site. Converting three of eleven leaves the convention hand-maintained at eight.

## CV18 — Fourteen dispatches, every one preceded by a compose

**Verified: NARROWS at stage 8. CONFIRMED as a verdict. Two claims withdrawn.**

At the sweep's baseline the table is exact: fourteen `orchestration-patterns::dispatch-workers` bind
sites in seven activity files across four workflows, and every one immediately preceded by a compose.
At the working tree there are **eleven**, in **five** files across **three** workflows — the two deleted
pattern activities took one each, and `substrate-node-security-audit/activities/03-primary-audit.yaml`
lost one to a graph fan. All eleven are still preceded by a compose.

**Withdrawn: "the run's constituency is fourteen occurrences in seven files, not four in three."** This
is the blast radius measured by grepping an operation name. I read every one of the eleven sites in its
sequence, and they are four different runs:

| Site | The run around the dispatch |
|---|---|
| `meta/patterns/02-supervisor.yaml`, steps at `:40`, `:43`, `:46`, `:49`, `:61` | `classify-request` → `compose-worker-briefs` → `dispatch-workers` → `gather-results` → synthesise |
| `meta/patterns/05-lead-researcher.yaml`, steps at `:39`, `:42`, `:45`, `:48`, and again at `:74`, `:77` inside `gap-followup` | `plan-research-questions` → `compose-worker-briefs` → `dispatch-workers` → `gather-results` |
| `substrate/02-reconnaissance.yaml:35-58` | `compose-roster-briefs` → `dispatch-workers` → `verify-output-files`, twice |
| `substrate/03-primary-audit.yaml:69-92` | three `compose-roster-briefs` → `dispatch-workers` pairs, then one `gather-results` |
| `cicd/03-primary-scan.yaml:38-58` | three *distinct* composes each followed by a dispatch, then `verify-reconciliation` at `:57` |

Five distinct compose operations across the eleven sites, and three distinct successors
(`gather-results`, `verify-output-files`, `verify-reconciliation`). The eight non-`meta` occurrences
share exactly **one** step with the `meta` fan-out run and differ in both neighbours. A one-step
overlap is not a run — stage 1's own criterion needs two or more consecutive steps — so the fan-out run
stage 8 converts has, at the working tree, **three occurrences in two files**: `02-supervisor` once and
`05-lead-researcher` twice. That is narrower than the sweep's fourteen and narrower than stage 8's four.

**Also withdrawn: "Stage 8's claim that the routine needs no parameter of any kind (README:797-799)
holds only for the five `meta` occurrences."** Since the eight non-`meta` occurrences are not members of
the run, they impose no `kind: technique` requirement on the fan-out routine. README:797-799 — "the
fan-out run is generic over the briefs it dispatches rather than over any technique reference it binds,
so it is an ordinary routine under stage 3's construct" — stands as written.

What survives, and is worth more than what was withdrawn: the intra-file blindness is real. Six of the
eleven occurrences are repetitions within one file (two at `cicd/03`, one at `substrate/02`, two at
`substrate/03`, one at `05-lead-researcher`), spread over four files, and the census method keeps only
windows appearing in two or more activity *files* (`drift-census.md:28-30`) so it sees none of them.
The census names the `05-lead-researcher` case as its known exception (`:59-67`); it is one of six.

## CV19 — Five fan-out declarations at six files

**Verified: NARROWS at stage 8. Downgraded from REMOVE. CONFIRMED.**

At the sweep's baseline the table is exact, cell by cell: `dispatched_results` byte-identical at four
`meta` files, `gathered_results` at four, `combined_synthesis` at four, `worker_briefs` at three,
`work_units` at two — seventeen — plus `dispatched_results` and `worker_briefs` under a second
byte-identical body at the two `substrate` files, for twenty-one at six files. Verified by grouping
each write declaration on its whole JSON body with sorted keys, at the extracted baseline tree.

**At the working tree the population is eight declarations at four files.** Two of the six files no
longer exist, and the surviving groups are: `dispatched_results`, `gathered_results` and
`combined_synthesis` at `02-supervisor` and `05-lead-researcher` (six), and `worker_briefs` at the two
`substrate` files (two). `work_units` now has **no** byte-identical group at all — the two survivors
carry domain-specific descriptions — and `substrate/03-primary-audit.yaml` has acquired its own
description for `dispatched_results`, splitting that pair. So thirteen of the twenty-one declarations
the candidate charges to stage 8 are gone or no longer copies, and of the eight that remain, two sit in
the substrate run CV18 shows is not the fan-out run and one of the two `meta` files is not on stage 8's
list.

**Withdrawn: "Note the hazard: none of the four `meta` files is in any workflow's graph."** The
structural facts are all correct — `loadActivitiesFromDir` at `src/loaders/workflow-loader.ts:72-107`
walks one directory with `readdir` and no recursion, `scripts/validate-activities.ts:110` filters a
single `readdirSync`, and `npx tsx scripts/validate-activities.ts` reports "Total: 125 passed, 0
failed" against 128 activity files on disk, the three unvalidated being the three surviving pattern
activities. What is wrong is calling it a hazard. **This is the library's documented design, stated in
the corpus and again in a guard's own triage rationale.** `meta/activities/patterns/README.md:5` reads:
"Borrowable mid-phase multi-agent pipelines. They are **not** part of meta's lifecycle graph
(`loadActivitiesFromDir` is non-recursive — this subdirectory is library-only)."
`scripts/binding-fidelity-triage.json:7` names the same fact as a standing verdict:
"`pattern-library-seed`: A borrowable pattern activity binds an op whose input the BORROWING workflow
seeds — the contract documented in `meta/activities/patterns/README.md`. Producers resolve
per-workflow, so the library home can never show one." Having no caller and no graph position is the
expected state of a library, and the repository says so in two places before anyone measures it.

Downgraded to NARROWS: at stage 8 the fan-out routine's signature absorbs the five names at
`05-lead-researcher`, which is one file; `02-supervisor` is not on the list, the two `substrate` files
are in a different run, and the two files that carried the largest share of the copies are deleted.

## CV20 — Two activities that are one activity with a domain rename

**Verified: KEEP. CONFIRMED.**

Reproduces exactly. `prism-audit/activities/02-execute-analysis.yaml` is 91 lines,
`prism-evaluate/activities/02-execute-analysis.yaml` is 106. The loop blocks are `prism-audit:64-85`
and `prism-evaluate:79-100`, 22 lines each, and `diff` of the two extracted blocks reports exactly five
changed lines: the loop `id`, the loop `name`, the item variable (`current_scope` /
`current_group`), the collection (`audit_scopes` / `execution_groups`) and the compose reference.
Seventeen identical. The four body steps are the same four operations in the same order, with
`workflow-engine::handle-sub-workflow` carrying `workflow_id: prism` at both.

One refinement. The sweep says the compose references "resolve to two separate files whose own `diff`
is 64 lines". The 64-line diff reproduces, but the paths are
`prism-audit/techniques/execute-analysis/compose-trigger-context.md` and
`prism-evaluate/techniques/execute-analysis/compose-trigger-context.md` — the same relative path in two
workflows, and the site difference (`execute-analysis::compose-trigger-context` against bare
`compose-trigger-context`) is a *spelling* of the same group rather than a different group. That makes
the pair slightly more convergeable than the sweep implies, and leaves the verdict where it was: no
stage reaches it, the shared body would need the compose operation as a `kind: technique` parameter,
and converging the two technique files is a separate question from naming the run.

## CV21 — The construct-choice table's row for a construct that stops existing

**Verified: DEPRECATE at stage 5. CONFIRMED.**

`workflows/workflow-design/resources/schema-construct-inventory.md:68` reproduces verbatim, including
after the drift touched five other rows of the same table. I checked its accuracy clause by clause
rather than taking the sweep's word: `fragments.checkpoints.<name>` holding `condition`, `message` and
`options[]` with effects matches `CheckpointFragmentBodySchema` at
`src/schema/activity.schema.ts:117-123`; `kind: checkpoint` reaching it by `ref: [workflow::]name`
matches `CheckpointStepSchema.ref` at `:134`; bare-name resolution against the declaring workflow then
meta matches `candidateWorkflows` at `src/loaders/fragment-resolver.ts:47-55`; mutual exclusion with the body fields matches
`:110-116`; and "a `condition` only where the fragment declares none" matches `:118-121`. Accurate in
every clause.

The both-ways argument holds. `AP-129 stale-restatement-after-change` at `anti-patterns.md:1703-1713`
is the defect a surviving row would be, and its Do-not-flag exempts "planning-folder artifacts that
record the before state deliberately" but nothing in the canon itself. And the replacement row is owed
by stage 3 rather than stage 5, because the routine exists two stages before the fragment goes, so the
table carries both for an interval and the disposition record has to say which row an author follows in
that window.

## CV22 — The canon's enumeration of composition layers

**Verified: NARROWS at stage 3. CONFIRMED as a verdict; the attribution corrected.**

All three prose sites reproduce at the stated lines. `:36` gives **Activity technique steps (not
Protocol Apply)** with "activities (and checkpoints/loops) are the composition layer". `:37` gives
**Activity→activity composition** — "Borrow, bind, or include a standalone activity (or activity
pattern) for reusable orchestration". Design principle 26 at `design-principles.md:117-119` states the
closure, and its closing sentence is the parenthetical the candidate turns on.

The verdict holds: three prose sites enumerate the reuse routes, nothing mechanical checks them, and an
author consulting the table for "reuse a shared run" is routed to borrow an activity, which the
proposal's own dispatch-cost argument at README:649-656 calls the expensive answer.

**The attribution is wrong, and in a way that matters.** The enumeration does not "become incomplete
the day a `kind: routine` step loads" — it is incomplete today. See PD7: the same table already
prescribes a graph instance fan at `:38` and `:41`, and principle 26 names no graph route at all. The
drift trimmed principle 26's pattern list from five names to three and left the closure sentence alone,
which is the AP-129 shape playing out in the canon right now. A routine would be the fourth member of
that enumeration, and the third is already missing.

## CV23 — Four canon rows that write the run out in prose

**Verified: NARROWS at stage 8, over two rows rather than four. CONFIRMED. Two rows withdrawn.**

**Withdrawn: `:38`.** The sweep quotes it as one of "four of them [that] spell out an ordered step
sequence as the alternative to borrowing the activity". Its Formal Construct column reads **Graph, an
instance fan** — and it read that at the sweep's own baseline, which I verified by extracting
`2b8b7215` and reading the row there. There is no borrow at `:38` to offer an alternative to, and the
"Bind `orchestration-patterns::decompose-work-units` at the source … and `gather-results` at the
meeting point" clause is the graph construct's own binding instruction naming two binds, not an ordered
run of four steps. The sweep quoted the third column and skipped the second.

**Withdrawn: `:41`.** The row it quotes — "Borrow `meta/patterns/04-isolated-fan-out.yaml`; seed
`{isolation_mode}`… Completeness gate before synthesise" — no longer exists. `:41` now reads
"subagent-isolation / each unit its own commit" → **Graph, an instance fan declaring `isolation:
worktree`**, and its body is a narrative about checkouts and convergence with no step sequence, no
borrow and no `{isolation_mode}`.

**Surviving: `:39` and `:42`.** Both reproduce as quoted. `:39`: "Borrow
[`meta/patterns/02-supervisor.yaml`] **or bind** `orchestration-patterns::classify-request` → compose →
dispatch → gather → synthesise; seed `{lane_roster}`." `:42`: "Borrow
[`meta/patterns/05-lead-researcher.yaml`] or bind `plan-research-questions` → dispatch → synthesise →
`assess-research-gaps` while loop" — where the drift changed "fan-out" to "dispatch" and added two
sentences about why the loop is the point. Two rows whose "or bind A → B → C → D" clause would gain "or
reference the fan-out routine", and both are rows whose pattern activity survives.

The AP-107 observation survives on the two rows and is worth keeping: `anti-patterns.md:1393-1401`
flags "prose outside activity YAML [that] enumerates an ordered or complete list of activities, steps,
or technique passes" not generated from the bind sites, and both rows meet that detect while resting on
the "pointers to the YAML" exemption, which each satisfies with a link alongside the enumeration. The
corpus's own catalogue treats a prose step sequence as a defect and cannot object here, because the
alternative it would demand — a name for the run — does not exist.

## CV24 — Corpus prose stating what the fragment guard checks

**Verified: NARROWS at stage 5. Downgraded from STALE. CONFIRMED.**

Every measurement is exact, and I want to say so before the downgrade, because the downgrade is about a
word rather than a fact.
`workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:29` reads, in
full: "`check-fragments.ts` — every fragment reference resolves, every fragment is used, and no inline
body duplicates a fragment or another site." It is bound at exactly one step site —
`workflow-authoring/activities/08-quality-review.yaml:113`, at loop-body indentation — while the
same-named file in the other design workflow, `workflow-design/techniques/audit-schema-validation.md`,
is bound at six (`workflow-design/activities/08-quality-review.yaml:138` and `:331`,
`09-validate-and-commit.yaml:81`, `10-post-update-review.yaml:146`, `:203`, `:221`) and mentions no
guard script: `grep -rn "check-fragments" workflows/workflow-design/` returns nothing. And the
four-clause dissection holds: "every fragment reference resolves" is `unresolved-ref`/`malformed-ref`,
"every fragment is used" is `unused-fragment`, "no inline body duplicates a fragment" is
`inline-duplicate-of-fragment` — all three on `decisions.md:447-449`'s list of seven — and "or another
site" is `duplicate-checkpoint`, which survives with its remedy changed.

**Where the verdict breaks.** The sweep defines STALE as "the construct is fine and the proposal's
description of it is what needs correcting", and then says in the same entry that neither the ground
truth nor the proposal counts this line at all. Nothing describes it, so nothing's description of it
needs correcting. This is a corpus sentence that is accurate today and false after stage 5 — which is
the DEPRECATE or NARROWS shape, not STALE. Taking the weaker rung: **NARROWS at stage 5.** The sentence
survives with one of its four clauses, and stage 5 owes its rewrite.

## CV25 — The anti-pattern that forbids a run in technique prose

**Verified: NARROWS at stage 3. CONFIRMED. One figure not re-derivable.**

`AP-114 pass-orchestration-in-technique` reproduces at `anti-patterns.md:1481-1491`. Its Detect fires
on a "Technique Capability or Protocol applies, invokes, or runs another technique/operation for work";
its Fix at `:1491` names one destination — "bind each sibling or shared operation as its own activity
step in the order required"; its Do-not-flag at `:1489` exempts, among others, "activity
`steps[]` technique binds" and "activity borrow/bind/include of reusable orchestration patterns".
Three exempt shapes for a run's home, and a routine reference would be a fourth.

The mechanical census reproduces **exactly** at the sweep's baseline, which is the most demanding
reproduction in this document: 586 technique markdown files under `workflows/*/techniques/`, taking
each `## Protocol` section and counting markdown links resolving to an existing `.md` inside a
`techniques/` tree other than the file itself, gives **444 links across 145 files**, of which **85**
name two or more distinct other techniques. Four figures, four matches. At the working tree it is
593 / 445 / 146 / 85.

The two load-bearing files reproduce. `meta/techniques/orchestration-patterns/dispatch-workers.md:25`
is a `forEach` over `{worker_briefs}` written as a sentence, in a technique now bound at eleven step
sites rather than the fourteen the sweep cites (CV18).
`work-package/techniques/analyse-challenge/challenge.md:24-38` is three phases — Scatter,
Per-Perspective Challenge, Gather — in a technique bound at seven step sites.

**Not re-derivable: "333 links across 116 files."** See PD11. My own imperative rule gives 169 links
across 76 files, and the sweep does not state which imperatives it required, so neither figure refutes
the other. The verdict is unaffected: it rests on the Fix and the Do-not-flag, and on the honest
smallness of the converted population, which reproduces.

## CV26 — The rule that comes closest to seeing a repeated run, and cannot

**Verified: KEEP. CONFIRMED.**

`AP-38 no-duplicate-technique-steps` reproduces at `anti-patterns.md:542-552`. Its Detect is "Two or
more step definitions in **one activity** bind the same technique reference", and its Do-not-flag at
`:550` exempts "distinct-purpose invocations at different pipeline points (initial vs final commit)"
and "same op as distinct phases inside one loop iteration". Both properties the sweep names hold by
construction: scoped to one activity, so it cannot compare across files, and matching a single
technique reference, so it cannot see a sequence.

The corroborating measurement reproduces. `review-assumptions::record` is bound at 15 step sites at the
bare spelling — 16 counting `work-package::review-assumptions::record` at
`workflow-design/activities/03-requirements-refinement.yaml:169` — and three of them are inside
`04-research.yaml` alone, at `:136`, `:227` and `:246`. Reading those three: one closes the
convergence loop's sibling, one records the batch answer and one records a per-item answer, so both
exemptions apply and the guard is silent exactly where it does look. And the central claim it
corroborates reproduces: `ls scripts/` matched against `repeat` and against `routine` returns nothing,
so nothing anywhere compares a sequence of steps against another sequence.

## CV27 — Two guard rules with no population to police

**Verified: KEEP at stage 5. CONFIRMED.**

`scripts/check-fragments.ts` declares nine rules and survives stage 5 with two. `duplicate-rule` is
implemented at `:257-263` and `duplicate-checkpoint` at `:267-270`. Both are at zero today: the guard
prints "fragments: OK — every ref resolves, every fragment is used, no inline duplicates" and is hard
zero with no ledger by its own declaration at `:30`. `WorkflowFragmentsSchema` admits one key,
`checkpoints` (`src/schema/workflow.schema.ts:40-42`), so the mechanism's rule half is not merely
retired in practice — the schema cannot express it — and `check-fragments.ts:7-9` records that a
duplicated rule's remedy is the conduct technique rather than a shared home.

`decisions.md:449-450` and stage 5's criterion at README:882-884 both say what happens: `duplicate-rule`
keeps its rule and its remedy, `duplicate-checkpoint` keeps its rule with its remedy naming a routine.

I looked hard at whether "both rules currently police an empty population" is the failure mode of
calling a library dead for having no callers, and it is not: the sweep draws the right conclusion from
it, that a routines migration cannot be graded by either rule because neither will change colour. Zero
findings is the designed state of a hard-zero guard, and the sweep treats it as such.

## CV28 — The pairing the proposal names as a future feature

**Verified: KEEP. CONFIRMED. Two figures corrected.**

The bind count reproduces: 42 at `work-package::manage-artifacts::write-artifact` and 4 at
`manage-artifacts::write-artifact`, 46 in all, at every loop depth, against 15 for
`verify-artifact-conforms` and 15 for `review-assumptions::record`. README:983's 42 is exact for the
qualified spelling alone.

**Corrected: 36 adjacencies and 31 distinct predecessors, not 39 and 36.** Walking every ordered step
list at every loop depth and taking each `write-artifact` step's immediate predecessor: 36 are preceded
by a different technique step, drawing on 31 distinct predecessor operations; 3 follow another
`write-artifact`; 4 follow a checkpoint; 2 follow a loop; 1 is the first step in its sequence.
36 + 3 + 4 + 2 + 1 = 46. The sweep's partition — 39 plus 2 plus 4 plus 2 plus 1 — sums to 48 against its
own 46, so its 39 cannot be right whatever the correct figure is. My figures are identical at both
commits, so this is measurement error rather than drift.

The five predecessors appearing more than once reproduce by name, each exactly twice:
`audit-expressiveness`, `audit-conformance`, `verify-high-findings`, `audit-principles`,
`audit-anti-patterns`. The verdict is unaffected and slightly strengthened — 31 distinct producers over
36 adjacencies is even less of a shared run than 36 over 39. One routine over the pairing would need
the operation as a `kind: technique` parameter, which is stage 7's feature, and 36 reference sites each
supplying a different producer whose output ids differ, which forfeits the three guarantees
README:410-414 makes unconditional while no routine binds a technique by parameter.

## CV29 — The claim that no reference site could receive an outcome

**Verified: STALE. CONFIRMED. One figure corrected.**

`decisions.md:432-433` reproduces verbatim: "**A routine declares no outcome and returns none.** Every
activity that would refer to one declares a single `done` exit, so nothing in the corpus can receive an
outcome today." The exit census refutes it exactly as the sweep says. Reading `exits[]` at every named
reference site: `02-design-philosophy` 2, `04-research` 1, `05-implementation-analysis` 1,
`06-plan-prepare` 2, `07-assumptions-review` 5, `08-implement` 1, `15-codebase-comprehension` 4, the
three prism per-unit passes 1 each, and the surviving pattern activities 0. Three of the seven stage-5
and stage-6 sites declare a single `done`; four declare two to five.

**Corrected: seven exit predicates, not fourteen.** Those seven sites carry sixteen exits between them,
and only seven carry a `when`: four at `07-assumptions-review.yaml:191-200` reading
`needs_comprehension`, `needs_plan_revision`, `needs_further_discussion` and `is_review_mode`, and
three at `15-codebase-comprehension.yaml:158-166` reading `needs_elicitation`, `needs_research` and
`skip_optional_activities`. The other nine carry no predicate at all: `02` and `06` each pair an
`immediate: true` exit with an `isDefault` (`02-design-philosophy.yaml:259`,
`06-plan-prepare.yaml:183`), and `04`, `05` and `08` carry `isDefault` alone. The conclusion holds more
easily than the sweep's framing suggests: seven predicates to check, none of them reading a name a
routine writes at the same activity.

The near miss reproduces and is the reason the correct statement is not about exit counts.
`15-codebase-comprehension.yaml:110` binds `concerns_agent_resolvable: needs_comprehension`, and
`07-assumptions-review.yaml:192` routes on `needs_comprehension == true`, so a routine output does
reach a routing decision one activity later through the ordinary variable bag. The correct claim is
that no reference site's own exit predicate reads a name a routine writes, which holds over seven
predicates.

Two of the three stage-8 zero-exit sites in the sweep's table — `01-orchestrator-workers` and
`04-isolated-fan-out` — no longer exist. The claim holds in kind for the pattern library, whose three
surviving activities all declare zero exits.

---

## The keep list

What a confident implementer, holding this sweep and the delivery plan, would delete by mistake. Each
entry carries several independent discriminators, because one is too easy to argue past.

**1. `prism/activities/07-dispute-pass.yaml` and `10-reflect-pass.yaml`.** They will look like
per-unit passes: byte-identical but for five lines, in the same directory as the three stage 7 takes,
declaring the same `all_artifact_paths` and carrying the same accumulating `set`. They are not.
Discriminators: they contain **no `kind: loop` step of any kind**; they read `target`, not
`analysis_units`; they declare no `current_unit` write; they carry no `pipeline_mode` gate; they are 27
lines against 41; and their accumulating `set` sits in its own `kind: action` step rather than in a
technique step's `actions`. A routine parameterised over a per-unit pass has nothing to substitute into
them.

**2. The two `assumption-reconciliation` loops** at
`work-package/activities/03-requirements-elicitation.yaml:184-196` and
`workflow-design/activities/03-requirements-refinement.yaml:148-160`. They will look convertible:
twelve of thirteen lines identical across two workflows. Discriminators: a **one-step** body, so no
window search and no stage-1 guard can see them; `while` rather than `doWhile`; no `maxIterations`;
they bind `reconcile` alone with no `challenge`/`combine` pair, so they are not convergence sites; and
neither file appears on any stage's list. Also: their `id` is the name the proposal gives its exemplar
routine, so a grep for `assumption-reconciliation` during stage 5 will hit them.

**3. `assumption_review_presentation`'s four write declarations** at `04-research.yaml:23`,
`05-implementation-analysis.yaml:25`, `07-assumptions-review.yaml:28` and `08-implement.yaml:26`.
Stage 5's own criterion at README:886-888 will invite their deletion. Discriminators: the name is a
declared **output of two live techniques** (`assemble-open-set.md:18`, `assemble-one.md:18`); it is
produced by `present-resolved-assumptions` / `present-residual-assumptions`, a step outside the
boundary CV7 draws; the proposal's own `internals` name `assumption_presentation`, a different
identifier; and the corpus name appears in the worked example only inside a site-bound `gate_message`
literal, which makes it a host name the site interpolates.

**4. The six `has_resolvable_assumptions` *write* declarations**, as distinct from the six read
declarations CV11 correctly removes. Discriminators: each write lands via the reference site's
`concerns_agent_resolvable` output binding, which CV12 keeps and stage 6's criterion at
README:900-901 requires; `unused-declaration` tests reads and writes separately
(`scripts/check-activity-variables.ts:249-261`), so removing the read does not implicate the write; and
`03-requirements-elicitation` reads the name back within its own steps, which is what keeps
`unread-write` quiet.

**5. The ten assumption-name declarations at the four non-host activities** —
`02-design-philosophy` (3), `03-requirements-elicitation` (3), `06-plan-prepare` (3) and
`workflow-design/03-requirements-refinement` (1). Discriminators: none of the four is a fragment
reference site; each declares these names because its **own** steps write them; and `03` and
`workflow-design/03` additionally read `has_resolvable_assumptions` in a `continueWhile` of their own.

**6. `all_artifact_paths` — all eleven `set` sites and all ten byte-identical declarations.** The
sweep names this the single most-copied declaration body in the corpus, which reads as an invitation.
Discriminators: it is a **workflow-spanning accumulator**, also written at
`prism-evaluate/activities/02-execute-analysis.yaml:77` in a different workflow; it is *read* by six
activities, two of which (`02-adversarial-pass`, `03-synthesis-pass`) are the very passes stage 7
converts, so the name must survive as a bound output at every site; and eight of the eleven `set` sites
are at activities no stage reaches.

**7. `duplicate-rule` and `duplicate-checkpoint`.** Both report zero and will look inert.
Discriminators: `check-fragments.ts:30` declares the guard hard zero with no ledger, so zero is the
designed state rather than evidence of an empty rule; `decisions.md:449-450` and README:882-884 both
keep them by name; and `duplicate-checkpoint`'s remedy is what a routine *changes*, not what it
retires.

**8. The three surviving `meta/activities/patterns/` activities**, their zero exits, and their absence
from every workflow graph. Discriminators: `meta/activities/patterns/README.md:5` states the
library-only design in as many words; `scripts/binding-fidelity-triage.json:7` records the same fact as
a standing guard verdict; `validate-activities.ts` never walks the subdirectory, so their exclusion
from "Total: 125 passed" is the design and not a gap; and design principle 26 names the library by path
as a sanctioned reuse route.

**9. The `#{...}` per-iteration discriminators at all twelve sites.** Discriminators: the design
reserves `#` for exactly this and deliberately picks a full stop as the prefix separator because the
server splits a checkpoint id on the first `#` (README:544-546); three of the twelve discriminate on a
round counter at the top level with no loop involved; and eight of the twelve are outside `work-package`
entirely.

**10. The 28 `combine` output remap lines at the seven convergence sites.** They are 28 copied lines
inside a block CV9 deletes 192 lines of, which makes them look like collateral. Discriminators: they
are the **varying** part — four output ids to seven destination names; `re-derivation.md:136` and
stage 6's criterion at README:900-901 both require them as reference-site bindings; and
`residual_opens` is deliberately unbound at the comprehension site, permitted only because
`combine.md:32` marks it optional. Delete that asymmetry and the comprehension site breaks.

**11. `schema-construct-inventory.md:68`, the checkpoint-fragment row.** Discriminators: it is accurate
in every clause today, verified against three separate source files; it is the corpus's **only**
construct-choice answer for a shared gate, so removing it before the mechanism leaves eight live
reference steps undocumented; and `check-resource-anchors` checks link targets rather than claims, so
nothing would notice.

**12. The two `02-execute-analysis` activities.** Discriminators: no stage of the plan reaches either;
the shared body needs the compose operation as a `kind: technique` parameter, putting it behind stage 7;
and the two `compose-trigger-context.md` files differ by 64 lines, so converging them is a separate
question from naming the run.
