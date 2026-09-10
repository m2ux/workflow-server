# A reusable activity that takes a technique as a parameter

> Handling Inline Techniques · [#397](https://github.com/m2ux/workflow-server/issues/397) · corpus pin [`12400e85`](https://github.com/m2ux/workflow-server/tree/12400e85c5212f1f8011de8b767b9a26b4f2dc51)

## What this document settles

Some techniques call other techniques from inside their protocol prose. A handful of those calls are
safety checks: the callee reports a risk level and the caller is told, in words, to show a high one to
the user before going on. The idea under investigation is to stop asking every caller to remember
that. Instead one reusable unit would hold the pattern — it would take the technique to run as a
parameter, run it, put a user decision point after it, and then let the caller's own work proceed. One
such unit would replace what would otherwise be several near-identical copies.

The finding is that the pattern the proposal names exists in this corpus and works well at fourteen
sites, but the two halves the proposal needs live at different layers of the definition schema and
cannot be joined. **Parameterisation lives on a step's technique binding. A user decision point lives
on an activity's step list. An activity takes no parameters at all.** So a unit that is both
parameterised and gate-carrying is not expressible: the parameter has to be written into the activity
file, which fixes the activity to one callee and reproduces the copies the proposal exists to avoid.

Separately, and independent of that: none of the eight calls the proposal targets sits where a
pre/post wrapper could stand. Every one of them is mid-protocol, with a value the caller computes
earlier and consumes later.

## The unit every count here uses

Two populations recur and they are not the same size.

**Call sites and pairs.** A call site is one invoking verb next to an unanchored markdown technique
link inside a `## Protocol` section, with a qualified `group::op` link pair collapsed to the operation
it names. A pair is one distinct caller file with one distinct callee file, so a caller naming the same
callee twice contributes two call sites and one pair. Corpus-wide at the pin: **198 call sites, 178
pairs, over 478 technique files with a Protocol section**, admitted from **254 link-resolvable
references (78%)**. Restricted to callers under `work-package/techniques/`: **64 call sites, 58 pairs,
33 caller files.** Both figures come out of the delivered guard and out of a second reading built only
from the published grammar module's exported classifier — the same numbers from two implementations.

**Bind-supplied callees.** A step in an activity file whose technique binding supplies a technique
reference as an input *value*. At the pin there are **8**, in 8 activity files, and they are the whole
of that population: 7 supplying `analyse_technique` and 1 supplying `agent_technique`.

Where a figure below is a subset of one of those, the subset says which.

## Where the shape already works

A technique-parameterised wrapper is a real construct with four families in the corpus. All four
parameterise the same way: a step binds a *fixed* wrapper technique by name, and passes the varying
part as an entry in that binding's `inputs` map. None of them parameterises an activity, because no
activity can be parameterised.

| Family | Wrapper technique | Parameter | Call sites | Home of the wrapper | Reach |
|---|---|---|---|---:|---|
| Analyse-challenge | `analyse-challenge::run-loop` | `analyse_technique` | 7 | `work-package/techniques/` | authored where it runs |
| Artifact conformance | `verify-artifact-conforms` | `guide_map` | 14 | `meta/techniques/` | borrowed by 14 workflows |
| Sub-workflow handling | `workflow-engine::handle-sub-workflow` | `workflow_id` | 3 | `meta/techniques/` | borrowed by 3 workflows |
| Dispatch stub | `workflow-engine::dispatch-activity` | `agent_technique` | 1 | `meta/techniques/` | authored where it runs |

**Analyse-challenge** is the family the proposal points at. Seven steps across seven `work-package`
activities bind `analyse-challenge::run-loop` and vary one input — six of them pass
`review-assumptions::reconcile`, and `15-codebase-comprehension` passes
`codebase-comprehension::deep-dive`. The wrapper's own container states the intent in as many words
under a rule named `parameterize-dont-fork`: stages differ by inputs, not by forked copies of the
protocol. The wrapper lives in the same workflow as every activity that binds it, so it is authored
where it runs. It becomes borrowed only at one remove, because `remediate-vuln` borrows all seven of
those activities.

**Artifact conformance is the strongest precedent and the largest.** One technique in
`meta/techniques/verify-artifact-conforms.md` is bound at **14 sites across 14 different workflows**,
each passing its own workflow's README anchor as `guide_map`. Because the wrapper sits in `meta`, every
workflow reaches it through the unqualified-reference fallback with nothing declared at the borrow
site. Its parameter addresses a resource rather than a technique, but structurally it is the idiom the
proposal asks for, running at twice the volume of every other family combined. Note what it does
*not* do: it is an ordinary step, and where the surrounding activity gates on its verdict, the
checkpoint is a sibling step authored locally in that activity. Even the best precedent keeps the gate
out of the wrapper.

**Sub-workflow handling** and the **dispatch stub** are the same construct at smaller scale. The
dispatch stub is the one member with no checkpoint anywhere in its activity, by design — it relays a
client workflow's checkpoints rather than owning any.

**`resolve-harness-operation` is not a member of this family; it is its inverse.** Its only declared
input is `operation_kind`; `harness_technique` and `harness_operation` are its *outputs*, produced by
reading a kind-to-file table. It receives no technique and it has **0 activity-YAML call sites** — no
activity in the corpus binds `harness-compat` at all. Its consumers are three other techniques
(`spawn-agent`, `continue-agent`, `spawn-concurrent`), which reach it technique-to-technique, in the
plane this whole work package is about. It belongs in the census of value-named callees, where it
contributes the 4 table-drawn rows, and not in the census of parameterised wrappers.

## What the schema permits

The activity schema is a closed object. Its declared fields are identity, description, activity-wide
techniques, bundling, steps, decisions, transitions, triggers, outcome, required, rules and a
server-computed artifact prefix. **There is no `inputs`, no `params`, no `variables`.** A field outside
that set is a load error.

The borrow reference matches. One workflow in the corpus borrows activities from another —
`remediate-vuln`, which lists **15 activity entries, 1 local and 14 borrowed from `work-package`** —
and every entry is a bare file path string. The loader resolves it to a file, validates the activity,
records which workflow authored it, and returns it. There is no place in that reference for a value.
So a borrowed activity cannot be told anything by the workflow borrowing it.

Parameterisation therefore lives exactly one level down, on a step's technique binding, whose `inputs`
is a record of arbitrary keys to scalar values. The value may be a rename of a bag variable, a
literal, or a `{template}`. Nothing types it: a technique's declared input carries an id, a
description, an optional default and optional components, and no type field — unlike a workflow
variable, which does carry one. A binding value naming a technique is an opaque string. Misspell it
and the load succeeds, the runtime annotation reports it as a resolved literal, and the one guard over
bindings does not examine it, because its value-reading pass admits only bare identifiers and a
qualified path contains a colon.

A user decision point is the `kind: checkpoint` step. It exists only inside an activity's step list;
there is no activity-level checkpoint block, and the checkpoint object other code consumes is
synthesised from those steps rather than authored. Nothing forbids an activity from holding both a
parameterised technique step and a checkpoint step — strictness applies per step kind, and
`work-package/activities/07-assumptions-review.yaml` does exactly this today and loads: it binds
`analyse_technique`, carries three checkpoints, and is borrowed by `remediate-vuln`.

**So the triple is legal, and it is also not the thing the proposal needs.** What is legal is an
activity that names one literal callee and carries a gate. Reuse across five call sites requires the
callee to vary, and the only way an activity's binding varies is by editing the activity file. That is
five activities again. The alternative — one activity whose binding reads a `{template}` and is
visited five times — makes the activity a re-entered node in the transition graph, which is the shape
[D-2](deferred-items.md) records as defective: an activity the run can return to has no exit that does
not depend on a flag no step can clear.

A second constraint bears on the shape. A checkpoint may not be an activity's first step, and the
reason given is cost and ownership together: the first step runs in a freshly dispatched worker, so a
question with no work in front of it spends a whole dispatch to ask something, and on the walk that
rule was written from re-dispatch accounted for roughly **31% of a 4.1-million-token run**. A wrapper
activity satisfies the letter of that rule, because the parameterised technique runs before the gate.
It does not escape the cost: one wrapper visited five times is five additional activity dispatches per
run.

**One qualifier on the gate claim.** A declared checkpoint step is the only *definition-level* user
gate — every other construct in the schema is explicitly agent-interpreted or orchestrator-interpreted,
and the server evaluates none of them. But it is not the only way a run halts for a user. The session
schema carries an ad-hoc gate for a decision the activity does not declare, minted at runtime with its
own message and options. So the obligation could also be honoured by a container rule instructing the
caller to raise an ad-hoc gate when the risk is high — no new activity, no schema change, and the same
dependence on the agent that the prose obligation already has.

## Pricing the wrapper against the 58 pairs

Of the 58 pairs whose caller lives under `work-package/techniques/`, **28 reach `gitnexus-operations`**
(from 31 call sites) and **18 reach `github-cli-protocol`** (from 21 call sites). Within the gitnexus
28, the gate-like operations account for **8 pairs**: `impact` at 5 and `detect-changes` at 3. The
remaining **20 pairs** are exploration or signal whose result stays inside the caller.

That remainder of 20 reproduces exactly. Its composition, on the pair basis, is `context` 6, `query`
4, `cypher` 2, and eleven singletons — the group container itself, `complexity-signal`,
`diagram-source-select`, `diff-coverage-map`, `orphan-scan`, `public-api-enum`,
`reversibility-signal`, `scope-discipline-check`, and, once each, the three already listed. **The
component figure of 8 for `context` does not reproduce on any basis found here**: `context` is 7 call
sites and 6 pairs among `work-package` callers, and 21 call sites corpus-wide. The total of 20 is
right; that row is not.

### None of the 8 gate-like pairs is liftable

A pre/post wrapper can hold a call only if the call stands at the front or the back of the caller's
protocol and needs nothing the caller computes. Read against that test, all eight fail, and they fail
for four distinguishable reasons.

| Pair | Position | Why it stays |
|---|---|---|
| `implement-task` → `impact` | section 2 of 5 | Needs `{target_symbol}`, which section 1 derives from `{current_task}` — a technique-local value crossing the split |
| `implement-task` → `detect-changes` | section 5 of 5 | Nearest to a boundary of the eight, and still followed in the same section by the `{task_implementation}` record it informs |
| `apply-review-fixes` → `impact` | section 2 of 3 | Runs once per symbol edited, and the symbol set is discovered while editing. The technique's own rule `commit-is-final-phase` states that fixes and their commit are one atomic operation and callers do not append a separate commit step |
| `review-code` → `detect-changes` | section 2 of 5 | Consumes `{changed_files}`, established in section 1; its changed-symbol set is the input to the `impact` fan-out on the next line |
| `review-code` → `impact` | section 2 of 5 | Runs once per changed symbol of interest; the union of results sets the severity ceiling in section 2 and seeds a producer/clearer ledger in a later subsection |
| `plan-prepare/plan` → `impact` | section 3 of 4 | Conditional on a judgement made inside the technique — *when the target symbols are knowable* — over plural targets, and its result orders the tasks written in section 4 |
| `implementation-analysis/analyze` → `impact` | section 3 of 6 | Maps usage and dependencies for prose written in the same section and consumed in sections 4 and 5 |
| `respond-to-pr-review` → `detect-changes` | section 6 of 6 | Informs a minor-versus-significant classification decided by the two bullets after it |

**So the wrapper absorbs 0 of the 8 without splitting a caller's protocol in two.** That is a stronger
result than the known hard case suggested, and it means the hard case is not an exception.

### The mid-protocol class is the norm, not the exception

`codebase-comprehension/deep-dive` calls `context` and then `cypher` inside one analysis, in section 1
of 3, for a selected area, gated on `{gitnexus_indexed}`. Looking for others of that kind across all
64 `work-package` call sites turns up three more where an explicit per-item bullet governs the call,
and they are heavier than the known one:

- **`review-assumptions/reconcile`**, section 2 of 5, under *for each code-resolvable assumption* —
  **four callees on one line**: the group container plus `query`, `context` and `cypher`. The item set
  comes from a classification section 1 performs, and the evidence lands in an artifact section 3
  updates. Nothing about this is liftable.
- **`review-assumptions/interview`**, section 2 of 3, under *for each residual open assumption*,
  reaching `reversibility-signal`.
- **`codebase-comprehension/deep-dive`**, the known case, counted here for completeness.

Beyond the per-item bullets, the position table shows the general shape: of the 64 `work-package` call
sites, the great majority sit at neither the first nor the last subsection of their caller's protocol.
The calls that *do* sit at a boundary are almost all fetches, discussed below.

### One of the 58 is not a call at all

`apply-review-fixes` line 40 carries a single invoking verb and two links: it applies
`manage-git::commit-paths`, and in the same sentence forbids `manage-git::artifact-commits` for
planning-folder reasons. The grammar admits both links under the one verb, so
`apply-review-fixes → manage-git/artifact-commits` is one of the 58 pairs and is a prohibition rather
than an invocation. Checking every call line in the population for negating language turns up exactly
this one. **57 of the 58 pairs are invocations; the 58th is a prohibition.** The figure is an upper
bound on invocations, which matters for any proposal that prices itself as a share of it.

## D-1 is a dependency, not an aside

[D-1](deferred-items.md) records that a borrowed activity has its bindings checked against the workflow
that authored it rather than the one running it. Its figure re-derives, and its drift is explainable.
The unit is `kind: technique` step bindings — bare-string and object form together, loop bodies
flattened — over the activities `remediate-vuln` borrows from `work-package`. At corpus commit
`34cd5429`, the pin current when the finding was filed, that count is **143**. At the delivered pin
`12400e85` it is **144** over the same 14 activities, alongside 96 binding input entries and 34
checkpoint steps. Same unit, six corpus commits apart.

The mechanism behind it is a split scope, and reading it decides the question the charge poses. On the
delivery path a borrowed activity's checkpoint fragments resolve against the **authoring** workflow,
and so do its step-bound technique references. Its variable reads resolve against the **running**
workflow. The binding guard walks each workflow's own activity directory and never reads any
`workflow.yaml`'s borrow list, so a borrowed activity is analysed once, under its author, and its
key-conformance, orphan-input and read-resolution checks never run in the borrower's scope. The
consequence is visible in the corpus: `remediate-vuln` hand-duplicates `is_review_mode` and
`has_open_assumptions` so that the borrowed activities' gates resolve, and nothing enforces that
duplication.

**A gate-carrying wrapper does not merely rest on that machinery; it puts a user safety gate on the
exact seam.** A checkpoint's dismissibility comes from its `condition`, and a condition reads a
variable. Place the high-risk gate in a borrowed activity and its condition resolves against the
borrower's variable declarations, which no check compares against the author's. Drop or rename the
variable in the borrower and the gate silently stops firing — with no load error, no runtime error and
no guard finding. That is the failure mode the wrapper is proposed to remove, reintroduced one layer
up and in a scope nothing inspects.

So: the wrapper's parameterisation half can rest on the machinery as it stands, because the existing
families already do and the largest of them is borrowed by 14 workflows. **The wrapper's checkpoint
half cannot. For a gate-carrying reusable unit, D-1 is a blocker.**

## The two attractions, tested

**It converts a prose obligation into a structural one — partly.** The obligation's wording is
verified verbatim, in `meta/techniques/gitnexus-operations/impact.md`, as the whole of Protocol step 3:
*The caller MUST surface HIGH or CRITICAL risk to the user before proceeding with an edit.* Two of the
five callers restate it in their own prose; three do not. A declared checkpoint step is genuinely
better than that, on two counts: it is the only gate the definition schema carries, so it is
enumerable by the guards that already read checkpoints, and once a checkpoint is yielded the server
gates every other tool until it is answered. It is not an absolute conversion. The server never
evaluates a step's gate condition and never forces the yield — reaching the step and yielding is the
worker's act, so the obligation moves from *every caller remembers the prose* to *every caller routes
through one activity whose gate a worker still has to yield.* And the schema already carries a cheaper
route to the same standing: an ad-hoc runtime gate, which a container rule can require without a new
activity existing at all.

**It moves those calls into a plane the new guard does not read — and the SC-6 rescope does not cover
the move.** This was tested rather than reasoned, by copying the corpus, planting bindings in it, and
reading the census. The activity-layer check counts a bind-supplied callee only when the value is a
literal qualified path in a top-level activity file:

| Planted binding | `bindSuppliedCallees` |
|---|---:|
| baseline, no planting | 8 |
| `op_technique: gitnexus-operations::impact` | **9** |
| `op_technique: '{selected_operation}'` | 8 |
| `op_technique: scatter-gather` (resolves; carries no `::`) | 8 |
| the qualified literal, in `activities/wrappers/` | 8 |

The reference test requires at least one `::`, so an unqualified name is invisible even when it names a
real file; a `{template}` is invisible; and the scan does not descend into an activities subdirectory,
which is at least consistent with the loader, since the loader does not either.

**The consequence for the design is direct.** The one wrapper shape the check would see is the one that
defeats the purpose: a literal callee per activity, which is N near-identical activities. Make the
wrapper genuinely reusable — one activity, callee chosen by a variable — and its calls leave the
link-keyed plane the census enumerates *and* fall outside the bind-supplied plane as well. The move
would be a coverage regression rather than a plane change.

**A basis note the census does not yet state.** The 8 counts *authored* bind sites, not running ones.
Seven of the eight sit in activities that `remediate-vuln` borrows, so at run time those seven exist
twice, in two variable scopes; `remediate-vuln/activities/` holds only its own `01-start.yaml` and
contributes 0. The activity-layer figure is borrow-blind in exactly the way the binding guard is —
which is D-1 showing up in a second guard, and worth saying beside the figure.

## Where a parameterised wrapper earns its place, and where it does not

**The GitHub review-fetch cluster is the one candidate that fits the position test, and it does not
need a parameter.** Five pairs across two callers sit at the very front of their protocols:
`respond-to-pr-review` opens section 1 of 6 by fetching `list-pr-review-comments` and
`list-pr-reviews`, and `review-existing-feedback` opens section 1 of 4 by fetching
`list-issue-comments`, `list-pr-reviews` and `list-pr-review-comments`. Every value they need —
`component_git_dir`, `pr_number` — is workflow-scoped and available before the caller starts. These
lift cleanly. But the right construct for them is three ordinary step bindings, one per operation, in
front of the existing step. The schema supports that now, it needs no wrapper, no parameter and no
checkpoint, and it puts the fetches where the binding guard already checks them.

**The `manage-git` commit calls are the wrong tool's clearest case.** `apply-review-fixes` publishes a
rule named `commit-is-final-phase` stating that the commit phase is part of the technique, that fixes
and their commit are one atomic operation, and that callers do not append a separate commit step. That
is the corpus refusing this hoist in advance. `strategic-review/apply-cleanup` is the same shape at
sections 1 and 2 of 2. Two of the four `manage-git` pairs are these, and the third is the prohibition
counted above.

**The four `update-pr` operations want retirement, not wrapping.** `update-pr/mark-ready` is a
29-line technique whose entire protocol is one bullet of precondition and one call to
`github-cli-protocol::mark-ready`. `update-pr/render` is 29 lines around one call to
`update-pr-description`; `post-review-comment` and `create-pr` are the same shape at 40 and 44 lines.
A wrapper around a wrapper adds a layer where the honest move is to bind the operation as a step and
delete the pass-through. That move is the one [D-7](deferred-items.md) withdrew, because the group
container's `must-use-operations` rule forbids the target state in as many words: structural analysis
must go through the operations, and raw calls live only inside the operation procedures. Nothing in a
parameterised wrapper changes that standoff.

**Where the pattern would genuinely earn its place is where it already is.** The two live families
that carry real volume — 7 sites for `analyse-challenge::run-loop` and 14 for
`verify-artifact-conforms` — share a property none of the gitnexus call sites has: the varying part is
chosen where the *step* is written, and the surrounding protocol is genuinely identical across sites.
The gitnexus gate-like calls have the opposite property. Their varying part is a symbol the caller
discovers mid-protocol, and no two callers wrap it in the same shape.

## Bearing on PL-2

[PL-2](02-assumptions-log.md) settles that a folded callee's body is charged to the unbudgeted
operations-bundle channel rather than the budgeted eager channel, and its measurement is that the
heaviest closure in the corpus sits at **7.3% of the 640,000-character budget uncollapsed and 6.4%
collapsed**, against which adding a budget parameter to the orchestrator door was declined as
speculative.

A gitnexus wrapper bears on that measurement in one direction, and it is the safe one. Moving a callee
from an inline reference to a step binding means the callee no longer needs to arrive as a folded body
attached to its caller — it arrives as the step's own technique, on the door that already delivers step
techniques, where content-keyed deduplication collapses it against any other delivery of the same
operation. Since the 8 gate-like pairs reach only 2 distinct callees, `impact` and `detect-changes`,
the effect on any one closure is small and downward. **Nothing in this proposal enlarges a folded
closure or adds a channel, so PL-2's settled charging rule stands unchanged either way.**

The specific dedup figures the proposal cites — 22.93% of budget on a full projection and roughly
10.4% after a note/items dedup — **appear in no committed artifact in this planning folder.** What is
recorded is the 7.3%/6.4% pair above, against a 640,000-character budget derived as declared context
tokens times 0.8 headroom times 4 characters per token. Those two sets of figures are not the same
measurement and this document does not reconcile them.

## Figures that do not reproduce

Stated plainly rather than adjusted.

- **`context` at 8.** Reproduces at neither basis: 7 call sites and 6 pairs among `work-package`
  callers, 21 call sites corpus-wide. The total it belongs to — 20 exploration-or-signal pairs — does
  reproduce exactly.
- **D-1 at 143.** Reproduces exactly at corpus commit `34cd5429` and comes to 144 at pin `12400e85`,
  same unit. Not a discrepancy once the basis is named, but the figure needs the commit attached to it.
- **22.93% and roughly 10.4% of budget.** Not present in any artifact in this folder. See above.

## Conclusion

The pattern is real, well used, and the wrong instrument for the eight calls in question. It cannot
carry a gate and be reusable at the same time, because the schema puts the parameter on a step binding
and the gate on an activity's step list, and gives an activity no way to receive anything. Even setting
the gate aside, none of the eight calls stands where a wrapper could stand. And the one wrapper shape
the new guard's activity-layer check would see is the shape that reproduces the copies the proposal
exists to remove.
