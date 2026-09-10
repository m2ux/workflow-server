# Eighteen of twenty verdicts survive, two fall a rung, and seven of the reasons behind them do not

A refutation pass over [sweeps/design-itself.md](../sweeps/design-itself.md), which swept the
routines proposal at [2026-09-03-routines/README.md](../../2026-09-03-routines/README.md) against the
repository. **I reproduced all twenty candidates, eighteen survive at the verdict the sweep gave
them, two are downgraded, and none is withdrawn outright — but seven of the arguments carrying
surviving verdicts are wrong and are recorded as withdrawn below.** The two downgrades share a
shape: each priced a saving or a prohibition against the wrong owner. CV12 held stage 1's guard
baseline against a rejection that governs a different object — a whole-suite regenerated snapshot —
while a registered guard in the same suite declares the exact falling-only per-guard baseline stage 1
asks for, states it as design, and says the file is absent because the debt is zero. CV5 credited
stage 3 with a saving stage 4 owns, the proposal putting the placement closure in stage 4's criteria
and not in stage 3's.

Twelve of the twenty figures I re-took land on the sweep's number to the digit — 24 duplicate
artifact pairs, 413 input bindings split 346 bare, 49 `effect.exit` options across 28 files, four
loader-consuming guards, 71 textual lines against 63 object lines, 117 of 122 activity files
validated. Six do not, and in four of those six the sweep's own figure beats the proposal's while
still missing the tree: the fan-out run has five occurrences and not four or three-plus-a-variant,
the step-kind comparisons number 64 and not 60 or 57, and CV6's "346 unremapped technique-step
outputs" is CV7's bare-input-binding count reused for an unrelated population that measures 975.

Two things about the ground I measured have to be said before the verdicts.

**The tree moved under the sweep, and it moved again under me.** The sweep names server tooling at
`9ca71c19` and the corpus at `2b8b7215`. When I began, the working tree stood 13 server commits and
14 corpus commits past those; while I was measuring, the corpus submodule advanced again, from
`26e79d8a` to `a4a5d88b`, and files under `workflows/fan-conformance/activities/` were rewritten
mid-session. Every figure below is therefore taken from a fixed extraction of the two commits the
sweep names, so that a disagreement between us is a disagreement about the same bytes. Where the
live tree has since moved in a way that changes the plan rather than a citation, I say so in place —
and it has, decisively, at stage 8.

**Line citations drift and substance does not.** Four of the files the sweep cites changed in those
13 commits (`src/loaders/workflow-loader.ts`, `src/tools/workflow-tools.ts`,
`scripts/check-activity-variables.ts`, `scripts/check-binding-fidelity.ts`). Against the pinned
commit the sweep's citations into them are exact — `deriveActivityContract` at
`scripts/check-activity-variables.ts:147` and `:463`, `populateStepIds` at
`src/loaders/workflow-loader.ts:94`. A reader running the sweep's commands against today's tree will
find those two call sites at `:158` and `:482` and should read that as arrival order, not error. Six
citations are genuinely off by one to five lines and are corrected in place.

## What the verdicts mean

- **REMOVE** — do not build this. The construct is a mechanism the design proposes to ship whose job
  is already done by something in the tree, or whose hazard has no instance the corpus can produce.
  Deleting it from the plan costs nothing mechanical, because it does not exist yet.
- **DEPRECATE** — build a narrower thing now and retire this one on a named schedule. **No candidate
  on this surface earns it.** Nothing here is a live construct with users to migrate; every candidate
  is either unbuilt or a claim, so the middle rung has no member and I record that rather than
  stretching a verdict onto it.
- **NARROWS** — ship it, smaller. The construct has a job, and a strictly smaller version does that
  job at a measured site while the full version buys a case the corpus cannot produce.
- **KEEP** — the construct earns its keep as designed. The extra path, field or mechanism does work
  no existing construct does at the routine grain, and narrowing it would falsify a stage.
- **STALE** — a statement the proposal makes about the repository that the repository answers
  differently. Not a construct, so it has no blast radius of its own; what it has is a stage sized
  off it.
- **WITHDRAWN** — I could not make the case stand. Recorded with the reason, never dropped.

## Survived refutation

| Id | Construct or claim | Sweep | Verified | Confidence |
|---|---|---|---|---|
| CV1 | A routine whose body declares an artifact may be referenced once per activity | REMOVE | **REMOVE** | Confirmed |
| CV2 | The textual splicer over raw YAML, as a second representation | NARROWS | **NARROWS** | Confirmed |
| CV3 | `check-activity-technique-overlap` resolving a reference step to routine bindings | REMOVE | **REMOVE** | Plausible |
| CV4 | `internals` as a third declaration category | REMOVE | **REMOVE** | Confirmed |
| CV5 | A routine referencing another routine, delivered at stage 3 | NARROWS | **KEEP** — downgraded | Confirmed |
| CV6 | A per-output "may be left unbound" marker, with a load failure policing it | NARROWS | **NARROWS** | Confirmed |
| CV7 | A bare `with` argument reads as a literal | NARROWS | **NARROWS** | Confirmed |
| CV8 | "A routine has no free variables" | STALE | **STALE** | Confirmed |
| CV9 | "Materialisation runs after identifier resolution and before contract derivation" | STALE | **STALE** | Confirmed |
| CV10 | "Six guards consume the loader today" | STALE | **STALE** | Confirmed |
| CV11 | "A guard reads the form it audits and the column assignment follows" | STALE | **STALE** | Confirmed |
| CV12 | Stage 1's guard runs from a baseline that can only fall | STALE | **NARROWS** — downgraded | Confirmed |
| CV13 | The technique-valued input parameter | NARROWS | **NARROWS** | Confirmed |
| CV14 | "Delivery is byte-identical", and per-site bundled characters reviewed | STALE | **STALE** | Confirmed |
| CV15 | "A shared run has a use — refused at load" | STALE | **STALE** | Confirmed |
| CV16 | "Every activity that would refer to one declares a single ending" | STALE | **STALE** | Confirmed |
| CV17 | Stage 8's four occurrences of one run | STALE | **STALE** | Confirmed |
| CV18 | The absent-default merge change, described as two lines still to write | STALE | **STALE** | Confirmed |
| CV19 | An exhaustiveness assertion that fails to compile when a kind is added | NARROWS | **NARROWS** | Confirmed |
| CV20 | The reference-site `outputs` remap | KEEP | **KEEP** | Confirmed |

---

# Plan defects

These are the findings that change the plan rather than the code. Each is a fix the design owes: an
acceptance criterion whose mechanism cannot satisfy it, a stage sized off a population that is not
there, or a rule the specification never writes down. They are reported first because a planner who
reads only the verdict table will spend a stage's budget on the wrong thing.

## PD1 — Stage 3's ordering criterion names a stage the loader does not have, and stage 4's boundary depends on which way that is fixed

The contract derivation is not in the load path. `deriveActivityContract`
(`src/utils/activity-variables.ts:417`) has exactly two call sites in the whole repository, both in
one guard script — `scripts/check-activity-variables.ts:147` and `:463` — and the loader never calls
it. So stage 3's fourth criterion, "Materialisation runs after identifier resolution and before
contract derivation, and a test fails if the order is swapped" (README:854-855), asks for an ordering
between a loader function and a guard script's call into a utility. There is nothing to swap.

What survives is the substantive requirement, and it points the opposite way from where the loader
stands. The derivation runs inside `check-activity-variables` over `loadWorkflowWithDiagnostics`
output (`scripts/check-activity-variables.ts:34`, `:97`, `:458`), so a materialisation pass inside
the loader means the derivation only ever meets materialised steps and never meets a reference — the
exact opposite of the boundary stage 4 exists to guarantee. Either the loader exposes both forms, the
materialised activity for delivery and the reference-bearing activity for derivation, or the
derivation moves into the loader so the order exists. Both are unscoped, and stage 4's entire
contribution rests on which is chosen. Detail at [CV9](#cv9).

## PD2 — Stage 8's constituency is wrong in both directions, and half of it has since been deleted from the corpus

Stage 8 names four reference sites: `01-orchestrator-workers`, `04-isolated-fan-out`,
`05-lead-researcher` and the follow-up loop inside it (README:936-937). I resolved every step binding
in all five `meta/activities/patterns/` files at the pinned corpus and counted the four-technique run
— `orchestration-patterns::compose-worker-briefs`, `::dispatch-workers`, `::gather-results`,
`::synthesise-results` — myself. **There are five occurrences across four files, two of them
interrupted by an `action` step:**

| Occurrence | Shape | Deviation |
|---|---|---|
| `01-orchestrator-workers.yaml` | contiguous, after `decompose` | none; `gather` binds `expected_ids: work_units` |
| `02-supervisor.yaml` | **interrupted** — `action announce-escalation` sits between `gather` and `synthesise` | `gather` binds `expected_ids: worker_briefs` |
| `04-isolated-fan-out.yaml` | **interrupted** — `action require-complete` sits between `gather` and `synthesise` | `compose-briefs` carries `isolation_mode: isolation_mode` |
| `05-lead-researcher.yaml` top level | contiguous, after `plan-questions` | none |
| `05-lead-researcher.yaml` `gap-followup` loop body | contiguous, `-followup` step-id suffixes | none |

So the proposal's "four occurrences of one run" (README:776) does not reproduce, and neither does the
sweep's correction to "three occurrences plus one variant". **`02-supervisor` is a fifth occurrence
that stage 8 does not name**, carrying both an interrupting action step and a different `gather`
binding. Stage 8's fourth criterion — "The stage-1 guard's baseline falls by the fan-out windows and
by nothing else" (README:941-942) — cannot hold while a fifth hand-written occurrence stays behind.

The live tree makes this worse rather than better. By the time I measured, the corpus had **deleted
`01-orchestrator-workers.yaml` and `04-isolated-fan-out.yaml`** — the pattern README now routes the
orchestrator-workers pattern to the graph fan ("*(graph)* a destination naming one activity and the
collection to run it over"), and the catalog map lists only supervisor, plan-and-execute and
lead-researcher. Two of stage 8's four named reference sites no longer exist. The stage needs
re-deriving from the corpus rather than editing. Detail at [CV17](#cv17).

## PD3 — The corpus branch has no ratchet, so stages 6 and 8's convergence evidence is graded absolutely on the side it lands

This is what survives of the sweep's CV12 after the downgrade, and it is the half worth keeping.
`check:delta` resolves the submodule commit a tree-ish recorded — `git ls-tree <treeish> workflows`
at `scripts/check-delta.ts:74` — and materialises the merge-base in a throwaway worktree with the
submodule pinned to it (`:88-125`). The corpus branch carries no submodule, and the corpus
pull-request job runs `npm run check:all` and nothing else
(`workflows/.github/workflows/verify-corpus.yml:70`, the job's last step). So on the branch where
stages 5 and 6 land, every guard is graded absolutely and no before-and-after comparison runs at all.

Stage 6's sixth criterion and stage 8's fourth both read "the baseline falls by the windows this
removes, and does not fall by any others" (README:906-907, README:941-942). Those are the only
mechanical evidence either migration converged rather than merely passing, and on the corpus branch
they become a manual comparison of two guard runs. The design owes a criterion that says where the
comparison runs — a server-side pull request that bumps the submodule pointer is the one place
`check:delta` can see both corpora. Detail at [CV12](#cv12).

## PD4 — The per-site delivery review cannot reach two of the four stage-5 hosts, and no flag adds them

The one delivery baseline in the tree is `scripts/fixtures/token-benchmark-baseline.json`, whose
`chars` field is nine per-tool totals (`get_activity` 685,563 of 1,421,070) over a single
twelve-activity `work-package` walk recorded in the same file: start-work-package,
design-philosophy, codebase-comprehension, plan-prepare, assumptions-review, implement,
lean-coding-audit, post-impl-review, validate, strategic-review, submit-for-review, complete.
`04-research` and `05-implementation-analysis` appear nowhere in it, and both declare
`required: false` (`work-package/activities/04-research.yaml:77`,
`05-implementation-analysis.yaml:60`). The benchmark walks "one workflow (`--workflow`, default
`work-package`) under the e2e `skip-optional` policy with the robot walker"
(`scripts/run-token-benchmark.ts:4`); the path is a consequence of that policy, not an argument, so
no invocation of `bench:token` reaches either host.

Stage 5's fifth criterion asks that "the change in bundled characters at each site is reviewed
against the measured prediction rather than accepted by regeneration" (README:890-891), repeated for
stage 6 (README:908). Two of the four stage-5 hosts and two of the seven stage-6 sites are
unreachable, and they are the two carrying census rows 5 and 6. Adding them to the walk changes the
baseline total, so it has to happen before the migration rather than inside it. Detail at
[CV14](#cv14).

## PD5 — The design's own worked signature declares one id as both an input and an output, and the substitution rule has no answer for that

This is a defect neither the proposal nor the sweep names, and I found it inside a construct whose
verdict is KEEP.

`challenge-concerns` declares `concern_document` as an **input** (`re-derivation.md:120-121`) and as
an **output** (`re-derivation.md:124-126`). README:210 says "Inside a routine, its input, output and
internal ids are the names in scope", and README:363-369 says materialisation rewrites every field
that can name a variable, keyed on those ids. At a reference site one id therefore carries two
intended values: the argument under `with` and the destination under `outputs`. At all seven live
sites the two happen to be the same name — `assumptions_log` at the six convergence sites
(`re-derivation.md:200` and `:202`), `comprehension_artifact` at the comprehension site (`:229` and
`:231`) — so the collision is invisible and the worked conversion runs clean.

It stops being invisible the moment a site reads one document and writes another, which is an
ordinary thing for a fold to want. Nothing in the folder addresses it: the reference lifecycle
(README:726-739) has terminal states for unresolved, cyclic, unbound and overbound and none for a
colliding declaration; the substitution table (README:374-379) is keyed on `"{input_id}"` and says
nothing about an id that is also an output; and `re-derivation.md:236-257` walks four rules the
conversion exercises without reaching this one. The design owes either a load failure refusing the
collision or a rule saying which side of the map wins in which field.

## PD6 — Stage 4 asks for a register the tree does not hold

Stage 4's fourth criterion is "Every guard that reads an activity file sits in a recorded column"
(README:874). `GuardSpec` (`scripts/guards.ts:14-26`) declares `id`, `script`, `npmScript`, `scope`,
`json` and `proves`. `scope` is `'corpus' | 'repo'` (`:12`) and its documented purpose is which tree
the delta runner re-runs a guard against (`:9-10`), not which form of a definition a guard reads. The
only column register is the README's own table, which is a planning artifact. The design owes either
a field on `GuardSpec` or a criterion that names the planning table as the register and says who
keeps it current. Detail at [CV11](#cv11).

## PD7 — The free-variable invariant needs three carve-outs the design does not state, and stage 4's walker seed cannot supply them

Stage 4's fifth criterion is "The walker gains a routine-level entry, seeded from the declared
inputs" (README:877). Both signatures in the document the proposal tells a planner to read instead of
the conversion artifacts bind operations declaring inputs the signature does not carry:
`analyse-challenge::challenge` declares `target_path`
(`work-package/techniques/analyse-challenge/challenge.md:12`), `review-assumptions::reconcile`
declares `comprehension_artifact` (`review-assumptions/reconcile.md:12`), and `challenge_findings`
passes from `challenge.md:18` to `combine.md:12` undeclared. A seed drawn from the declared inputs
alone supplies none of the three, so the walk either stalls or invents values. Detail at
[CV8](#cv8).

Two smaller ones, stated once rather than given a section: stage 3's exhaustiveness criterion
(README:856) reaches 37 of 64 step-kind comparisons in 8 of 22 files, because `tsconfig.json` sets
`"include": ["src/**/*"]` and `typecheck` is `tsc --noEmit` — see [CV19](#cv19); and stage 4's "A
routine with no reference site anywhere fails the load" (README:878) names an enforcement strength
one rung above the mirror it cites, whose real home is a guard on the corpus branch where PD3 says no
ratchet runs — see [CV15](#cv15).

---

# The candidates, one at a time

## CV1 — The once-per-activity artifact prohibition {#cv1}

**Verdict: REMOVE. Confirmed.**

I re-parsed all 122 activity files at the pinned corpus, resolved each `step.technique` to its
technique file's `#### artifact` declarations at any loop depth, and counted filenames per activity
file. **24 (filename, activity) pairs across 11 files carry two or more step bindings declaring one
artifact filename, the largest at four steps.** The sweep's figure reproduces to the digit.

| Steps | Filename | Activity file |
|---|---|---|
| 4 | `change-block-index.md` | `work-package/activities/10-post-impl-review.yaml` |
| 3 | `assumptions-log.md` | `04-research`, `05-implementation-analysis`, `07-assumptions-review`, `08-implement` |
| 2 | `code-review.md`, `code-review-method.md`, `test-suite-review.md`, `test-suite-review-method.md` | `work-package/activities/10-post-impl-review.yaml` |
| 2 | five findings filenames | `workflow-design/activities/08-quality-review.yaml` |
| 2 | four findings filenames | `workflow-design/activities/10-post-update-review.yaml` |
| 2 | three drafting filenames | `workflow-design/activities/06-scope-and-draft.yaml` |
| 2 | `investigation-plan.md` | `midnight-system-review/activities/02-area-derivation.yaml` |
| 2 | `source-analysis.md` | `plain-language/activities/02-source-analysis.yaml` |
| 2 | `change-brief.md` | `workflow-authoring/activities/01-intake-and-context.yaml` |

One correction to the sweep's presentation: its table gives `10-post-impl-review.yaml` one row, and
the file actually carries five duplicated filenames. The total of 24 is right; the table displays 20
of them.

The mechanism the design describes is real. `src/tools/workflow-tools.ts:1800-1803` records that the
worker names artifacts as `{artifactPrefix}-{bare_filename}`, and the prefix comes from the activity
filename at `src/loaders/workflow-loader.ts:95` via `parseActivityFilename`. So the design's
arithmetic holds: two references to one artifact-declaring routine in one activity write one filename
twice.

**I tried to break the verdict by asking whether the routine case differs from the 24 measured
pairs, and it does not.** The prefix is the host activity's in both cases; the filename is the
technique's in both cases; the delivered contract collapses both the same way, because
`composeActivityArtifacts` keeps a `seen` set on the filename and emits one entry
(`src/tools/workflow-tools.ts:173`, `:181` — the sweep's citations are exact). No guard in the
40-entry registry (`scripts/guards.ts:28-347`) reports a duplicate artifact filename within an
activity. Writing one filename by N steps of one activity is how the corpus expresses
produce-then-revise, and the step ids say so: `analyze-source` then `revise-source-analysis`,
`audit-conformance` then `re-audit-conformance`.

The assumption run is itself an instance. `review-assumptions::record` declares `#### artifact`
`assumptions-log.md` at `work-package/techniques/review-assumptions/record.md:22`, and `04-research`
binds that operation at three step sites — `:136`, `:227`, `:246`. Two of the three sit inside the run
stage 5 converts, so the routine declares an artifact; the rule, keyed on references to the routine,
sees none of that.

**Blast radius.** Nothing mechanical, because the rule does not exist. What is lost is a warning
about a routine referenced twice whose two runs each want their own artifact, and that case has no
instance: neither shared gate body is referenced twice by any one activity — eight reference sites in
four files, at `04-research.yaml:224` and `:243`, `05-implementation-analysis.yaml:126` and `:145`,
`07-assumptions-review.yaml:112` and `:130`, `08-implement.yaml:202` and `:221`. Removing the rule
also takes the transitive-closure obligation off the artifact-declaration check (README:872-873);
placement still needs the closure and the artifact check no longer does.

## CV2 — The textual splicer as a second representation {#cv2}

**Verdict: NARROWS. Confirmed, and better supported than the sweep argues.**

The line counts reproduce exactly. The textual half is `injectCheckpointFragmentBodies`
(`src/loaders/fragment-resolver.ts:161-211`) plus `scanCheckpointRefLines` (`:218-224`), which with
their doc comments run `:154-224` — **71 lines**. The object half is `materializeCheckpointStep`
(`:96-130`) plus `materializeActivityFragments` (`:137-152`), with doc comments `:90-152` — **63
lines**. Two implementations of the same order of size for a mechanism that replaces one line.

The delivery path is live: `src/tools/workflow-tools.ts:1406` runs `injectResolvedStepIds` over the
file text and `:1412-1415` runs the fragment injector over the result. Stage 3 has eight acceptance
criteria (README:846-863) and **three exist only because the second path exists** — the explicit
prefixed `id:` on every spliced step (README:857-858), the differential test comparing parsed objects
field for field and seven named fields as text (README:859-862), and byte-identical delivery for a
routine-free activity (README:863).

The bet the design makes does not have a date. `src/` holds no runner — its entries are `config.ts`,
`errors.ts`, `index.ts`, `loaders`, `logging.ts`, `middleware`, `resources`, `result.ts`, `schema`,
`server.ts`, `tools`, `trace.ts`, `transports`, `utils`, `worktree-validator.ts`, and
`grep -rln runner src/` matches nothing. The runner exists as three planning folders
(`2026-03-05-headless-slack-runner`, `2026-08-28-runner-execution-protocol`,
`2026-08-30-runner-execution-protocol`). So "written for an arrangement that is ending"
(README:465) is a bet on unscheduled work.

**I tried to break the narrowing by pricing what raw text carries that a serialisation does not, and
the answer is two lines.** Across all 122 activity files at the pinned corpus, **exactly one file
carries any comment line, and there are two comment lines in total.** None of the five migration
hosts carries one. So the narrowing's stated cost — "costs the routine-carrying activities their
comment layout" — is very nearly zero, and the sweep undersells its own case.

The objection I could raise instead is that delivering serialised steps for routine-carrying
activities and raw text for the rest is two delivered forms at a different seam. It does not hold:
the pre-scan already gates the textual path (`src/loaders/fragment-resolver.ts:218-224`), delivery
for the activities carrying no routine stays untouched, and the routine-carrying activities change
their delivered text either way, because materialised steps appear in them.

**Blast radius.** The narrowing is scoped, not a removal: keep `injectCheckpointFragmentBodies` for
gates, where it is live at eight reference sites in four activity files, and decline to build its
routine-sized sibling. Three of stage 3's eight criteria go with it, and so does the class of failure
the proposal names as the one to test hardest — "a worker reading a step the server does not believe
exists" (README:468).

## CV3 — Routine awareness in the activity-technique overlap guard {#cv3}

**Verdict: REMOVE. Plausible. One supporting argument withdrawn.**

The guard's rule is stated at `scripts/check-activity-technique-overlap.ts:4-11` and is hard-zero at
`:10`. It reads `<workflow>/activities/*.yaml` non-recursively at `:57-63`, and `stepBound` (`:39-53`)
recurses generically into any `steps` key at any depth. It passes clean.

**The population, re-measured, and a correction the sweep owes.** Over all 122 activity files, 32
carry a top-level `techniques[]` list holding 33 entries and naming 4 distinct techniques —
`scatter-gather` 26, `execute-cicd-audit` 4, `execute-sub-agent` 2, `variable-binding` 1. The sweep's
figure reproduces exactly. But the guard's own scan is non-recursive, so **it never reads 4 of those
32 files or 4 of those 33 entries**: over `<workflow>/activities/*.yaml` alone the population is 28
files, 29 entries, `scatter-gather` 22. The four it cannot see are in `meta/activities/patterns/`.

Three of the four names are bound as a step nowhere in the corpus; `execute-sub-agent` is bound at
three step sites, all in `substrate-node-security-audit` (`10-sub-crate-review.yaml`,
`11-sub-static-analysis.yaml`, `12-sub-toolkit-review.yaml`), and the two activities that list it are
in a different workflow (`cicd-pipeline-security-audit/activities/06-sub-verification.yaml`,
`07-sub-merge.yaml`). No activity both lists and binds one technique.

**The verdict survives because the routine-awareness change has no site in the plan.** Stage 5's
routine binds `review-assumptions::*`; stage 6's two bind `analyse-challenge::challenge`,
`::combine` and `review-assumptions::reconcile`; stage 7's binds `full-prism::*` and
`behavioral-pipeline::*` by parameter; stage 8's binds `orchestration-patterns::*`. None of the four
listed names appears among them. The design itself calls this change "the one place the
authored/materialised split is not by itself sufficient" (README:1048-1050), and stage 4 is the stage
whose own section admits four unscoped loader moves. A hard-zero guard gaining an admitted exception
for a finding class with no member is the wrong use of that budget.

**Confidence is Plausible rather than Confirmed** because the residue is real: 6 of the 29 entries the
guard can see name operation-bearing techniques a step *can* bind, and a future author who lists
`execute-sub-agent` at an activity and binds it from a routine would produce exactly the overlap the
guard would then miss. The verdict is "not at stage 4", not "never".

**Withdrawn: the sweep's alternative.** It proposes "retire the activity-level list itself — 33
entries, 4 names, 26 of them one name — and the guard goes too", citing the canon rule that a
prohibition usually means two constructs do one job. The canon rule is real —
`workflows/workflow-design/resources/design-principles.md:161-163`, "**35. Prefer Removing the Thing
That Needs a Prohibition**" — and its second sentence rules the alternative out: "Where both paths
must survive, the prohibition names the home that owns the surviving behaviour rather than restating
it." Both paths must survive here. `meta/techniques/scatter-gather.md` and
`meta/techniques/variable-binding.md` are capability files declaring `## Capability`, `## Protocol`
and `## Rules` and **no operations at all**, so no step can bind either one; the activity-level list
is their only home, and it holds 23 of the 29 entries the guard reads. The guard's own header names
those two as the intended content of the list (`:4-5`: "for the cross-cutting STRATEGY/capability
techniques (e.g. `variable-binding`, `scatter-gather`) that support the agent across the WHOLE
activity"). Retiring the list would delete the only home for the majority of its entries.

## CV4 — `internals` as a third declaration category {#cv4}

**Verdict: REMOVE. Confirmed.**

The subtraction reproduces. `assumption_review_presentation` and `current_assumption` are declared
writes at exactly four activities each — `04-research`, `05-implementation-analysis`,
`07-assumptions-review`, `08-implement` — for eight declarations, and `challenge_findings` is a
declared write at **seven** activities, the six convergence hosts plus `15-codebase-comprehension`.
That corrects README:208 and README:905, which say six, and it corrects `re-derivation.md:256-257`,
which says six as well. Fifteen declarations go either way, because the writes move into the routine
and the names leave the workflow namespace when the last host declaration does.

**What the category buys mechanically is nothing, and I verified the alternative is available rather
than merely conceivable.** The contract derivation already gives an undeclared name the standing an
internal wants: `read` returns early on a name outside the declared namespace
(`src/utils/activity-variables.ts:452`), and `write` adds to `writes` only inside it (`:475`). And the
two findings the category exists to produce are derivable from sets the derivation already returns.
`DerivedContract` exposes `produces` (`:192`) and `mentions` (`:198`), each documented as deliberately
wider than its narrow counterpart — "It is wider than `writes` on purpose: `writes` is narrowed to the
declared namespace, and the namespace is assembled from the declarations, so a production no
declaration mentions cannot appear there at all". A routine-body checker comparing `mentions` against
`produces` reports a name read with no producer, and a name written that nothing reads, without any
declaration category. That is precisely the pair README:869-871 asks for.

**The sweep's correction to `guard-obligations.md` holds.** `check-activity-variables` ·
`undeclared-use` reads `record.derived.reads` and `record.derived.writes`
(`scripts/check-activity-variables.ts:202`, `:213`), both namespace-filtered, so a prefixed internal
never reaches either. Its `undeclared-crossing` rule (`:234`) does read the wider `produces` and
`mentions`, but only fires when another activity in the workflow mentions the name — "A production
nothing consults elsewhere is not reported" — and a name carrying its host activity and reference site
cannot be mentioned elsewhere. So the rule does not fire, and the unspecified mechanism the ground
truth asks for is already there and is neither of the two it names: it is the namespace filter, which
predates the design.

**I tried to break the verdict on the one job derivation cannot do, and that job has no site
either.** README:1052-1065 has `check-variable-model` gain a name scope so that "a declared output or
internal satisfies `setvariable-undeclared`". I read both shared gate bodies
(`work-package/workflow.yaml:17-71`) and every `setVariable` target in them is `assumption_outcome`,
`has_deferred_assumptions` or `needs_individual_interview` — all three declared **outputs** in the
proposal's own example signature (README:231-239). No gate in either body targets an internal, so the
name-scope argument buys nothing at its own site.

The design's own signatures do not use the category. `challenge-concerns` (`re-derivation.md:110-157`)
declares no `internals` block and its body needs one: `analyse-challenge::challenge` declares output
`challenge_findings` (`challenge.md:18`) and `::combine` declares it as an input (`combine.md:12`),
which is the hand-off README:189-190 names as the convergence run's one internal.
`converge-assumptions` (`re-derivation.md:159-206`) declares none either, while
`re-derivation.md:100-101` says it "declares no inputs, four outputs, one internal".

**Blast radius.** Removing the category before stage 5 removes nothing the migration needs. Removing
it after a `routines/` schema has shipped with an `internals` key is a schema change against authored
files. Keeping it costs one more declaration category, one more load failure to specify and test, and
schema surface for a category both worked signatures omit.

Two citation corrections: the closest-producer doc comment the sweep cites as
`src/utils/activity-variables.ts:409-411` is at `:413-415`, and `readSignature`'s prose filter it
cites as `:387` is at `:389`.

## CV5 — Nesting delivered at stage 3 {#cv5}

**Verdict: KEEP. Downgraded from NARROWS. Confirmed.**

The sweep's factual case reproduces exactly. Nesting is load-bearing where the proposal says it is:
the seventh convergence site cannot hold the three-step window because `revise-questions` sits
between its analysis and its challenge (`work-package/activities/15-codebase-comprehension.yaml:92-94`),
so what all seven share is the two-step `challenge` → `combine` pair and what six share is that pair
plus `reconcile`. And its first consumer is stage 6, not stage 3: the assumption run stage 5
converges is flat — five top-level steps at `07-assumptions-review.yaml:106-141`, an announcement, a
gate, a record, a `forEach` whose body is three steps, and a closing record, with no reference to any
second run. The nested reference is written out at `re-derivation.md:195-205`.

**The verdict falls a rung because one of the three savings the narrowing claims belongs to a
different stage.** The sweep says refusing nesting at stage 3 "takes cycle detection, the placement
closure and the nested-map substitution arm out of stage 3". Placement is not in stage 3. Stage 3
lands "the `routines/` directory, the `kind: routine` step, resolution, materialisation, identifier
prefixing, and the load failures" (README:771), and the placement closure is stage 4's third criterion
— "Placement is computed and enforced, with a referrer being an activity file or another routine,
closed transitively" (README:872-873). So the narrowing removes two things from stage 3, not three:
cycle detection, and the substitution arm covering a nested reference's own `with` and `outputs` maps.

Against those two savings sits a cost the sweep does not price. Refusing a construct at stage 3 and
admitting it at stage 6 ships a load failure whose deletion is scheduled — a prohibition the plan
plans to remove. The canon rule the sweep itself invokes for CV1 and CV3 reads against that:
`design-principles.md:161-163`, "Prefer Removing the Thing That Needs a Prohibition". And the schema
already recurses: `LoopStepSchema`'s `steps` field is `z.array(z.lazy(() => StepSchema))`
(`src/schema/activity.schema.ts:162`), so a `kind: routine` member of `StepSchema` is legal inside a
routine body the moment it is legal anywhere. Refusing it is added mechanism, not withheld mechanism.

So: ship nesting at stage 3 as designed. The one thing the narrowing would genuinely buy — deferring
cycle detection past the stage the proposal calls load-bearing (README:780) — is worth naming for the
plan owner, and it is not worth a scheduled prohibition.

**Blast radius, and it is one-way.** The sweep's direction argument survives the downgrade and is
worth carrying: admitting nesting later is additive and changes no authored file, while removing it
after stage 6 has authored `converge-assumptions` referencing `challenge-concerns` would break the one
shared body the convergence migration exists to create. Whichever way this goes, it is decided at
stage 3.

## CV6 — A per-output marker for an output that may be left unbound {#cv6}

**Verdict: NARROWS. Confirmed. One supporting count corrected and one replacement withdrawn.**

The constituency reproduces exactly: the marker is written once in the whole folder, as
`unbound: permitted` on `residual_opens` (`re-derivation.md:136`). Six convergence sites bind all four
of the fold's output ids; the comprehension site binds three —
`concern_document: comprehension_artifact`, `concerns_agent_resolvable: needs_comprehension`,
`residual_opens_remain: has_open_questions` at
`work-package/activities/15-codebase-comprehension.yaml:109-111` — and drops `residual_opens`. **One
schema field, one marked output, one unbound site out of seven.**

The design's stated reason for the marker is false, and I verified the mechanism. A technique step's
unremapped output lands under its own id — `for (const output of signature.outputs) if
(!remapped.has(output)) landed(output, output)` at `src/utils/activity-variables.ts:535` — and
`landed` calls `write`, which is namespace-filtered at `:475`. A name no workflow declares never
enters the workflow's variable set; it lands in `produces` and stops. So an unremapped routine output
falling back to its own id does not "put a routine's internal name into the session bag"
(README:307-309) by any mechanism in the loader or the derivation.

**Correction: the count carried into the sweep's own argument.** It writes "which is equally true of
the 346 unremapped technique-step outputs already in the corpus". 346 is CV7's count of *bare input
bindings*, reused for an unrelated population. I measured the real one: resolving every
`step.technique` reference to its technique file's `## Outputs` section and counting each `### <id>`
per step site, the 122 activity files carry **1,026 declared technique-step outputs of which 51 are
remapped, leaving 975 unremapped**. (The corpus carries 57 remap entries; 6 of them name an output my
rule does not find under `## Outputs`, most likely inherited outputs.) The sweep's argument is much
stronger than its number.

**Withdrawn: the sweep's replacement for the load failure.** It says an unbound output is "reportable
by the routine-body checker as an output nothing consumes". The routine-body checker sees the routine,
not the reference sites, so it cannot see a site that drops an output the other six bind — which is
exactly the corpus's one case. A corpus-wide reference sweep can only see an output *no* site binds.

**I then tried to break the verdict on that gap, and it holds anyway,** because the drop is caught
downstream where the corpus catches it for all 975 unremapped technique-step outputs: a host activity
that needed the value reads a name nothing writes, and `undeclared-use`
(`scripts/check-activity-variables.ts:202`) and the binding-fidelity guard report it at the reader.
The marker buys a slightly earlier error for one output at one site, at the price of a schema field, a
load failure and a rule every routine author learns.

One thing an implementer must not do while removing the marker: bind `residual_opens` to an invented
name at the comprehension site. `combine.md:31` declares it *(optional)*, and the site declares no
name for the collection — `has_open_questions` is the boolean. Binding it to a name nothing reads
trades a silent drop for an unread write.

## CV7 — A bare `with` argument reads as a literal {#cv7}

**Verdict: NARROWS. Confirmed. The central supporting argument withdrawn and replaced.**

The population reproduces to the digit. Parsing every `step.technique` object binding in all 122
activity files: **413 input bindings — 346 bare strings, 61 containing a brace, 6 non-string.** And
the 193 does not reproduce: the figure appears **once in the entire planning folder**, at README:297,
with no source, and nothing in the tree names a migration settling the braced-versus-bare question at
a binding site.

The existing reading is resolved at read time, and the code says so: `src/utils/binding-provenance.ts:312-318`
— "A bare string is a rename when it names a resolvable bag entry, otherwise a literal — statically
indistinguishable, so an unmatched bare value is reported as the literal it most likely is rather than
flagged." The schema description agrees (`src/schema/activity.schema.ts:65`) and the derivation
implements it at `src/utils/activity-variables.ts:467-470`, matching on the whole string against the
namespace.

**Withdrawn: "a third reading at a site adjacent to 346 instances of the second".** There is no third
reading, and `check-set-action-values` is a precedent *for* the design's choice rather than a
counter-example to it. Its header states the repository's decided position on this exact question:
"A `value` that names another variable has to be braced … because an unbraced one is the literal
string" (`scripts/check-set-action-values.ts:12-13`); "`variable-binding` already draws this line: a
bare string is a rename only where it matches the bag's own naming and resolves there, and a literal
otherwise. Nothing checked it" (`:17-18`); "So a `value` shaped like a name … is refused unless it is
braced. … **A rename written bare is refused too, though none exists; one spelling for reading a
variable is the point**" (`:20-23`); and "Hard zero, no baseline. … added later this arrives with a
debt list and an argument over each entry" (`:26-27`). That is the design's reasoning, already
adopted, at a field with no legacy.

**The verdict survives on the design's own worked example, which is where the real finding is.**
`re-derivation.md:200` binds the nested reference with `concern_document: assumptions_log` — bare.
Under README:376-378 that materialises as the literal characters `assumptions_log`, which then land at
a technique-step input binding where the dynamic reading resolves them as a rename. It works, by the
reading the design declines to adopt, and `re-derivation.md:238-243` says so approvingly: "the
technique step's own name-match resolution then reads the document as it does today". So two readings
sit in one value path, and the design admits the bare form at the reference site where the tree's own
precedent refuses it.

Narrow it to what the precedent already decided: require every `with` value that names something to
be braced, and refuse a bare value that resolves in the host's declared namespace — the check
`readWholeName` already performs (`src/utils/activity-variables.ts:467-470`).

**Blast radius.** Decided before any file is authored, so getting it wrong is paid by every routine
reference site written afterwards. Deciding it after stages 5 and 6 have authored ten reference sites
means re-reading ten `with` maps under a changed rule, with no guard able to tell a rename from a
literal.

## CV8 — "A routine has no free variables" {#cv8}

**Verdict: STALE. Confirmed.**

The invariant (README:210-214, restated at README:757-758 and README:527-530) fails in three places
and I verified each.

*The corpus run.* At `work-package/activities/07-assumptions-review.yaml:106-141` the run reads
`is_review_mode` (`:109`, `:116`, `:123`, and the per-item gate's condition at `:131-135`),
`has_open_assumptions` (`:109`, `:116`, `:123`), `needs_individual_interview` (`:116`, `:123`),
`open_assumptions` (`:122`), `current_assumption` (`:129`, and `work-package/workflow.yaml:51`), and
`assumption_review_presentation` through the shared gate's message
(`work-package/workflow.yaml:29`). Every one of the sweep's line citations is exact. Three of those
names — `is_review_mode`, `has_open_assumptions`, `open_assumptions` — are in none of the proposal's
three declaration lists.

*The example.* README:216-275 declares inputs `gate_message` and `decision_space`; outputs
`has_deferred_assumptions`, `needs_individual_interview`, `assumption_outcome`; internals
`assumption_presentation` and `current_assumption`. Its loop reads `over: open_assumptions`, which is
in none of the three. **The sweep cites README:258 for that line; it is at README:260.**

The example's second defect I verify on firmer ground than the sweep gives it. The sweep says the
declared internal `assumption_presentation` is "never written or read in the body it shows", which
rests on the elided `options: [...]` at README:251 and README:271. It does not need to. README:288
shows the host passing the presentation *through the argument*:
`gate_message: "Open assumptions remain after research ({assumption_review_presentation}). …"`. The
presentation arrives from the host inside `gate_message` and never becomes the internal at all, so the
internal is declared and unreachable — which README:205-206 makes a load failure.

*The re-derived signatures.* `converge-assumptions` (`re-derivation.md:159-206`) declares no inputs
and four outputs, and its first body step binds `review-assumptions::reconcile`, which declares the
input `comprehension_artifact` (`reconcile.md:12`). `challenge-concerns` (`:110-157`) declares two
inputs and four outputs, and its body binds `analyse-challenge::challenge`, which declares the input
`target_path` (`challenge.md:12`), and passes `challenge_findings` from `challenge.md:18` to
`combine.md:12` without declaring it.

Two of those three names are marked *(optional)* and are therefore `suppliable` in `readSignature`
(`src/utils/activity-variables.ts:377`), so `deriveActivityContract` calls `consume` rather than
`read` (`:517-518`) and they never enter the derived reads. That is why the claim survives a
derivation-based check while failing as stated — and why a signature check that trusts the derivation
will report it clean.

**Blast radius.** Four things rest on the invariant. The tight boundary (README:527-530) is not
tighter than a technique's, only differently sized: with three more names as inputs the assumption
routine's signature grows from two to five and the referring activity reads them anyway. Isolated
checking (README:625, stage 4's criterion at README:869-871) cannot hold a body against its
declaration without deciding which names are exempt. The walker's routine-level entry (README:877) is
[PD7](#pd7). And `check-binding-fidelity` sees every routine-input read as unresolvable by
construction, against an input count that is understated.

## CV9 — "Materialisation runs after identifier resolution and before contract derivation" {#cv9}

**Verdict: STALE. Confirmed. This is [PD1](#pd1).**

`deriveActivityContract` is declared at `src/utils/activity-variables.ts:417` and has exactly two
call sites in the whole repository, both in one guard script — `scripts/check-activity-variables.ts:147`
and `:463`. The loader never calls it.

The loader's own order, per `src/loaders/workflow-loader.ts`, is: read and `parseDefinition`, then
`safeValidateActivity` (`:87`), then `populateStepIds` (`:94`), then `artifactPrefix` from the
filename (`:95`), then fragment materialisation and rule splicing during
`loadWorkflowWithDiagnostics`, then variable merge and exit binding. The first half of the ordering
claim reproduces — identifiers are populated before fragment materialisation — and the second half
names a stage the loader does not have.

I could not find a way to read the criterion as testable. There is no in-loader order to swap, and a
test asserting an ordering between a loader function and a guard script's call into a utility is not
a test of the loader. The design's substantive requirement survives and needs restating; the two ways
to give it a home, and why the choice decides stage 4's whole contribution, are in [PD1](#pd1).

## CV10 — "Six guards consume the loader today" {#cv10}

**Verdict: STALE. Confirmed. And the sweep's method here is the one to copy.**

Grepping the workflow loader's entry points over `scripts/*.ts` at the pinned commit returns seven
files: `check-activity-variables.ts` (`:34`, `:97`, `:458`), `check-all-refs.ts` (`:11`, `:34`),
`check-stealth-isolation.ts` (`:38`, `:144`), `validate-workflow-yaml.ts` (`:17`, `:130`),
`check-session-contract.ts` (`:31`, `:73`), and two non-guards, `coverage-scope.ts` (`:32`) and
`run-batch-benchmark.ts` (`:73`). So **four registered guards consume the workflow loader, plus
`check-session-contract`, which the registry excuses by name at `tests/guard-registry.test.ts:77-87`**
— "asks whether a run stayed inside its contracts, so it needs a session and has no corpus-wide form".

The proposal names `check-audience` and `check-artifact-guides` among six consumers. Neither opens an
activity file. Both read technique markdown through the markdown technique loader
(`scripts/check-audience.ts:35`, `scripts/check-artifact-guides.ts:38`) and both declare their own
local `loadWorkflowTechniques` helper — `check-audience.ts:74`, `check-artifact-guides.ts:195` — which
is what a grep on the name `loadWorkflow` catches. **The sweep read the consumers rather than trusting
the grep, and the nominal collision is exactly the failure mode that would have made this candidate
wrong.** And `validate-workflow-yaml`, a real consumer, is unnamed by the proposal.

**Blast radius.** Stage 4's criterion "the guards that have to move onto the loader have moved"
(README:876) is sized off the wrong figure. README:1069-1071's own admission — "that column states
where four guards *should* sit, and moving each one there is unscoped work" — is the accurate
sentence, and it contradicts the list two dozen lines above it. A planner working from the list will
budget for two guards that are already elsewhere and miss one that is not.

## CV11 — "A guard reads the form it audits and the column assignment follows" {#cv11}

**Verdict: STALE. Confirmed. This is [PD6](#pd6).**

There is nowhere to record a column: `GuardSpec` (`scripts/guards.ts:14-26`) declares `id`, `script`,
`npmScript`, `scope`, `json` and `proves`, and `scope` is `'corpus' | 'repo'` (`:12`) for the delta
runner's benefit (`:9-10`).

The classification does not hold either. None of the four guards the table puts in the materialised
column — `check-checkpoint-entry`, `check-decision-order`, `check-review-mode-gating`,
`check-binding-fidelity` — appears among the loader consumers of CV10; all four parse raw activity
YAML, the last one resolving the fragment mechanism itself before reading
(`scripts/check-binding-fidelity.ts:493`; the sweep cites `:529`, which matches neither the pinned
commit nor today's tree, where it sits at `:534`).

I reproduced the coverage arithmetic by enumeration rather than carrying it. The first table places
eleven guards (seven authored, four materialised), the prose adds `check-harness-adapter-set`, the
second table adds eight of which `check-activity-technique-overlap` is a repeat, and two more fall
outside the classification — **21 distinct guards of the registry's 40, leaving 19 unplaced.** Two
further figures in the same section do not reproduce: README:1021's "thirty-seven scripts" and
README:611's "35-script" suite, against **44 `check-*`/`validate-*` scripts on disk and 40 registered**.

**The sweep's unnamed consequence holds, and needs one more discriminator than it gives.**
`check-review-mode-gating` is placed in the materialised column (README:1012). It reads
`<workflow>/activities/*.yaml` non-recursively (`scripts/check-review-mode-gating.ts:198-206`) and
exempts a mode-aware checkpoint by matching the literal `is_review_mode` in a step's `when` (`:113`)
or condition (`:88-108`). But it is gated three more times before it reaches a gate at all: the
workflow must declare `is_review_mode` (`:195-196`), the activity must be reachable in review mode
(`:208`, via `reachableInReview` at `:153`), and the checkpoint must carry a consequential default
(`:214`). A `ref:` checkpoint parsed as raw YAML carries no `options`, so the last gate already
excludes all four of the assumption run's batch gates today. So this is a coverage loss the migration
inherits rather than one it creates — which is the sweep's own conclusion, reached for a stronger
reason than the one it gives.

## CV12 — Stage 1's guard runs from a baseline that can only fall {#cv12}

**Verdict: NARROWS. Downgraded from STALE. Confirmed. The central claim withdrawn.**

**Withdrawn: "this repository removed stored guard baselines and recorded why", so the criterion is
"buildable by re-introducing, for one guard, the exact mechanism the delta runner's header rejects on
principle."** The repository carries that mechanism right now, in a registered guard, declared as
design rather than tolerated as practice.

`scripts/check-artifact-guides.ts` is guard `artifact-guides` in the registry (`scripts/guards.ts:116`).
It declares `const BASELINE = resolve(join(DIR, 'artifact-guide-baseline.json'))` at `:44`, a
`loadBaseline` at `:80`, and a stale-entry rule emitting `artifact-guide-baseline-stale` at `:274-281`.
Its header states the convention in the terms stage 1 needs:

- `:20-24` — "An artifact that resolves neither way is a finding, unless `artifact-guide-baseline.json`
  records it as an accepted gap with a classification. **The baseline is not a snapshot to
  regenerate**: an entry is a judgement about one artifact … **Adding a new artifact with no guide
  fails the guard; closing a baselined gap means deleting its entry.**"
- `:26-27` — "Every corpus artifact resolves today, **so no baseline file exists** — the triage is the
  escape hatch for a deliberate gap, not a standing allowance."
- `:29-31` — "A baseline entry matching no declaration is itself reported … so the triage cannot
  outlive the debt it records."

That is stage 1's fourth criterion — a baseline of what is present when it lands, which can only fall
— already built and already named `baseline`. What `check-delta.ts:4-6` rejects is a different object:
"A stored baseline is a cache of 'what did this guard report before my change'. It drifts, it needs
pruning PRs, and it silently absorbs real defects (issue #327 R1)." A whole-suite regenerated snapshot
of every guard's output is not a per-finding human judgement with a stale-entry rule. Three populated
ledgers implement the same convention — `scripts/binding-fidelity-triage.json` (70 entries, whose own
note says "There is no regenerate flag — an entry is a human judgement, which is exactly what the
baseline never required"), `scripts/canonical-home-map-triage.json` (4), and
`scripts/nested-output-home-triage.json` (2).

The sweep half-saw this — it lists the three ledgers and calls them "a falling-only discipline in
practice" — and then reasoned from `check-delta.ts`'s header as though it governed them. It does not.
`artifact-guide-baseline.json` being absent is the success state the header describes, not evidence of
removal.

**What survives is the narrowing, and it is [PD3](#pd3).** `check:delta` resolves the submodule commit
a tree-ish recorded (`scripts/check-delta.ts:74`) and materialises the merge-base with the submodule
pinned to it (`:88-125`). The corpus branch carries no submodule, and its pull-request job runs
`npm run check:all` and nothing else (`workflows/.github/workflows/verify-corpus.yml:70`). So stage 1's
guard is buildable in the shape the suite already uses, and on the branch where stages 5 and 6 land it
grades absolutely with no ratchet correcting it. Stages 6 and 8's "the baseline falls by these windows
and no others" criteria need to say where the comparison runs.

## CV13 — The technique-valued input parameter {#cv13}

**Verdict: NARROWS. Confirmed. Two figures corrected.**

The family is two sites sharing a body and one variant, and I re-took the deltas.

`02-adversarial-pass.yaml` against `03-synthesis-pass.yaml` is **5 hunks touching 8 lines** — the
activity `id`, `name` and `description`, the loop `id` and `name`, the step `id`, and the technique
reference (`full-prism::adversarial` against `full-prism::synthesis`). The sweep says six hunks; I get
five.

`02` against `05-behavioral-synthesis-pass.yaml` is **22 changed lines**, reproducing exactly, with
three substantive differences beyond the operation, all at the lines the sweep names: it reads
`behavioral_output_paths` rather than `all_artifact_paths` for `prior_artifact_paths` (`:33`), its gate
compares `current_unit.pipeline_mode == 'behavioral'` rather than `'full-prism'` (`:38`), and its
declared reads differ (`:7-8`).

All three files are **41 lines**, not the sweep's "41, 41 and 42". Each is one 20-line `forEach` at
`:19-38`, one exit (`done`, `:39-41`), an activity-level `techniques: - scatter-gather` list at
`:16-17` that no step binds, and — the figure that carries the verdict — **zero checkpoint steps.**

**The verdict survives on that last measurement.** Stage 7's third criterion turns three guarantees
into per-reference-site checks: "the contract, whether the body declares an artifact, and whether every
gate option is exercised" (README:918-921). The third has no site: there are no gates. So a third of
the price the feature is "already priced at" buys nothing at the family it exists for. Ship the
parameter only if stage 7 also states which of the two remaining checks actually differ per site for
these routines, and name `05` as a second routine or a second input rather than a third reference to
the first.

**Blast radius.** Stage 7 depends only on stage 4 and nothing depends on it (README:795-800), so
deferring or reshaping it costs no other stage. Shipping it early is the expensive direction: the day
one routine binds a technique by parameter, "every routine's contract is derivable in isolation" stops
being a fact about the tree and becomes a fact about a subset, and stage 7's fourth criterion requires
"every place claiming them universally is updated" (README:922-923) — including the guarantee tables at
README:609-629.

## CV14 — Byte-identical delivery, and per-site bundled characters reviewed {#cv14}

**Verdict: STALE. Confirmed. This is [PD4](#pd4).**

There is no per-activity delivery artifact in the tree. `scripts/fixtures/token-benchmark-baseline.json`
holds nine per-tool `chars` totals over one twelve-activity `work-package` walk, and its own `path`
field lists that walk. `research` and `implementation-analysis` are absent from it, and both declare
`required: false`. The gate is aggregate and one-directional: `DEFAULT_MAX_REGRESSION_PCT = 1` at
`scripts/run-token-benchmark.ts:175`, run as `bench:token --gate` from `.github/workflows/verify.yml:70`,
failing on a regression only. Byte-identity is not what it measures.

**I tried to break the "unachievable" half by looking for a way to aim the benchmark at the two
missing hosts, and there is none.** The walk is "one workflow (`--workflow`, default `work-package`)
under the e2e `skip-optional` policy with the robot walker" (`:4`); the path is what that policy
produces, not a parameter. So the criterion is unreachable at those sites without changing the walk
policy or the graph, either of which moves the baseline total.

One thing to add. The recorded baseline names `workflowsRev: 95660422` and describes itself as
"Recorded 2026-09-07 against workflows@95660422". The corpus has moved past that commit already, so
the one artifact the criteria are held against is stale before the migration starts, and the committed
walk snapshots carry their own corpus stamp separately
(`tests/e2e/__snapshots__/corpus-sha.json`, whose note says to update it "in the same commit that
bumps the workflows submodule and re-baselines the walk").

## CV15 — "A shared run has a use — refused at load" {#cv15}

**Verdict: STALE. Confirmed on enforcement strength. The feasibility half withdrawn.**

The mirror is a guard, not a load. `unused-fragment` is emitted at `scripts/check-fragments.ts:242`,
inside a corpus-wide sweep that first collects `usedCheckpointFragments` across every workflow's
activities and then walks every workflow's declared fragments (`:235-249`). It is one of nine rules in
the guard's union type (`:56-65`). The loader's only fragment diagnostic is a warning on an unparsable
block — `logWarn('Invalid fragments block; refs into it will not resolve', …)` at
`src/loaders/workflow-loader.ts:207`.

So README:629's claim — "A routine with no reference sites fails, mirroring the finding an unreferenced
shared gate body already produces" — names an enforcement level the mirror does not have. The
neighbouring placement row (README:614) contradicts itself in one sentence: "**Refused at load** …
Placement is computed from referring files and a guard enforces it."

**Withdrawn: "A load cannot answer the question."** It can, expensively. `listWorkflows` sits in the
same module as `loadWorkflow`, and reading every workflow's activity files for `kind: routine` steps is
a directory scan, not the recursion `readWorkflowFragments` forbids — its doc comment
(`src/loaders/workflow-loader.ts:193-197`) rules out re-entering a *full load*, which a filename and
step-kind scan does not do. The objection to putting it at load time is cost and shape, not
possibility.

The substantive finding stands either way. `loadWorkflow(workflowDir, workflowId)`
(`src/loaders/workflow-loader.ts:241`) loads one workflow, `buildFragmentsLookup` (`:221`) pre-reads
only the blocks a given activity's refs name (`:235-239`), and the shared home is `meta`
(README:314-316) — so a routine in `meta` referenced from `work-package` is unreferenced from `meta`'s
own load. The correct home is a guard alongside `unused-fragment`, and stage 4's criterion should say
so, which also means the finding lands on the corpus pull request where [PD3](#pd3) says no ratchet
runs.

## CV16 — "Every activity that would refer to one declares a single ending" {#cv16}

**Verdict: STALE. Confirmed and strengthened.**

I read each referring activity's `exits[]` and counted every checkpoint option carrying `effect.exit`
at any loop depth.

| Site | Exits declared |
|---|---|
| `work-package/activities/07-assumptions-review.yaml` | **5** — `needs-comprehension`, `needs-plan-revision`, `needs-further-discussion`, `review-mode`, `assumptions-approved` |
| `work-package/activities/15-codebase-comprehension.yaml` | **4** — `needs-elicitation`, `research-needed`, `skip-optional-activities`, `comprehension-complete` |
| `work-package/activities/02-design-philosophy.yaml` | **2** — `revise-classification`, `done` |
| `work-package/activities/06-plan-prepare.yaml` | **2** — `done`, `revise` |
| `04-research`, `05-implementation-analysis`, `08-implement` | 1 — `done` |
| `meta/activities/patterns/01`, `02`, `04`, `05` | **0** |

**Corpus-wide, 49 checkpoint options across 28 activity files carry `effect.exit`** — reproducing
exactly — and two of them sit in convergence hosts: `02-design-philosophy.yaml:108`
(`exit: revise-classification`) and `06-plan-prepare.yaml:178` (`exit: revise`). The schema is explicit
about what such an option names: "Exit of the owning activity this option selects — a name from the
activity's `exits[]`" (`src/schema/activity.schema.ts:51`).

One correction, in the sweep's favour: it lists three pattern activities declaring zero exits. There
are **four** — `02-supervisor.yaml` too, which is also the occurrence stage 8 omits ([PD2](#pd2)).

**Blast radius.** The rule may well be right and its evidence is wrong, and the wrong evidence hides a
second hole: `effect.exit` names a host exit id, a name outside the three declaration categories, and
the substitution field list (README:364-368) covers "an option's effect names and values" without
saying what happens to an `exit` with no binding at the reference site. No gate inside the runs stages
5 and 6 convert carries one today — both shared fragment bodies at `work-package/workflow.yaml:17-71`
carry `setVariable` only — so nothing breaks immediately. The four pattern activities declaring zero
exits are the sharper version: a routine cannot select an exit from an activity that has none.

## CV17 — Stage 8's four occurrences of one run {#cv17}

**Verdict: STALE. Confirmed on the population, which is understated. The "outside everything" framing
withdrawn. This is [PD2](#pd2).**

The population is in [PD2](#pd2): **five occurrences of the four-technique run across four files, two
of them interrupted by an `action` step**, and `02-supervisor` unnamed by the stage. Stage 8's second
criterion leaves one variant unresolved — "The completeness `validate` at `04-isolated-fan-out` stays
with the referring activity or becomes a declared input, and the record says which" (README:937-938) —
and the same choice now arises twice, at two different activities, with two different interrupting
steps. And two of the four named sites have since been deleted from the corpus.

**Withdrawn: "The site is outside everything."** The sweep's mechanics are right and its reading of
them is not. The mechanics: all five pattern activities live in a subdirectory,
`loadActivitiesFromDir` (`src/loaders/workflow-loader.ts:72-107`) reads one directory with `readdir`
and skips any entry `parseActivityFilename` rejects, no `workflow.yaml` in the corpus references them,
and `npm run check:activities` validates **117 of the corpus's 122 activity files** — I ran
`scripts/validate-activities.ts` against the live tree and it reports one `[PASS]` per top-level
activity file and none for `patterns/`, so the figure reproduces exactly.

But being unreferenced is the *designed* state of these files, and the repository says so in three
places. `meta/activities/patterns/README.md:5`: "They are **not** part of meta's lifecycle graph
(`loadActivitiesFromDir` is non-recursive — this subdirectory is library-only)."
`scripts/binding-fidelity-triage.json:5`, the `shared-op-return-contract` rationale: "Library ops are
bound ad hoc by any workflow, so **having no consumer inside the corpus is the expected state of a
library, not a broken seam**." And `:7`, `pattern-library-seed`: "A borrowable pattern activity binds
an op whose input the BORROWING workflow seeds … **Producers resolve per-workflow, so the library home
can never show one.**" `scripts/check-binding-fidelity.ts:537-542` records that the guard was changed
to walk nested library subdirectories precisely because mirroring the loader's non-recursion "left
`meta/activities/patterns/` completely unmeasured".

So the authored-form guards do read these files, and stage 4 puts a routine's own contract check in the
authored column, where it does not depend on the routine being loaded through a workflow. What survives
of the objection is narrower and still true: materialisation is a load-time pass and never runs at
these sites, so no loader-consuming guard and no host-activity walk ever exercises the reference sites,
and stage 8's own convergence evidence comes from the one mechanism that reads them — the stage-1
window search over authored files — while its correctness checks come from mechanisms that do not.

## CV18 — The absent-default merge change described as two lines still to write {#cv18}

**Verdict: STALE. Confirmed.**

It is already there. `disagreement` (`src/utils/activity-variables.ts:62-75`) compares defaults only
when both are present — `if (a.defaultValue !== undefined && b.defaultValue !== undefined)` at `:64` —
and does the same for value sets at `:69`. `fillSilences` (`:82-90`) takes a starting value from
whichever site names one. The doc comment at `:56-61` states the rule as the design: "Silence is no
opinion: a declaration that names no starting value, and one that names no value set, agrees with
whatever another declaration says about it."

The proposal contradicts itself thirty lines apart. README:783 says the prerequisites "are in place, so
the column is complete as it stands"; README:1102-1104 says the merge "compares an absent default as
`null` and reports disagreement with any present one" and asks for "Two lines". `gap-review.md:53`
records it landed and `decisions.md:518` dates it 2026-09-06.

**Blast radius.** Small and worth clearing anyway: the one measured result that depends on it —
"injecting the convergence routine's outputs at all seven of its reference sites merges the
work-package workflow with **zero contradictions**" (README:1106-1108) — is stronger than the README
says, because the merge behaviour it needs is the merge behaviour that stands.

## CV19 — An exhaustiveness assertion over the step kinds {#cv19}

**Verdict: NARROWS. Confirmed. The figure corrected against both the sweep and the proposal.**

Counting `kind === '<k>'` and `kind !== '<k>'` over the four step kinds across `src/`, `scripts/` and
`tests/` at the pinned commit gives **64 comparisons across 22 files — 37 in `src/` (8 files), 16 in
`scripts/` (9 files), 11 in `tests/` (5 files).** Neither the sweep's 60 across 22 (34/15/11) nor the
proposal's "57 places across 19 files" (README:431-433) reproduces. The occurrence count exceeds the
line count by one, `src/utils/binding-provenance.ts:182` carrying two comparisons on one line; I
inspected every match and none is a non-step `kind` discriminator. No exhaustive switch exists:
`assertNever`, `: never =` and `satisfies never` return nothing over the three trees.
`flattenActivitySteps` has nine files using it, reproducing the proposal's nine, and recurses into
exactly one thing — `if (s.kind === 'loop' && s.steps.length) rec(s.steps)` at
`src/schema/activity.schema.ts:327` — so an unknown compound kind is walked as a leaf.

**The criterion protects 37 of the 64.** `tsconfig.json` sets `"include": ["src/**/*"]` and `typecheck`
is `tsc --noEmit` (`package.json:24`); there is no second tsconfig and no other `tsc` invocation. So
`scripts/` and `tests/` are never typechecked, and 27 comparisons in 14 files would compile clean
against a fifth kind — the same failure mode the criterion is written against. The repository carries a
live instance: `scripts/check-loop-shape.ts:43-49` declares a local `LoopStep` interface with `id`,
`loopType`, `over`, `variable` and `continueWhile` and no `breakCondition`, while `:96` calls
`has('breakCondition')` where `has` is typed `(field: keyof LoopStep)`. That is a type error, and it
compiles only because `scripts/` is outside the typecheck.

Keep the assertion and state its reach: an exhaustive discrimination in `src/`, at the one place that
consumes the kind, plus a runtime assertion or a test for the guard scripts, which no compiler
protects. Widening `tsconfig` is the other answer and is a repository change with its own blast radius
that does not belong inside stage 3.

**Blast radius.** The criterion is described as "a small hardening of ground this proposal stands on"
(README:449-451), and at its measured reach it is smaller than that. Landing it as written and
believing it is the hazard: nine guard scripts comparing step kinds would still compile clean against a
fifth kind, and eight of the nine read activity files.

## CV20 — The reference-site `outputs` remap {#cv20}

**Verdict: KEEP. Confirmed.**

I resolved every `analyse-challenge::combine` binding in the corpus. Across the seven sites, **four
output ids bind to seven distinct destination names**. Six sites bind all four identically —
`concern_document: assumptions_log`, `concerns_agent_resolvable: has_resolvable_assumptions`,
`residual_opens_remain: has_open_assumptions`, `residual_opens: open_assumptions`, at
`02-design-philosophy`, `04-research`, `05-implementation-analysis`, `06-plan-prepare`,
`07-assumptions-review` and `08-implement`. The seventh binds three to three different names at
`15-codebase-comprehension.yaml:109-111`. Four ids, seven names, one output unbound. README:303's
"three outputs to five different names" does not reproduce; the sweep's four-to-seven does, exactly.

This is a second path — a routine output has both its own id and a per-site destination name — and it
is the one that pays for itself. Without it the comprehension domain loses `comprehension_artifact`,
`needs_comprehension` and `has_open_questions`, and the alternative is two routines for one two-step
body, which is the duplication stage 6 exists to remove. It is also not new machinery: it is the
technique-step `outputs` remap (`src/schema/activity.schema.ts:66`) applied one level up, and the
derivation already reads it (`src/utils/activity-variables.ts:534`). Stage 6's third criterion — "The
four output remaps each site carries today survive as reference-site bindings, so no domain loses the
name it uses" (README:900-901) — is the right criterion and it is measurable.

The one thing inside this KEEP that the design still owes is [PD5](#pd5): the routine whose outputs
these become declares `concern_document` as an input as well, and nothing says what the substitution
does with one id carrying both an argument and a destination.

---

# The keep list

What a confident implementer executing this plan would delete by mistake, each with the
discriminators that separate it from the thing it resembles. Several independent discriminators
rather than one, because the single-discriminator version is what produced the deletions the
repository has already had to undo.

**1. `composeActivityArtifacts`'s `seen` set** — `src/tools/workflow-tools.ts:173` and `:181`. Reads
like a defensive dedupe in a composer nobody has looked at.

- 24 (filename, activity) pairs across 11 activity files depend on it, the largest writing one
  filename from four step bindings.
- No guard in the 40-entry registry forbids the duplication it absorbs, so removing it fails no test
  and reports nothing.
- The artifact contract is keyed on filename, not on step, so removing it emits N identical contract
  entries rather than surfacing a defect.
- Writing one artifact twice in one activity is the corpus's produce-then-revise idiom, legible in the
  step ids (`analyze-source` then `revise-source-analysis`).

**2. The activity-level `techniques[]` list** — `src/schema/activity.schema.ts:290`, 32 files and 33
entries at the pinned corpus. Reads like a second home for "this activity needs this technique",
which [CV3](#cv3) argues should be retired.

- 23 of the 29 entries the overlap guard can read name `scatter-gather` or `variable-binding`, and
  both are capability files — `## Capability`, `## Protocol`, `## Rules` and no operations — so no
  step can bind either.
- The overlap guard's own header names those two as the intended content
  (`scripts/check-activity-technique-overlap.ts:4-5`).
- The 6 entries that name bindable operations sit at activities that bind them nowhere; the one
  technique bound as a step (`execute-sub-agent`, 3 sites) is listed only in a different workflow.
- Design principle 35's second clause governs this case, not its first:
  `design-principles.md:163` — "Where both paths must survive, the prohibition names the home that
  owns the surviving behaviour rather than restating it."

**3. `scanCheckpointRefLines` and `injectCheckpointFragmentBodies`** —
`src/loaders/fragment-resolver.ts:218-224` and `:161-211`. The design says the textual implementation
"is deleted when the runner stops delivering activity text" (README:1175), which reads as
authorisation.

- The runner does not exist: `src/` holds no runner module and `grep -rln runner src/` matches
  nothing; it lives in three planning folders.
- The path is live at eight reference sites in four activity files
  (`04-research.yaml:224`, `:243`; `05-implementation-analysis.yaml:126`, `:145`;
  `07-assumptions-review.yaml:112`, `:130`; `08-implement.yaml:202`, `:221`).
- The pre-scan is what keeps the other 114 activity files off the resolution path, so deleting it
  changes delivery for files carrying no ref at all — which is what stage 3's eighth criterion
  measures.
- [CV2](#cv2)'s narrowing is "decline to build the routine-sized sibling", not "delete the gate-sized
  one".

**4. `check-artifact-guides`'s baseline machinery** — `scripts/check-artifact-guides.ts:44`, `:80`,
`:274-281`, with no `artifact-guide-baseline.json` on disk. Reads like dead code for a retired
mechanism, especially to anyone who has just read `check-delta.ts`'s header.

- The header states it as design, not tolerance: "The baseline is not a snapshot to regenerate" and
  "Adding a new artifact with no guide fails the guard; closing a baselined gap means deleting its
  entry" (`:21-24`).
- The file is absent because the debt is zero — "Every corpus artifact resolves today, so no baseline
  file exists — the triage is the escape hatch for a deliberate gap, not a standing allowance"
  (`:26-27`). Absence is the success state.
- The stale-entry rule at `:274-281` is what stops a triage outliving its debt, and two sibling
  ledgers implement the same convention with files present:
  `scripts/binding-fidelity-triage.json` (70 entries) and `scripts/canonical-home-map-triage.json` (4).
- It is stage 1's fourth acceptance criterion, already built. Deleting it is deleting the answer to
  [PD3](#pd3)'s buildability half.

**5. `meta/activities/patterns/*.yaml` and the `orchestration-patterns` ops they bind.** Every
mechanical signal says dead: no `workflow.yaml` references them, `loadActivitiesFromDir` skips the
subdirectory, and `check:activities` validates 117 of 122 files.

- `meta/activities/patterns/README.md:5` states library-only as the design, naming the loader's
  non-recursion as the reason.
- `scripts/binding-fidelity-triage.json:5` states the policy directly: "having no consumer inside the
  corpus is the expected state of a library, not a broken seam".
- `:7` states the second half for these files specifically: "Producers resolve per-workflow, so the
  library home can never show one."
- `scripts/check-binding-fidelity.ts:537-542` records that the guard was changed *to* walk them
  because mirroring the loader "left `meta/activities/patterns/` completely unmeasured" — so the
  repository has already made this mistake once and fixed it.
- Two of these files have nonetheless been deleted from the live corpus for a different and good
  reason (the graph fan supersedes them), which makes the remaining three easier to delete by
  momentum. `02-supervisor.yaml` is the one stage 8 never named and [PD2](#pd2) now needs.

**6. `breakCondition` on the loop step** — `src/schema/activity.schema.ts:160`. Sits at zero corpus
sites and reads like a field stage 0 orphaned.

- README:790-793 makes it one of the fields materialisation must substitute over, because a routine
  body's `forEach` may carry an early exit.
- `check-loop-shape`'s `repeat-loop-with-break` rule (`scripts/check-loop-shape.ts:96-104`) exists to
  refuse it on a `while` or `doWhile`, so the field has a guard even with no site.
- The guard's own local `LoopStep` interface omits it (`:43-49`), so deleting the schema field would
  leave a rule reading a name nothing declares — and `scripts/` is outside `typecheck`, so nothing
  would say so. Zero sites plus a silent compiler is how this one disappears.

**7. `mentions` and `produces` on `DerivedContract`** — `src/utils/activity-variables.ts:198` and
`:192`. Read as redundant beside `reads` and `writes`, and a stage-4 implementer working on the
boundary is looking at exactly this type.

- Both are documented as deliberately wider: "It is wider than `writes` on purpose: `writes` is
  narrowed to the declared namespace, and the namespace is assembled from the declarations, so a
  production no declaration mentions cannot appear there at all."
- `undeclared-crossing` (`scripts/check-activity-variables.ts:234`) is the only rule that can see a
  name no contract declares, and it reads both.
- They are what makes [CV4](#cv4)'s alternative possible. An implementer who removes the `internals`
  category on CV4's advice and then removes these two sets as unused has deleted the replacement
  along with the thing it replaced.

---

# Withdrawn, recorded

No candidate failed outright. Seven arguments did, six of them carrying verdicts that survive on other
grounds and one of them carrying a verdict that fell a rung. Each stays here with the reason.

| Withdrawn | From | Why |
|---|---|---|
| "This repository removed stored guard baselines and recorded why", so stage 1 re-introduces "the exact mechanism the delta runner's header rejects on principle" | CV12 | `scripts/check-artifact-guides.ts:20-31` declares the falling-only per-guard baseline as design, in a registered guard, with a default path, a loader and a stale-entry rule. `check-delta.ts:4-6` rejects a whole-suite regenerated snapshot, a different object. Drove the downgrade to NARROWS. |
| "Retire the activity-level list itself — 33 entries, 4 names, 26 of them one name — and the guard goes too" | CV3 | 23 of the 29 entries the guard reads name capability techniques declaring no operations, which no step can bind. The list is their only home, and design principle 35's second clause covers the case. |
| "It takes cycle detection, the placement closure and the nested-map substitution arm out of stage 3" | CV5 | Placement is stage 4's third criterion (README:872-873), not stage 3's. Two savings, not three. Drove the downgrade to KEEP. |
| "A load cannot answer the question" | CV15 | `listWorkflows` sits in the same module as `loadWorkflow`, and a filename-and-step-kind scan is not the full-load recursion `readWorkflowFragments` forbids. The objection is cost and shape, not possibility. The enforcement-strength finding survives. |
| "The site is outside everything" | CV17 | `meta/activities/patterns/README.md:5` and `binding-fidelity-triage.json:5` and `:7` state library-only, no-consumer as the designed state, and `check-binding-fidelity.ts:537-542` records the guard being changed to read these files. The narrower finding — materialisation never runs there — survives. |
| "What is not consistent is a third reading at a site adjacent to 346 instances of the second" | CV7 | There is no third reading. `check-set-action-values.ts:12-23` states the design's reading as the repository's decided position at a field with no legacy. The verdict survives on the worked example instead, and is better supported. |
| "Reportable by the routine-body checker as an output nothing consumes" | CV6 | The body checker cannot see reference sites, so it cannot see an output six sites bind and one drops. The real coverage is downstream, at the reader, which is where the corpus already catches 975 unremapped technique-step outputs. |

---

# Figures re-taken

Every corpus figure below comes from a fixed extraction of `2b8b7215`; every server figure from a
fixed extraction of `9ca71c19`. Both were unpacked with `git archive` into a scratch directory, so
none of them moved while being counted. The activity population at that pair is **122 files, 117 of
them directly under a `<workflow>/activities/` directory** and 5 under
`meta/activities/patterns/`.

## Reproduced without change

| Figure | Measured |
|---|---|
| Duplicate artifact filenames within one activity | 24 (filename, activity) pairs across 11 files, largest at 4 steps |
| Activity-level `techniques[]` | 32 files, 33 entries, 4 names, `scatter-gather` 26 |
| Technique-step input bindings | 413 — 346 bare, 61 braced, 6 non-string |
| Checkpoint options carrying `effect.exit` | 49 across 28 activity files |
| Exits at the seven convergence sites | 5, 4, 2, 2, 1, 1, 1 |
| Loader-consuming guards | 4 registered, plus `check-session-contract` excused by name, plus 2 non-guards |
| Textual half against object half of the fragment mechanism | 71 lines (`:154-224`) against 63 (`:90-152`) |
| `deriveActivityContract` call sites | 2, both in `scripts/check-activity-variables.ts` |
| `challenge_findings` declared writes | 7 |
| The two assumption internals' declared writes | 4 each, 8 together |
| Fold output ids to destination names across seven sites | 4 ids, 7 names, 1 output unbound |
| Guards placed by the proposal's classification | 21 of 40, leaving 19 unplaced |
| `check:activities` coverage | 117 of 122 activity files |
| Prism `02` against `05` | 22 changed lines, three substantive differences beyond the operation |
| `flattenActivitySteps` users, and its single recursion | 9 files; `loop` alone |
| Fragment guard rules | 9 in the union type (`scripts/check-fragments.ts:56-65`) |
| Registered guards | 40 (`scripts/guards.ts:28-347`) |
| The single `fragments` declaration and its reference sites | 1 block at `work-package/workflow.yaml:15`; 8 sites in 4 activity files |

## Stated but not reproduced

| Figure | Where stated | Measured here |
|---|---|---|
| Step kinds tested in 57 places across 19 files | README:431-433 | **64 across 22** — 37 `src/` (8 files), 16 `scripts/` (9), 11 `tests/` (5), counting `kind === '<k>'` and `kind !== '<k>'` over the four kinds; the sweep's 60 across 22 does not reproduce either |
| Step kinds tested in 60 places across 22 files | sweep, CV19 | **64 across 22.** Same rule, same trees, same commit |
| 346 unremapped technique-step outputs | sweep, CV6 | **975 unremapped of 1,026 declared**, resolving each step's technique to its `## Outputs` section and counting `### <id>` per site. 346 is the sweep's own count of bare input bindings, reused for a different population |
| Seven sites bind "the same three outputs to five different names" | README:303 | **Four output ids to seven names**, one output unbound at one site |
| A 193-site migration settling the braced/bare reading | README:297 | The figure appears **once in the whole planning folder**, with no source, and nothing in the tree names such a migration. The population is 346 bare of 413 |
| Six guards consume the loader | README:1066 | **4 registered plus 1 excused**; `check-audience` and `check-artifact-guides` read technique markdown, `validate-workflow-yaml` is a consumer the list omits |
| "Every activity that would refer to one declares a single ending" | README:747-748 | **4 of 7 declare more than one exit** (5, 4, 2, 2); **4** pattern activities declare none; 49 options carry `effect.exit` across 28 files |
| `challenge_findings` declared at six sites | README:208, README:905, `re-derivation.md:256-257` | **Seven** |
| Four occurrences of one four-step fan-out run | README:776 | **Five occurrences across four files, two interrupted by an `action` step.** `02-supervisor` is unnamed by the stage |
| Three occurrences plus one variant | sweep, CV17 | **Five occurrences, two interrupted.** `02-supervisor` carries both an interrupting action and a different `gather` binding |
| Three fan-out sites declaring zero exits | sweep, CV16 | **Four** |
| Six hunks between prism `02` and `03` | sweep, CV13 | **5 hunks, 8 changed lines** |
| Three prism files of 41, 41 and 42 lines | sweep, CV13 | **41, 41 and 41** |
| The absent-default merge change is two lines still to write | README:1102-1104 | **Landed** — `src/utils/activity-variables.ts:62-75`, `:82-90`. README:783, `gap-review.md:53` and `decisions.md:518` agree; README:1102-1104 does not |
| A 35-script suite / thirty-seven scripts | README:611, README:1021 | **44 `check-*`/`validate-*` scripts on disk, 40 registered** |
| `converge-assumptions` "declares no inputs, four outputs, one internal" | `re-derivation.md:100-101` | The signature at `re-derivation.md:159-206` declares **no `internals` block**; neither does `challenge-concerns` at `:110-157` |

## Citations corrected

| Cited | Correct |
|---|---|
| `over: open_assumptions` at README:258 | README:260 |
| Closest-producer doc comment at `src/utils/activity-variables.ts:409-411` | `:413-415` |
| `readSignature`'s prose filter at `src/utils/activity-variables.ts:387` | `:389` |
| `fragmentsLookupSync` at `scripts/check-binding-fidelity.ts:529` | `:493` at the pinned commit; `:534` in today's tree |
| `converge-assumptions` at `re-derivation.md:158-204`, its nested reference at `:195-204`, its bare argument at `:199` | `:159-206`, `:195-205`, `:200` |
| Guard registry population for the overlap guard, 32 files and 33 entries | Correct corpus-wide; the guard's own non-recursive scan reads **28 files and 29 entries** |

## How each figure was taken

Five tallies were taken with scripts written from the constructs themselves rather than from the
sweep's method, each stating its rule so the figure is re-derivable.

- **Artifact filenames per activity** — walk every activity file's steps at any loop depth, resolve
  each `step.technique` (bare-string or `{ name }`) to its technique file under
  `<workflow>/techniques/` or `meta/techniques/`, extract each `#### artifact` block's filename, and
  count filenames per activity file.
- **Activity-level `techniques[]`** — read the top-level `techniques` key of every activity file,
  once corpus-wide and once over `<workflow>/activities/*.yaml` alone, which is what
  `check-activity-technique-overlap` scans.
- **Input bindings** — count every key of every `step.technique.inputs` object at any loop depth,
  classified by whether the value is a string containing a brace, a bare string, or a non-string.
- **Technique-step outputs** — for each step binding, count the `### <id>` entries under the
  technique file's `## Outputs` heading, and subtract those the step's `outputs` map names.
- **Exits and `effect.exit`** — read each activity's `exits[]` and count every checkpoint option
  carrying `effect.exit` at any loop depth.
- **Step-kind comparisons** — one regular expression, `kind\s*(===|!==)\s*'(technique|action|checkpoint|loop)'`,
  over every `.ts` file in `src/`, `scripts/` and `tests/`, counting occurrences rather than lines and
  inspecting every match for a non-step `kind` discriminator.
- **The fan-out run** — walk every `meta/activities/patterns/` file's steps with depth, printing kind,
  id and bare operation name, and read the sequences rather than searching for a window.
