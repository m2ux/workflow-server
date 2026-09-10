# F. What a promoted workflow must declare to exist at all

# F. What a promoted workflow must declare to exist at all

## 0. The short answer

Three fields make a workflow *load*: `id`, `version`, `title`. Nothing else is required by the schema, and a directory holding only those three is discoverable, startable and dispatchable with no edit to any registry. The cost of a promotion is therefore almost entirely **guard obligation and variable-contract obligation**, not schema obligation — and the two that bite hardest are `activity-variables` (hard zero, no ledger) and `checkpoint-entry`.

---

## 1. The schema

### 1.1 Required fields

`schemas/workflow.schema.json` is **generated from the zod schema** (`scripts/generate-schemas.ts:18-19`) and is not what validates at load; the runtime authority is `WorkflowSchema` in `src/schema/workflow.schema.ts:54-74`, applied at `src/loaders/workflow-loader.ts:299-302`.

| Object | Required | Cite |
|---|---|---|
| workflow | `id`, `version` (must match `^\d+\.\d+\.\d+$`), `title` | `schemas/workflow.schema.json:830-834`; `src/schema/workflow.schema.ts:56-58` |
| variable | `name`, `type` | `schemas/workflow.schema.json:351-354` |
| activity | `id`, `version`, `name` | `schemas/workflow.schema.json:819-823`; `src/schema/activity.schema.ts:277-281` |
| exit | `id` | `schemas/workflow.schema.json:760-762` |
| checkpoint fragment body | `message`, `options` (minItems 1) | `schemas/workflow.schema.json:232-235`, `:116` |
| checkpoint option | `id`, `label` | `schemas/workflow.schema.json:110-113` |
| step `kind: technique` | `kind`, `technique` | `schemas/workflow.schema.json:566-569` |
| step `kind: action` / `kind: checkpoint` | `kind`, `id` | `:601-604`, `:654-657` |
| step `kind: loop` | `kind`, `id`, `loopType`, `steps` | `:720-725` |
| trigger | `workflow` | `:788-790` |
| `bundleTechniques` | `maxChars` | `:453-455` |

One divergence worth knowing: the generated JSON Schema declares `additionalProperties: false` at the workflow root (`:835`), but the runtime `z.object` uses strip semantics — so an unknown top-level key is **rejected by an editor validating against the file and silently dropped by the server**.

### 1.2 Fields whose omission changes behaviour

| Field | Omitted means |
|---|---|
| `initialActivity` | No load failure. `validateActivityTransition` only pins the first activity when it is set (`src/utils/validation.ts:34-38`), so the first `next_activity` becomes unchecked. `dispatch_child` returns `initialActivity: undefined`, so the parent has nothing to name (`src/tools/resource-tools.ts:623`, description at `:450`). And the reachability half of `check-activity-variables` **silently disables itself**: `unreachableReads` returns `[]` when there is no `initialActivity` (`src/utils/activity-variables.ts:593`). Walkers fall back to `activities[0].id` (`tests/e2e/walker.ts:643-644`), as does `check-review-mode-gating` (`scripts/check-review-mode-gating.ts:203`) |
| `graph` | Every exit any activity declares becomes unbound, and unbound exits fail the load (`src/loaders/workflow-loader.ts:532-534`). Omissible only by a workflow whose activities declare no exits (`schemas/workflow.schema.json:392`) |
| `variables[].defaultValue` | The name is **absent from the session bag**: `seedDefaults` copies only declarations carrying one (`src/utils/variable-seed.ts:12-17`), and that is the whole of a child's seed (`src/tools/resource-tools.ts:482-485`) |
| `variables` on the workflow file | A read no activity in the graph writes becomes an `unwritten-read` finding — see §4.3(c) |
| `description`, `tags` | The entire discovery surface disappears — see §3 |
| `rules`, `techniques` | Nothing is injected into `get_workflow` / `get_activity` (`src/tools/workflow-tools.ts:611-613`) |
| `activities` (whole key absent) | The workflow **loads clean with no activities**: the key is optional, and the loader assigns it only when something resolved (`src/loaders/workflow-loader.ts:290-292`; `src/schema/workflow.schema.ts:73`). `activities: []` written explicitly *does* fail (`min(1)`) |

---

## 2. Exactly when a load fails

Entry point: `loadWorkflowWithDiagnostics` (`src/loaders/workflow-loader.ts:239-375`). The distinction that matters for pricing a promotion is **fail vs. silently exclude**.

| Candidate | Verdict | Cite |
|---|---|---|
| No `workflow.yaml`/`.yml` under `<dir>/`, and no root-level `<id>.yaml` | `WorkflowNotFoundError` | `:105-119`, `:240-241` |
| Schema-invalid assembled workflow | `WorkflowValidationError` | `:299-302` |
| **Unbound exit** (graph has no entry for `activity.exit`) | **FAILS** | `:532-534` → `:366-367` |
| **Unresolvable activity path** | **FAILS — but only for the explicit string-ref form** in `activities[]`: `throw new Error('Failed to resolve activity reference: …')`, caught and returned as a validation error | `:271-274`, `:371-374` |
| An activity file in the local `activities/` dir that is unparsable or schema-invalid | **Does NOT fail.** Excluded and reported in `activityLoadErrors` | `:74-79`, `:84-87` |
| An activity whose checkpoint `ref` does not resolve | **Does NOT fail.** Excluded and reported | `:333-341` |
| **Missing `initialActivity`** | **Does NOT fail** — optional in both schemas | `src/schema/workflow.schema.ts:66`; `schemas/workflow.schema.json:380-383` |
| **Graph naming an activity the workflow does not include** | **FAILS** | `:554-557` |
| Graph binding an exit the activity does not declare | **FAILS** | `:561-563` |
| Graph destination not in the workflow and not `__terminal__` | **FAILS** | `:565-567`, sentinel at `:584` |
| **Duplicate exit id within one activity** | **FAILS** | `:530` |
| Two or more exits with none or several `isDefault` | **FAILS** | `:537-541` |
| Checkpoint option selecting an exit the activity does not declare | **FAILS** | `:544-551` |
| Two activity declarations of one variable name disagreeing on type / default / value set | **FAILS** | `:350-356` |
| **Duplicate activity id across two files in `activities/`** | **Does NOT fail.** Both are loaded; `getActivity` returns whichever `readdir` yielded first. Only the `workflow-yaml` guard reports it | `:59-93`, `:437-439`; `scripts/validate-workflow-yaml.ts:28-46` |
| **Duplicate workflow id across two directories** | **Does NOT fail anything.** `loadWorkflow` keys on the **directory name**, never on the declared `id`, and nothing compares the two | `:105-119`; `scripts/validate-workflow-yaml.ts:125` |

Two consequences for a promotion proposal:

- A **silently excluded activity is worse than a load failure.** `knownActivityIds` deliberately includes the ids of activities whose files failed (`:362-365`), so the graph binding to an excluded activity raises no second error. The workflow loads, `get_workflow` reports it in `activityLoadErrors`, and the run dies at `next_activity`/`get_activity`. Moving an activity file into a new workflow re-scopes its **bare** fragment refs to the new workflow then `meta` (`src/loaders/fragment-resolver.ts:47-54`), so a bare ref into a `work-package` fragment becomes exactly this: a loadable workflow with a missing activity.
- Nothing enforces `directory name == declared id`. A promotion that names the directory one thing and the `id:` another produces a workflow that loads under the directory name and *lists* under the declared id.

---

## 3. Discoverability: there is no index, registry or manifest

`list_workflows` is a **directory scan**, executed per call:

- Tool: `src/tools/workflow-tools.ts:580-586` → `listWorkflowsWithDiagnostics` (`src/loaders/workflow-loader.ts:386-434`).
- `readdir(workflowDir)` (`:390`), skip the `meta` entry (`:394`), accept either a directory holding `workflow.{yaml,yml}` or a root-level `*.yaml` (`:399-409`), read raw and emit a manifest **only if `id`, `title` and `version` are all present** (`:415`) — otherwise a `load_errors` entry (`:419`).
- `start_session` accepts any `workflow_id` and resolves it through `loadWorkflow` by directory name (`src/tools/resource-tools.ts:240`, `:407`). No allowlist, no enum. `dispatch_child` the same (`:471-472`).

So **a new directory under `workflows/` appears automatically and nothing must be edited for the server to see it.** The technique confirms it is one call: `workflows/meta/techniques/workflow-engine/list-workflows.md:18` — "Call `list_workflows` and return its result as the `{workflow_catalog}`". Selection then scores the catalog's own fields: `workflows/meta/techniques/workflow-engine/match-target-workflow.md:33` scores "by title, description keywords, and `tags`", and its rule `actionable-target-outranks-tag-overlap` says an entry earns a named PR or issue "only by declaring in its `title` or `description` that it carries one end-to-end". There is no hard-coded catalog anywhere; the meta activity binds the technique and nothing else (`workflows/meta/activities/00-discover-session.yaml:79-81`).

**Practical reading:** `title`, `description` and `tags` are not cosmetic on a promoted child. They are the whole of its routing from a user request, and if the child is meant to be reachable only via `dispatch_child` from its parent, they are how it *avoids* being matched instead of the parent.

Two things must still be edited by hand, neither of them a registry the server reads:

1. **`tests/e2e/walked-workflows.ts`** — the new workflow must go on `WALKED` (`:20-35`) or on `NOT_WALKED` with a reason (`:51-55`). `tests/e2e/coverage-roster.test.ts:22-35` fails otherwise, and it is deliberately in the fast suite, not the walk, so it fails on the change that opens the gap.
2. **`workflows/README.md:51`** — the "Available Workflows" table. A convention; I found no guard that reads it.

---

## 4. The 36 guard registry entries

`scripts/guards.ts:28-315` holds 36 specs; `check:all` spawns every one (`scripts/check-all.ts:18`, `:59-76`) and exits 2 rather than 0 when any could not measure. Corpus guards abort when they scanned nothing (`scripts/workflows-root.ts:85-90`), so "did not apply to this workflow" is a per-workflow skip inside a guard, never a whole-guard pass.

### 4.1 Applies to a brand-new workflow directory

| id | Applies when | What it checks |
|---|---|---|
| `activity-variables` | **Always** (any activities) | Hard zero, no ledger (`scripts/check-activity-variables.ts:25`). Six families: `undeclared-use`, `unused-declaration`, `unwritten-read`, `unread-write`, `undeclared-crossing`, `unreachable-read` (header `:19-27`, checks at `:159-224`, `:226-252`) |
| `workflow-yaml` | **Always** | Loads through the real loader (`scripts/validate-workflow-yaml.ts:130`), every activity file carries an `NN-` prefix (`:33-35`), no duplicate activity ids (`:41-45`), and no unanchored multi-word snake_case token in any technique `## Protocol` (`:69-97`) |
| `activities` | Has activity files | Every activity file validates against the activity schema |
| `resource-anchors` | **Always** | Walks every `.md` and `.yaml` under the corpus root (`scripts/check-resource-anchors.ts:72-80`, `:91`) — the new workflow's own `README.md` included. Every anchored relative link resolves to a rendered heading; every fence closes |
| `checkpoint-entry` | Has activities | `steps[0].kind == "checkpoint"` is a finding — no activity may open on a gate (`scripts/check-checkpoint-entry.ts:18`, `:38-41`) |
| `decision-order` | Has checkpoints + gated steps | No checkpoint decides a value an earlier step already read |
| `description-hygiene` | Has activities | Activity `description` stays WHAT-only; a `kind: technique` step carries no `description`/`name` |
| `variable-model` | Has variables | `exists-on-defaulted`, `default-type-mismatch`, `setvariable-type-mismatch` |
| `when-expression` | Has `when:` gates | Parses under the reference dialect; mixed `&&`/`||` parenthesised |
| `loop-shape` | Has loop steps | An item loop declares `over`+`variable`+`breakCondition`; a repeat-until loop declares `continueWhile`; neither declares the other's |
| `set-action-values` | Has `set` actions | Every `set` names a `target`; a `value` naming a variable is braced |
| `self-provisioned-input` | Has `set` + interpolation | No step interpolates its own `set` target into its technique inputs |
| `self-composed-set` | Has `set` actions | No `set` builds its value out of the variable it writes |
| `activity-technique-overlap` | Activities declare both `techniques[]` and step bindings | Hard zero: the two must be disjoint |
| `refs` | Activities/workflow declare `techniques[]` | Every reference resolves through the real loader |
| `binding-fidelity` | Has step bindings | Arg conformance, read resolution, producers for reads, consumers for outputs. Triage: `scripts/binding-fidelity-triage.json` |
| `fragments` | Uses `ref` or declares `fragments` | `malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, **`unused-fragment` (corpus-wide)**, `inline-duplicate-of-fragment`, `duplicate-rule`, `duplicate-checkpoint`, **`undeclared-effect-variable`** — the referencing workflow's `variables[]` must declare every variable a referenced fragment's `setVariable` writes (`scripts/check-fragments.ts:11-28`) |
| `technique-template` | Authors technique `.md` files | Frontmatter `metadata.version` only, no H1, exactly the canonical five H2s in order, snake_case I/O ids, kebab-case rule names. `README.md` is skipped (`scripts/check-technique-template.ts:193`) |
| `identifier-qualification` | Authors techniques | Every `###` I/O heading is a qualified noun phrase, never a bare word |
| `inherited-inputs` | Authors a `techniques/` tree with a container `TECHNIQUE.md` | No leaf redeclares an inherited input |
| `branch-as-step` | Authors technique Protocols | A conditional sub-bullet must be a `>` note, not a peer step |
| `citation-grain` | Its techniques cite resources | No resource cited both bare and by anchor |
| `section-framing` | Authors resources | No prose stranded above the first `##`. Triage: `workflows/section-framing-triage.json` |
| `audience` | Its own techniques declare `#### artifact` outputs | Each declares an `#### audience`; an `agent`-audience artifact has a `.json` name (`scripts/check-audience.ts:104-132`) |
| `artifact-guides` | Same trigger | Each artifact filename resolves to a guide, via a `## Planning artifact to guide map` row in `<workflow>/resources/README.md` or a resource naming the file and carrying a `## Template` heading (`scripts/check-artifact-guides.ts:13-18`, `:235-266`) |
| `checkpoint-presentation` | Authors `rules` (workflow `rules`, `fragments.rules`, or activity `rules`) | No rule restates when a gate is presented (`scripts/check-checkpoint-presentation.ts:139-176`) |
| `pinned-corpus-paths` | Indirectly, on the *move* | Any repo TS literal of the form `<workflow>/(techniques|activities|resources)/….(md|yaml)` must still resolve (`scripts/check-pinned-corpus-paths.ts:38`, `:31`, `:89-110`). Today no non-comment literal names a `work-package` activity file, so a promotion out of `work-package` is clean here *now* |

### 4.2 Does not apply

| id | Why |
|---|---|
| `review-mode-gating` | Skipped unless `workflow.yaml` declares an `is_review_mode` variable (`scripts/check-review-mode-gating.ts:191-192`) |
| `stealth-isolation` | `--workflow` defaults to `remediate-vuln` (`scripts/check-stealth-isolation.ts:56`) |
| `prism-lens-reachability` | Hard-scoped to `prism/` (`scripts/check-prism-lens-reachability.ts:35-38`) |
| `harness-adapter-set` | Hard-scoped to `meta/techniques/harness-compat` (`scripts/check-harness-adapter-set.ts:45`) |
| `bootstrap-self-contained` | Owns `meta/resources/bootstrap-protocol.md` (`scripts/check-bootstrap-self-contained.ts:59`). It indexes every workflow's technique rules, but only to decide whether a dotted-rule address *in that one file* resolves |
| `site-links`, `svg-layout` | `scope: 'repo'` — `site/**` only |
| `source-encoding` | `scope: 'repo'`, and `SKIP_DIRS` excludes `workflows` outright (`scripts/check-source-encoding.ts:33`) |
| `lockfile-denylist` | `scope: 'repo'` — `package-lock.json` |

### 4.3 What a small promoted workflow fails **by construction**

**(a) `artifact-guides` + `audience` — the artifact-guide map.** A promoted workflow that persists even one artifact from a technique of its own must, in the same change, declare an `#### audience` on the output, use a `.json` filename if that audience is `agent`, and *either* author `<new-workflow>/resources/README.md` with a `## Planning artifact to guide map` row for the filename *or* author a guide resource carrying a `## Template` and `## Rules`. There is no baseline to lean on: `scripts/check-artifact-guides.ts:26-27` states no baseline file exists and the triage is "the escape hatch for a deliberate gap, not a standing allowance". **This is the README convention the question asked after — it is `resources/README.md`, and it is guard-enforced.** (If the promoted activities keep *citing* the parent's techniques rather than re-authoring them, this cost is zero, because the guard keys on the *producing* workflow's technique tree.)

**(b) `checkpoint-entry` — the shape a promotion naturally wants.** The instinctive promoted workflow opens by confirming its scope, then works. That is `steps[0].kind == "checkpoint"` and it fails. The gate has to move into the parent's tail — or the child's first activity has to carry real work in front of its first gate.

**(c) `activity-variables` — the entry bag, and this is the expensive one.** `owned` is exactly the names the child's **own `workflow.yaml`** declares, read from the raw file before the loader folds activity writes in (`scripts/check-activity-variables.ts:94`, `:96-101`). Every name a promoted activity reads that no activity in the child's graph writes must be in that list, or it is an `unwritten-read` (`:210-214`) — the exemption set is three names wide: `AMBIENT_CONTEXT_IDS = {target_symbol, impact_report, model_id}` (`src/utils/binding-provenance.ts:33`). And it must be present at entry, or it is an `unreachable-read` of kind `entry` (`:226-252`). Hard zero, no ledger.

Two traps inside this:

- **The guard is more forgiving than the runtime.** `availableAtEntry` admits *every* `owned` name regardless of `defaultValue` (`:228`), then adds folded declarations that carry one (`:229-231`). The server seeds only declarations carrying a `defaultValue` (`src/utils/variable-seed.ts:15`). So a child can pass `activity-variables` with an undefaulted workflow-file declaration and still run with that name **absent from the bag**.
- **A `defaultValue` is a constant, not the parent's value.** The schema says it outright on `triggers[].passContext`: "The server does not copy them — a child session's bag starts from the child workflow's own declared defaults, nothing more" (`schemas/workflow.schema.json:785`). So the only way a promoted workflow legitimately satisfies a read of a parent-computed value is for its own first activity to *produce* it.

**(d) `variable-model` closes the obvious escape.** Declaring the name with a `defaultValue` and gating on `exists`/`notExists` is itself a finding: seeding makes the gate constant (`schemas/workflow.schema.json:343`; `scripts/guards.ts:217`).

**(e) `fragments` bites in both directions.** Copying `work-package`'s fragment block into the child and referencing only part of it yields `unused-fragment` (corpus-wide). Moving the *last* referencing activity out of `work-package` leaves that workflow's fragment unused, which is the same finding on the other side. And a fragment whose `setVariable` effects write a name the child's `variables[]` does not declare is `undeclared-effect-variable`.

**(f) No lifecycle-table obligation exists.** I searched the guard set and found none: `lifecycle` appears only in `scripts/check-binding-fidelity.ts`, `scripts/generate-site-data.ts`, `scripts/binding-fidelity-triage.json` and `docs/development.md`, in none of those as a table a new workflow must populate.

---

## 5. The option-coverage walk

### 5.1 How it enumerates

Entry point `tests/e2e/option-coverage.test.ts`, `describe.skipIf(process.env.WF_OPTION_COVERAGE !== '1')` (`:93`), invoked as `WF_OPTION_COVERAGE=1 vitest run tests/e2e/option-coverage.test.ts` (`package.json:23`).

Two different enumerations, and the distinction is the whole answer:

- **Subjects walked** come from the hand-maintained `WALKED` list (`tests/e2e/walked-workflows.ts:20-35`), narrowable by `WF_COVERAGE_SCOPE` (`tests/e2e/option-coverage.test.ts:70-72`).
- **The denominator** comes from a **directory scan**: `corpusWorkflows()` = `readdirSync(corpusRoot()).filter(d => existsSync(d/workflow.yaml)).sort()` (`:83-86`), used as `measured` on an unscoped run (`:109`), then `declaredOptions(measured)` (`:110`).

The key shape is the decisive fact: `checkpoint:<activityId>:<checkpointId>=<optionId>` — **no workflow id** (`tests/e2e/coverage.ts:21-23`). `declaredCheckpoints` keys by `${activity.id}:${cp.id}` and dedupes across workflows, explicitly so that "an activity two workflows share is the same checkpoints either way, so it is counted once and either workflow's walk can cover it" (`tests/e2e/coverage.ts:60-96`).

### 5.2 So: does a split require a re-baseline?

**The declared set does not move.** Splitting a graph across two workflows while keeping the same activity files and the same activity / checkpoint / option ids leaves `option-coverage.json`'s subject matter byte-identical. On that account, no re-baseline.

**Five other things do move, and four of them are hard failures:**

1. **The roster.** `tests/e2e/coverage-roster.test.ts:22-35` fails until the new workflow is on `WALKED` or `NOT_WALKED`. This is in the ordinary suite, not the walk.
2. **The numerator, and therefore the expectation file.** `enumeratePaths` drives one `start_session` per workflow id and walks that workflow's own graph from its own `initialActivity` (`tests/e2e/walker.ts:622-626`, `:643-644`, `:656`). **Nothing in `walker.ts` calls `dispatch_child`** — the walk never crosses a parent→child boundary. So after a split, options in the promoted activities are reached only if the child is on `WALKED` and its *own* graph reaches them. Both directions fail:
   - An option that used to need fifteen parent activities may become reachable from the child's first activity. It must then be **deleted** from `option-coverage.json` — a listed-but-now-covered option fails, and "the list is only allowed to shrink" (`tests/e2e/option-coverage.test.ts:198-202`).
   - An option whose gate depended on a parent-computed value the child's entry bag cannot hold becomes unreachable and must be **added** with a reason under a matching group (`:193-197`).
3. **A load error takes the whole walk down.** `declaredCheckpoints` throws on any measured workflow that fails to load — "Unmeasured is not the same as covered" (`tests/e2e/coverage.ts:71-73`). It reads the corpus by directory scan, so the new workflow is measured whether or not it is walked.
4. **The corpus stamp.** `option-coverage.json` is asserted fresh against the checked-out corpus SHA before anything else (`tests/e2e/option-coverage.test.ts:98-104`; `tests/stamp-freshness.ts:10-16`). Any corpus commit — the promotion included — needs `npm run baseline:stamp` in the same commit (`package.json:59`).
5. **The `DRY_WALKS` plateau bound** (`tests/e2e/option-coverage.test.ts:57`) is described as "a property of the graph, so it has to be re-measured whenever the graph grows" (`:50-56`). A split changes both graphs' fork trees.

Also automatic, needing no edit: `tests/e2e/all-workflows-walk.test.ts:33-40` enumerates by the same directory scan, so the new workflow immediately gets a graph-reachability walk that must reach at least one activity and resolve every activity-level technique reference.

### 5.3 One argument in the split's favour, from this file

The walk's wall clock is the slowest single walk, and `work-package` **is** that walk: "work-package accounts for 1,269 of those 1,269 seconds, the other thirteen finishing inside its window" (`tests/e2e/option-coverage.test.ts:122-130`), and "Anything that wants this job faster makes that walk cheaper rather than running more walks together" (`:130`, echoed `:215-217`). Splitting `work-package` into two workflows that walk concurrently is precisely the change that file names as the one that would help — the roster comment makes the same point: "an addition anywhere but the top is free" (`tests/e2e/walked-workflows.ts:15-18`).

---

## 6. Minimum viable promoted workflow — the priced list

**To load and be discoverable:** `workflows/<dir>/workflow.yaml` with `id` (match it to `<dir>`, since nothing checks), semver `version`, `title`, plus `description` and `tags` for the matcher.

**To be runnable:** `initialActivity`, a `graph` binding every exit of every activity, and `activities/NN-<id>.yaml` files each carrying `id`, `version`, `name`.

**To pass `check:all`:** the §4.1 obligations, of which the four with real authoring cost are — a `variables[]` block on the child's own workflow file covering every read no child activity writes (§4.3c), a first activity that does work before its first gate (§4.3b), a `resources/README.md` guide map or guide resource for any artifact its own techniques persist (§4.3a), and fragment refs qualified or re-declared after the move (§4.3e).

**To pass the test suite:** a `WALKED`/`NOT_WALKED` entry, a re-recorded `option-coverage.json` for any option whose reachability moved, and `npm run baseline:stamp` in the same commit.


## Corrections to prior premises

- The prompt's established facts say the child bag is `seedDefaults(wf.variables)` "plus `user_request` where the child declares it". The code adds `user_request` unconditionally whenever the parent bag holds one, regardless of whether the child workflow declares it: `...(inheritedRequest !== undefined ? { user_request: inheritedRequest } : {})` at /home/mike1/projects/dev/workflow-server/src/tools/resource-tools.ts:481-485. The comment at :478-480 says "A child that declares `user_request` resolves it; one that does not is unaffected" — which is about whether the child can *read* it, not about whether it lands in the bag. A promoted workflow therefore receives `user_request` without declaring it, but must still declare it in its own workflow.yaml#variables to read it without an `unwritten-read` finding (/home/mike1/projects/dev/workflow-server/scripts/check-activity-variables.ts:210-214).
- The question's premise that "an unresolvable activity path" fails the load is only half right. It fails only for the explicit string-reference form in `activities[]` (/home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:271-274). An activity file in the workflow's own `activities/` directory that is unparsable or schema-invalid is excluded and reported in `activityLoadErrors`, and the workflow loads (:74-79, :84-87) — as is an activity whose checkpoint `ref` does not resolve (:333-341). Because `knownActivityIds` deliberately includes the ids of failed files (:362-365), the graph binding to an excluded activity raises no second error, so the workflow loads with a hole in it.
- The question's premise that "a missing `initialActivity`" is a load failure is wrong: it is optional in both the runtime zod schema (/home/mike1/projects/dev/workflow-server/src/schema/workflow.schema.ts:66) and the generated JSON Schema (/home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:380-383). Its omission instead silently disables the reachability half of the `activity-variables` guard (/home/mike1/projects/dev/workflow-server/src/utils/activity-variables.ts:593) and removes the first-activity check on `next_activity` (/home/mike1/projects/dev/workflow-server/src/utils/validation.ts:34-38).
- The question's premise that "a duplicate id" fails the load holds for only one of the three senses. A duplicate exit id within an activity fails (/home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:530). A duplicate activity id across two files in `activities/` does not — both load and `readdir` order decides which `getActivity` returns (:59-93, :437-439); only the `workflow-yaml` guard reports it (/home/mike1/projects/dev/workflow-server/scripts/validate-workflow-yaml.ts:28-46). A duplicate workflow `id:` across two directories fails nothing at all: `loadWorkflow` keys on the directory name and nothing compares it to the declared `id` (:105-119; /home/mike1/projects/dev/workflow-server/scripts/validate-workflow-yaml.ts:125).

## Confidence

Certain, read at source and cited: the required-field sets in both the generated JSON Schema and the runtime zod schema; every load-failure and load-exclusion branch in `loadWorkflowWithDiagnostics` and `validateExitBindings`; that discoverability is a per-call directory scan with no index, registry or manifest anywhere in the path (`list_workflows`, `start_session`, `dispatch_child`); the scope of all 36 guard registry entries, verified by reading each script's enumeration rather than only its header; the option-coverage key shape and the fact that `declaredCheckpoints` dedupes a borrowed activity across workflows, which is what makes a split re-baseline-free on the declared side; and that `walker.ts` contains no `dispatch_child` call, so no walk ever crosses a parent-to-child boundary (grep returned nothing).

Two claims are inference from code I read rather than from an observed run: (1) that `zod-to-json-schema` emits `additionalProperties: false` for a strip-mode `z.object`, which is what produces the editor-versus-server divergence at `schemas/workflow.schema.json:835` — I read both files and the generator, but did not execute the generator to confirm; (2) my per-guard "applies when" column for the seven guards whose bodies I sampled by grep rather than reading whole (`inherited-inputs`, `citation-grain`, `decision-order`, `self-provisioned-input`, `self-composed-set`, `branch-as-step`, `activity-technique-overlap`) — the trigger surface is clear from their enumeration lines and headers, but a conditional skip deeper in one of them could narrow it further.

What I could not settle from the corpus: whether the promoted workflows would in practice be walked concurrently by the coverage job, since that depends on the runner's CPU rather than on any file — the test's own measurements (`tests/e2e/option-coverage.test.ts:122-130`) say the walks share one event loop and the wall clock is already the slowest single walk, so the *claimed* benefit of a split is credible but is a property of the machine. I also did not verify the real cost of the guard sweep against an actual new-workflow directory; establishing that would mean scaffolding a minimal `workflows/<id>/` tree in a worktree and running `npm run check:all -- --root <worktree>/workflows`, which is the one measurement that would price §4.3 exactly rather than by construction.

## Citations

- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:830-834
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:835
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:351-354
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:819-823
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:760-762
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:232-235
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:110-113
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:566-569
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:601-604
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:654-657
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:720-725
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:788-790
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:453-455
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:380-383
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:392
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:343
- /home/mike1/projects/dev/workflow-server/schemas/workflow.schema.json:785
- /home/mike1/projects/dev/workflow-server/src/schema/workflow.schema.ts:54-74
- /home/mike1/projects/dev/workflow-server/src/schema/workflow.schema.ts:56-58
- /home/mike1/projects/dev/workflow-server/src/schema/workflow.schema.ts:66
- /home/mike1/projects/dev/workflow-server/src/schema/workflow.schema.ts:73
- /home/mike1/projects/dev/workflow-server/src/schema/activity.schema.ts:277-281
- /home/mike1/projects/dev/workflow-server/scripts/generate-schemas.ts:18-19
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:59-93
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:74-79
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:84-87
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:105-119
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:239-375
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:240-241
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:271-274
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:290-292
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:299-302
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:333-341
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:350-356
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:362-367
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:371-374
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:386-434
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:390
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:394
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:399-409
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:415
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:419
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:437-439
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:520-572
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:530
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:532-534
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:537-541
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:544-551
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:554-557
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:561-567
- /home/mike1/projects/dev/workflow-server/src/loaders/workflow-loader.ts:584
- /home/mike1/projects/dev/workflow-server/src/loaders/fragment-resolver.ts:38-54
- /home/mike1/projects/dev/workflow-server/src/utils/validation.ts:34-38
- /home/mike1/projects/dev/workflow-server/src/utils/activity-variables.ts:593
- /home/mike1/projects/dev/workflow-server/src/utils/variable-seed.ts:12-17
- /home/mike1/projects/dev/workflow-server/src/utils/binding-provenance.ts:33
- /home/mike1/projects/dev/workflow-server/src/tools/workflow-tools.ts:580-586
- /home/mike1/projects/dev/workflow-server/src/tools/workflow-tools.ts:611-613
- /home/mike1/projects/dev/workflow-server/src/tools/resource-tools.ts:240
- /home/mike1/projects/dev/workflow-server/src/tools/resource-tools.ts:407
- /home/mike1/projects/dev/workflow-server/src/tools/resource-tools.ts:450
- /home/mike1/projects/dev/workflow-server/src/tools/resource-tools.ts:471-472
- /home/mike1/projects/dev/workflow-server/src/tools/resource-tools.ts:481-485
- /home/mike1/projects/dev/workflow-server/src/tools/resource-tools.ts:623
- /home/mike1/projects/dev/workflow-server/workflows/meta/techniques/workflow-engine/list-workflows.md:18
- /home/mike1/projects/dev/workflow-server/workflows/meta/techniques/workflow-engine/match-target-workflow.md:33
- /home/mike1/projects/dev/workflow-server/workflows/meta/activities/00-discover-session.yaml:79-81
- /home/mike1/projects/dev/workflow-server/workflows/README.md:51
- /home/mike1/projects/dev/workflow-server/scripts/guards.ts:28-315
- /home/mike1/projects/dev/workflow-server/scripts/guards.ts:217
- /home/mike1/projects/dev/workflow-server/scripts/check-all.ts:18
- /home/mike1/projects/dev/workflow-server/scripts/check-all.ts:59-76
- /home/mike1/projects/dev/workflow-server/scripts/workflows-root.ts:85-90
- /home/mike1/projects/dev/workflow-server/scripts/check-activity-variables.ts:19-27
- /home/mike1/projects/dev/workflow-server/scripts/check-activity-variables.ts:94
- /home/mike1/projects/dev/workflow-server/scripts/check-activity-variables.ts:159-224
- /home/mike1/projects/dev/workflow-server/scripts/check-activity-variables.ts:210-214
- /home/mike1/projects/dev/workflow-server/scripts/check-activity-variables.ts:226-252
- /home/mike1/projects/dev/workflow-server/scripts/check-audience.ts:104-132
- /home/mike1/projects/dev/workflow-server/scripts/check-artifact-guides.ts:13-18
- /home/mike1/projects/dev/workflow-server/scripts/check-artifact-guides.ts:26-27
- /home/mike1/projects/dev/workflow-server/scripts/check-artifact-guides.ts:235-266
- /home/mike1/projects/dev/workflow-server/scripts/check-checkpoint-entry.ts:18
- /home/mike1/projects/dev/workflow-server/scripts/check-checkpoint-entry.ts:38-41
- /home/mike1/projects/dev/workflow-server/scripts/check-checkpoint-presentation.ts:139-176
- /home/mike1/projects/dev/workflow-server/scripts/check-fragments.ts:11-28
- /home/mike1/projects/dev/workflow-server/scripts/check-resource-anchors.ts:72-80
- /home/mike1/projects/dev/workflow-server/scripts/check-resource-anchors.ts:91
- /home/mike1/projects/dev/workflow-server/scripts/check-review-mode-gating.ts:191-192
- /home/mike1/projects/dev/workflow-server/scripts/check-review-mode-gating.ts:203
- /home/mike1/projects/dev/workflow-server/scripts/check-stealth-isolation.ts:56
- /home/mike1/projects/dev/workflow-server/scripts/check-prism-lens-reachability.ts:35-38
- /home/mike1/projects/dev/workflow-server/scripts/check-harness-adapter-set.ts:45
- /home/mike1/projects/dev/workflow-server/scripts/check-bootstrap-self-contained.ts:59
- /home/mike1/projects/dev/workflow-server/scripts/check-source-encoding.ts:33
- /home/mike1/projects/dev/workflow-server/scripts/check-technique-template.ts:193
- /home/mike1/projects/dev/workflow-server/scripts/check-pinned-corpus-paths.ts:31
- /home/mike1/projects/dev/workflow-server/scripts/check-pinned-corpus-paths.ts:38
- /home/mike1/projects/dev/workflow-server/scripts/check-pinned-corpus-paths.ts:89-110
- /home/mike1/projects/dev/workflow-server/scripts/validate-workflow-yaml.ts:28-46
- /home/mike1/projects/dev/workflow-server/scripts/validate-workflow-yaml.ts:69-97
- /home/mike1/projects/dev/workflow-server/scripts/validate-workflow-yaml.ts:125
- /home/mike1/projects/dev/workflow-server/scripts/validate-workflow-yaml.ts:130
- /home/mike1/projects/dev/workflow-server/tests/e2e/option-coverage.test.ts:57
- /home/mike1/projects/dev/workflow-server/tests/e2e/option-coverage.test.ts:70-72
- /home/mike1/projects/dev/workflow-server/tests/e2e/option-coverage.test.ts:83-86
- /home/mike1/projects/dev/workflow-server/tests/e2e/option-coverage.test.ts:93
- /home/mike1/projects/dev/workflow-server/tests/e2e/option-coverage.test.ts:98-104
- /home/mike1/projects/dev/workflow-server/tests/e2e/option-coverage.test.ts:109-110
- /home/mike1/projects/dev/workflow-server/tests/e2e/option-coverage.test.ts:122-130
- /home/mike1/projects/dev/workflow-server/tests/e2e/option-coverage.test.ts:193-202
- /home/mike1/projects/dev/workflow-server/tests/e2e/option-coverage.test.ts:215-217
- /home/mike1/projects/dev/workflow-server/tests/e2e/coverage.ts:21-23
- /home/mike1/projects/dev/workflow-server/tests/e2e/coverage.ts:60-96
- /home/mike1/projects/dev/workflow-server/tests/e2e/coverage.ts:71-73
- /home/mike1/projects/dev/workflow-server/tests/e2e/coverage-roster.test.ts:22-35
- /home/mike1/projects/dev/workflow-server/tests/e2e/walked-workflows.ts:15-18
- /home/mike1/projects/dev/workflow-server/tests/e2e/walked-workflows.ts:20-35
- /home/mike1/projects/dev/workflow-server/tests/e2e/walked-workflows.ts:51-55
- /home/mike1/projects/dev/workflow-server/tests/e2e/walker.ts:622-626
- /home/mike1/projects/dev/workflow-server/tests/e2e/walker.ts:643-644
- /home/mike1/projects/dev/workflow-server/tests/e2e/walker.ts:656
- /home/mike1/projects/dev/workflow-server/tests/e2e/all-workflows-walk.test.ts:33-40
- /home/mike1/projects/dev/workflow-server/tests/stamp-freshness.ts:10-16
- /home/mike1/projects/dev/workflow-server/package.json:23
- /home/mike1/projects/dev/workflow-server/package.json:59