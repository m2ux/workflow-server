# The thirty-one sites

Every place in the corpus at `131e2942` where units of work are taken one at a time. Sites are cited
by file and by the construct's own id, which survives edits that line numbers do not.

Independence, for this document, means: the iteration reads only its own unit and values settled
before the loop began, and it writes either a path unique to itself or a collection that appends.
That is the same condition `scatter-gather`'s `accumulate-never-overwrite` and `isolation-then-combine`
rules state for parallel mode.

Independence is what these rows establish and it is all they establish. Whether an activity step can
reach the parallel mode at all is a separate question, settled the same way for every row by
`one-level-of-indirection` and `depth-1-only`, and treated in section 2 of the
[README](./README.md#2-where-fan-out-is-available-and-where-the-demand-is).

---

## Ready — 8

Independence holds on the definitions as they stand. The migration is a restructure, not a flag; see
[migration-backlog.md](./migration-backlog.md) for what each one costs.

### R1. Evidence probes, one investigation area at a time

`midnight-system-review/activities/03-evidence-probes.yaml`, loop `area-probe-loop` over
`investigation_areas`, body a single bind of `probe-area`.

**Independence holds because the gather contract is already written by hand.** `probe-area` declares
its output `area_evidence_collection` as "the gathered collection of per-area evidence records — this
iteration appends its record in area order". Its inputs are `current_area` and four availability
flags settled during scope intake. No probe reads another area's record. The consolidation that
follows the loop, `consolidate-evidence`, is the combine phase under another name.

This is the closest fit in the corpus to `scatter-gather` parallel mode, and the workflow's technique
README already cites `scatter-gather`.

### R2. Quality review, one target workflow at a time

`workflow-authoring/activities/08-quality-review.yaml`, loop `target-sweep-loop` over
`target_workflow_ids`.

**Independence holds and the definition says so.** The loop's `validate-schema` step carries a set
action on `register_sections` whose own description reads: "This target's register section appended
to the sections already gathered … Appends; never replaces a prior target's section." Each iteration
opens by rebinding its own baseline through `workflow-definition::reload-workflow`, so no target
inherits the last one's loaded state.

### R3. Package planning, one package at a time

`work-packages/activities/04-package-planning.yaml`, loop `package-loop` over `work_packages`, body a
single bind of `plan-work-package-scope::plan-package`.

**Independence holds because each package writes its own file.** `plan-package`'s output
`package_plan` declares its artifact as `{package_name}-plan.md`, so two iterations never collide on
a path. Its only input is `current_package`. The dependency list a plan records is a property of the
package being planned, not a read of another package's plan.

### R4. Prism structural pass, one analysis unit at a time

`prism/activities/01-structural-pass.yaml`, loop `unit-cycle` over `analysis_units`.

**Independence holds because this loop only writes the accumulator.** Each of the four mode-gated
technique binds — `structural-analysis`, `single-lens-analysis`, `portfolio-analysis`,
`behavioral-pipeline::independent-lenses` — takes its target from `current_unit` and nothing else.
The two action steps set `behavioral_output_paths` and `all_artifact_paths`; neither is read inside
this activity. The adversarial and synthesis passes read `all_artifact_paths`, and they are separate
activities that run after this one completes.

This is also the site where prism's own parallelism plan should land — see the note under
[Already concurrent](#already-concurrent-contract-absent--2) and section 4 of the README.

### R5. Prism behavioural synthesis, one analysis unit at a time

`prism/activities/05-behavioral-synthesis-pass.yaml`, loop `behavioral-synthesis-unit-cycle` over
`analysis_units`.

**Independence holds against this loop's own writes.** The single bind sets `all_artifact_paths` and
does not read it.

**Observation, out of scope.** The bind passes `prior_artifact_paths: behavioral_output_paths`, and
`behavioral_output_paths` is an activity-level variable that the structural pass sets once per unit.
Read literally, every unit in this loop receives whatever the structural pass's last unit left
behind. That is a variable-scoping question that exists today and would exist unchanged after any
concurrency work. It is recorded here because it was found here, not proposed as part of this item.

### R6. Post-implementation review's three independent passes

`work-package/activities/10-post-impl-review.yaml`, steps `code-review`, `structural-analysis-inline`
and `test-suite-review`, and the same three again inside loop `review-fix-cycle` as
`re-code-review`, `re-manual-diff-review` and `re-test-suite-review`.

**Independence holds because they are three producers into one appended collection.** The activity
declares `review_findings` on its reads and `code_findings_actionable` and
`test_findings_actionable` on its writes; each pass contributes its findings and its own actionable
flag, and none reads another's. The combine phase already exists as the
`classify-and-route-findings` step that follows them.

One of two ready sites in the corpus that are not loops, both in the busiest workflow. Treated at
length in [work-package-stages.md](./work-package-stages.md).

### R8. The lean-coding audit's two scans

`work-package/activities/09-lean-coding-audit.yaml`, steps `review-over-engineering` and
`harvest-debt`.

**Independence holds because the two scans share nothing.** `ponytail/review-over-engineering` takes
an optional `lean_change` and otherwise reads the change from `target_path`, writing `review_findings`
as `review-findings.md`. `ponytail/harvest-debt` declares no inputs, greps the tree for ponytail
markers, and writes `debt_ledger` as `debt-ledger.json` alongside the boolean `has_debt_markers`.
Disjoint reads, disjoint artifacts, disjoint outputs.

The combine already exists and is already placed: `report-gain` follows them, gated on
`has_debt_markers`.

### R7. Wiki build, one area at a time, with the ledger moved to the combine

`codebase-wiki/activities/02-build-wiki.yaml`, loop `area-ingest-cycle` over `ingest_plan`.

**Independence holds for the ingest and not for the ledger.** The `ingest-area` bind is per area. The
`maintain-index-log` bind that follows it writes `index.md` and appends `log.md` — one catalogue and
one ledger for the whole wiki — so running it inside a fanned-out iteration is a write collision by
construction.

The migration is therefore specific rather than general: the ingest scatters, and the index-and-log
step becomes the combine operation, invoked once with the gathered `mutated_pages` of every area.
`maintain-index-log` already takes `mutated_pages` as a set, so the combine form needs no new input.

---

## Blocked — 4

Independence cannot be claimed until something is decided. Each row names the decision.

### B1. Prism adversarial pass

`prism/activities/02-adversarial-pass.yaml`, loop `adversarial-unit-cycle` over `analysis_units`.

**The loop reads the variable it appends to.** The bind passes
`prior_artifact_paths: all_artifact_paths`, and the same step carries a set action on
`all_artifact_paths` described as "Accumulated artifact paths across units". Unit *n* therefore sees
the artifacts of units 1 to *n*−1. Under fan-out every unit would see the same starting set and none
of its siblings' output.

**Decision required:** whether an adversarial pass is supposed to read earlier units' artifacts at
all, or whether `prior_artifact_paths` is meant to carry only the structural pass's output for the
same unit. The current behaviour is order-dependent and the definitions do not say which is intended.

### B2. Prism synthesis pass

`prism/activities/03-synthesis-pass.yaml`, loop `synthesis-unit-cycle` over `analysis_units`.

**The same shape as B1**, with `full-prism::synthesis` in place of `full-prism::adversarial`, and the
same decision governs both. Take them together or not at all.

### B3. Multi-target quality review in workflow-design

`workflow-design/activities/08-quality-review.yaml`, loop `multi-target-review-loop` over
`target_workflow_ids`.

**Two iterations write the same three paths.** The loop's three `write-artifact` binds pass fixed
bare filenames — `principle-findings.md`, `anti-pattern-findings.md`, `verified-findings.md` — into
one `planning_folder_path`.

**Decision required:** what a per-target artifact is called. Note that this is not only a concurrency
blocker. Sequentially, the second target already overwrites the first target's three findings files,
so a multi-target review keeps only the last target's findings on disk. The concurrent form makes
the collision simultaneous rather than creating it.

Its sibling, `workflow-authoring/activities/08-quality-review.yaml` (R2), does not have the problem:
it accumulates into `register_sections` instead of writing per-iteration files.

### B4. The implementation task cycle

`work-package/activities/08-implement.yaml`, loop `task-cycle` over `implementation_plan.tasks`.

**Every iteration mutates one working tree and one branch.** The body implements, runs a
crate-scoped `cargo-operations::test`, commits through `manage-git::artifact-commits`, appends a
provenance row, self-reviews, and collects assumptions. Two iterations sharing a git index is not a
race that ordering fixes.

**Decision required:** whether per-task isolation is worth its price. The mechanism exists —
`meta/activities/patterns/04-isolated-fan-out.yaml` offers `isolation_mode` of `context` or
`worktree` — so this is a question about whether an implementation plan's tasks are ever independent
enough to be worth a worktree each, not about whether the corpus could express it. Tasks in a plan
are commonly ordered by construction, which argues no.

---

## Not a candidate — 17

Concurrency is unreachable, for a reason that holds structurally.

### One operator, one open question — 12

`schemas/session-file.schema.json` declares `activeCheckpoint` as a single object. A session holds at
most one checkpoint outstanding, so two iterations that both stop to ask cannot both be waiting. Ten
of these loops hold a checkpoint directly; two hold a dialogue that needs the operator's answer
before the next step runs, which fails for the same reason one step earlier.

| Site | Loop | Why |
|---|---|---|
| `meta/activities/02-resolve-target.yaml` | `component-selection` | Offers one submodule at a time and stops; the next iteration exists only because the operator declined the last |
| `workflow-design/activities/03-requirements-refinement.yaml` | `dimension-elicitation-loop` | Surfaces a dimension's questions and captures the answers — a dialogue per dimension |
| `workflow-design/activities/06-scope-and-draft.yaml` | `file-drafting-loop` | Three checkpoints per file: approach, review, preservation |
| `workflow-authoring/activities/06-scope-and-draft.yaml` | `file-drafting-loop` | Preservation checkpoint per file |
| `prism-evaluate/activities/05-resolution-dialogue.yaml` | `finding-iteration` | An inner `doWhile` around a four-option finding checkpoint |
| `work-package/activities/03-requirements-elicitation.yaml` | `domain-iteration` | Asks the operator a question per domain |
| `work-package/activities/04-research.yaml` | `assumption-interview` | Interview, checkpoint, record |
| `work-package/activities/05-implementation-analysis.yaml` | `assumption-interview` | Interview, checkpoint, record |
| `work-package/activities/07-assumptions-review.yaml` | `assumption-interview-loop` | Interview, checkpoint, record |
| `work-package/activities/08-implement.yaml` | `assumption-interview` | Interview, checkpoint, record |
| `work-package/activities/10-post-impl-review.yaml` | `block-interview-loop` | A checkpoint per flagged change block |
| `work-package/activities/14-complete.yaml` | `deferred-item-raise-loop` | A raise-or-leave checkpoint per deferred row |

### A different layer, excluded by the epic — 3

Each iteration triggers a child workflow through `workflow-engine::handle-sub-workflow`. Running
sessions or activities concurrently is named as a non-goal in #539 and held out of #527, and
`anti-patterns.md`'s `duplicate-shared-capability` keeps session-level `dispatch-activity` separate
from mid-phase fan-out in its own carve-out.

| Site | Loop | Over |
|---|---|---|
| `prism-audit/activities/02-execute-analysis.yaml` | `scope-iteration` | `audit_scopes` |
| `prism-evaluate/activities/02-execute-analysis.yaml` | `group-iteration` | `execution_groups` |
| `work-packages/activities/07-implementation.yaml` | `package-iteration` | `remaining_packages` |

The third has a second, independent reason: `execute-package` reads `remaining_packages` and rewrites
both it and `completed_packages` each pass, so the collection is a cursor the loop consumes rather
than a fixed set it walks.

### The sequential member of a pair — 2

`meta/activities/patterns/03-plan-and-execute.yaml`, loops `execute-steps` and
`execute-after-replan`, both over `execution_plan.steps`.

Plan steps run in order because ordered execution is what the pattern is. The library's concurrent
member is `01-orchestrator-workers.yaml`, and `04-isolated-fan-out.yaml` and `05-lead-researcher.yaml`
sit beside them. Making this one concurrent would delete the distinction the library exists to draw.

---

## Already concurrent, contract absent — 2

Both run concurrently today. Neither names a construct, and they need different things.

### A1. The cargo validation suite

`meta/techniques/cargo-operations/run-suite.md`, Protocol steps 1 and 2: start four concurrent shell
invocations of `check`, `clippy`, `test` and `fmt-check` against the same build scope; wait for all
four; do not short-circuit on the first failure.

**Nothing in the corpus names this.** `harness-compat::spawn-concurrent` states its capability as
dispatching independent *agents* in parallel, and every harness slice under `harness-compat/`
resolves it to emitting several agent calls in one turn. Four shells in one caller's own turn are a
different mechanism. `scatter-gather` inherits the same limit through its parallel mode, which
dispatches via `spawn-concurrent`.

The protocol carries all four elements the epic wanted binding guidance for, written out in prose:
the work-unit shape (four named ops over one build scope), the combine hook (step 3's envelope fold),
wait-for-all (step 2, explicitly), and the degrade path (step 1's blockquote — halve the job cap, and
on very tight hosts run check, clippy and test sequentially).

**This is not a duplicate-shared-capability finding.** That entry's **Do not flag** covers "adding a
new shared op when no shared capability exists yet", and for shell concurrency none does. What the
site needs is the contract, not a rebind — which is the residue of W1, now precisely scoped.

The group's `foreground-only` rule already accommodates this site: several foreground shells running
concurrently in one caller stay within it, and backgrounded worker dispatches do not.

### A2. Prism's four behavioural lenses

`prism/techniques/behavioral-pipeline/independent-lenses.md`, Protocol step 3 and rule
`independent-lenses-parallel`: the four lenses share no context, may be dispatched concurrently up to
four at once, and only the synthesis pass depends on their outputs.

**This one the shared home does cover.** Four independent units, dispatched together, each writing
its own artifact, with a combine downstream is `scatter-gather` parallel mode exactly, and the
dispatch is of agents. Re-teaching it locally is what `duplicate-shared-capability`'s **Detect**
names: "local re-teaching of concurrent `Task` / spawn-concurrent / dispatch-then-merge pipelines
when `orchestration-patterns` or a borrowable `meta/activities/patterns/` activity already covers the
shape".

The rule is also stranded. It states a policy about how a technique's own protocol step behaves, and
`design-principles.md`'s Atomic Techniques stance puts composition at the activity. The lens fan-out
belongs to `prism/activities/01-structural-pass.yaml`, which is where the technique is bound.

### The plan nobody reads

Recorded here because it belongs with the two above rather than with a loop.

`prism/techniques/plan-analysis.md` declares an output component `parallelism_plan` — "Which units
can run concurrently (multi-unit scopes only)" — and `prism/resources/analysis-plan.md` reserves a
**Concurrent** line for "which units may run at the same time". `analysis_units`, the machine-readable
output beside it, carries `{ target, target_type, pipeline_mode, lens_name, lenses, role, risk,
rationale, unit_output_subdir }` and no concurrency field. No prism activity or workflow file mentions
concurrency at all.

Prism decides which of its units are independent, writes the decision into a document for a human,
and then walks the units one at a time. Everywhere else in this inventory the independence judgement
had to be made by reading; here the workflow makes it and discards it.
