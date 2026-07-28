**Roots** (all citations below are absolute paths under these two):
- `SRV` = `/home/mike1/projects/dev/workflow-server`
- `WD` = `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation/workflow-design`

---

# 1. The four step kinds

`StepSchema` is a `discriminatedUnion('kind', …)` of four **closed** (`.strict()`) objects — `SRV/src/schema/activity.schema.ts:151-156`. A field outside a kind's declared set is a load error (AP-64 purity, comment at `:83-84`).

Common to all four (`stepCommonFields`, `SRV/src/schema/activity.schema.ts:73-77`): `when?` (string, agent-evaluated, server never evaluates — `:74`), `condition?` (structured, LEGACY except on checkpoints — `:75`), `required?: literal(false)` only (`required: true` is *rejected* — `:76`).

| kind | required | optional | JSON-schema mirror |
|---|---|---|---|
| `technique` | `kind`, `technique` | `id` (derived from last `::` segment if absent), `actions[]`, + common | `SRV/schemas/activity.schema.json:255-259` |
| `action` | `kind`, `id` | `actions[]` (may be empty — marker step), + common | `:290-293` |
| `checkpoint` | `kind`, `id` | `ref` XOR (`message`+`options`), `defaultOption`, `autoAdvanceMs`, `blocking`, + common | `:385-388` |
| `loop` | `kind`, `id`, `loopType`, `steps` | `name` (only kind carrying one), `variable`, `over`, `breakCondition`, `maxIterations`, + common | `:450-455` |

Only a `technique` step may omit `id`; any other kind without one is a load error (`SRV/src/schema/activity.schema.ts:184-188`). Duplicate resolved ids are an error **per scope** — the top-level list and each loop body are independent scopes (`:191-202`), so a loop body may legally reuse a top-level id.

The `technique` binding is either a bare string or `{name, inputs?, outputs?}` (`:63-67`) — `inputs` are input deviations, `outputs` are output remaps.

# 2. How loops bound iteration — they don't, structurally

`LoopStepSchema` (`SRV/src/schema/activity.schema.ts:137-148`):
- `maxIterations`: positive int, "**enforced by the executing agent**" (`:145`).
- `breakCondition`: structured Condition, "**evaluated by the executing agent** each iteration" (`:144`).
- `loopType`: `forEach | while | doWhile` — semantics are agent-owned.

Schema-legal but unbounded: `over`, `variable`, `breakCondition`, `maxIterations` are **all optional**. A `loopType: while` with no `breakCondition` and no `maxIterations` validates. A `forEach` with no `over` validates. `steps` has no `.min(1)`, so an empty loop body validates. `SRV/schemas/README.md:34` states it plainly: "iteration is executed and bounded **entirely by the agent**".

There is **no dedicated loop-continue field**. `WD/activities/08-quality-review.yaml:470-476` authors the while-test in `condition:` — which the schema defines as the *step gate* (`stepCommonFields`), not a per-iteration test. This has a hard delivery consequence (§9).

# 3. Checkpoints: server-acted vs agent-honoured

Fields: `id`, `ref`, `message`, `options[]{id,label,description,effect{setVariable,transitionTo,skipActivities}}`, `defaultOption`, `autoAdvanceMs`, `blocking`, `when`, `condition`, `required` (`SRV/src/schema/activity.schema.ts:121-131`, `44-53`).

**Server acts on:**
- `id` — replay key `${activityId}-${checkpointId}` (`SRV/src/tools/workflow-tools.ts:984`, `1203`).
- `options[].id` — hard-validated; unknown id throws (`:1160-1164`).
- `effect.setVariable` — **the one engine-applied effect**; written to the session bag, declared-type mismatch is warn-only (`:1238-1244`).
- `defaultOption` + `autoAdvanceMs` — server enforces the *full* timer: `auto_advance` throws if `elapsed < ceil(autoAdvanceMs/1000)` (`:1167-1185`), and throws if either field is missing.
- `condition` — its **presence** is what makes `condition_not_met` dismissal legal; without it, dismissal throws (`:1186-1192`).
- Minimum 3s between yield and `option_id` response (`:1113`, `1154-1159`).
- **The hard gate**: `yield_checkpoint` sets `state.activeCheckpoint`, and every other tool then throws — `get_workflow` (`:329`), `get_activity` (`:600`), `get_trace` (`:1295`), `get_technique`/`get_resource` (`SRV/src/tools/resource-tools.ts:590,771`), and `next_activity` (`:432-437`). Definition at `SRV/src/utils/session/params.ts:38-46`. Only **one** checkpoint can be active — a second `yield_checkpoint` throws (`:961-963`).

**Recorded and returned, NOT enacted:** `effect.transitionTo` (`SRV/src/schema/activity.schema.ts:50`) and `effect.skipActivities` (appended to `state.skippedActivities` bookkeeping + a history event, but does not route — `SRV/src/tools/workflow-tools.ts:1246-1257`).

**Agent-honoured only:** `blocking` — "the server's auto-advance gate checks only defaultOption + autoAdvanceMs, not this field" (`SRV/src/schema/activity.schema.ts:111`, `129`); also `message`, `option.label/description`, and `when`.

**The replay trap (load-bearing for #321).** On re-entry, `yield_checkpoint` finds `checkpointResponses[`${activity}-${checkpoint}`]` and **silently replays the prior option without prompting** (`SRV/src/tools/workflow-tools.ts:978-1022`). Re-prompting requires an instance-qualified id (`base#{var}`), resolved back to the base definition by `checkpointBaseId` (`SRV/src/loaders/workflow-loader.ts:438-464`).

Measured against the corpus: **none of workflow-design's 16 checkpoints is instance-qualified**, including three inside a `maxIterations: 50` loop — `file-approach-confirmed` (`WD/activities/06-scope-and-draft.yaml:87`), `file-review` (`:119`), `preservation-check` (`:140`). Iteration 2+ replays iteration 1's answer. work-package does it correctly: `assumption-decision#{current_assumption.id}` (`work-package/activities/07-assumptions-review.yaml:90`, and 4 sibling sites).

# 4. `decisions` — declarative only

`DecisionSchema` (`SRV/src/schema/activity.schema.ts:253-258`): `id`, `name`, `description?`, `branches` (**min 2**). Each branch: `id`, `label`, `condition?`, `transitionTo?` (omit ⇒ terminal), `isDefault` (default false) (`:243-249`).

**No server code evaluates a branch.** Corpus-wide, `decisions` is read in exactly two places, both of which only *widen the legal-transition set*: `getValidTransitions` (`SRV/src/loaders/workflow-loader.ts:472`) and `getTransitionList` (`:500-507`). No selection, no `isDefault` tiebreak, no condition evaluation. `SRV/schemas/README.md:31` classes it as advisory ("stringified for warn-only transition matching").

**Can a branch transition to its own activity?** Yes, unconditionally and without even a warning. `transitionTo` is a free string, and `validateActivityTransition` short-circuits: `if (view.act === activityId) return null;` (`SRV/src/utils/validation.ts:39`). So an activity-level self-loop is fully legal — and note the asymmetry: a loop *step* at least declares `maxIterations`; an activity self-transition has **no bound of any kind**, in schema or server.

# 5. What `transitions` legality actually enforces: almost nothing

`TransitionSchema`: `to` (required), `condition?`, `isDefault` (`SRV/src/schema/activity.schema.ts:262-266`). "Legality is validated **warn-only** at next_activity — an out-of-graph transition warns in `_meta.validation` but is not blocked" (`:294`).

`validateActivityTransition` (`SRV/src/utils/validation.ts:32-51`) returns a *string warning or null*, folded into `_meta.validation` (`SRV/src/tools/workflow-tools.ts:516-523`) **after** the session has already moved (`:497`, `:510`). Four escape hatches:
1. `view.act === activityId` → null (self-transition always legal, `:39`).
2. `activityId === TERMINAL_SENTINEL` (`'__terminal__'`) → null from anywhere (`:42`).
3. **`if (valid.length === 0) return null;`** (`:45`) — an activity that declares *no* transitions, decisions, or checkpoint-`transitionTo` legalizes **every** target.
4. First call: only warns if `activityId !== workflow.initialActivity` (`:34-36`).

`validateTransitionCondition` (`:193-213`) is exact-string matching against the stringified condition, and only runs when the orchestrator volunteers `transition_condition`.

# 6. `artifactPrefix` — derived, and it orders activities

Not authorable: "Server-computed — do not set in definition files" (`SRV/src/schema/activity.schema.ts:301`). Derived solely from the **filename** by `/^(\d+)-(.+)\.ya?ml$/` (`SRV/src/loaders/filename-utils.ts:6-10`), assigned at `SRV/src/loaders/workflow-loader.ts:83` (local) and `:168` (borrowed).

What it orders: the activity list itself — `activities.sort((a,b) => (a.artifactPrefix ?? '').localeCompare(...))` (`:91-93`), which is the order `get_workflow` returns activity stubs in (`SRV/src/tools/workflow-tools.ts:394`). It also names artifacts `{artifactPrefix}-{bare_filename}` and is surfaced in the `get_activity` header and `_meta.artifact_prefix` (`:850-856`, `:943`).

Two hard traps for any renumbering/merge:
- A file whose name doesn't match the regex is **silently skipped entirely** (`SRV/src/loaders/workflow-loader.ts:68-69`).
- `readActivityRaw` matches on the **filename's** id segment, not the declared `id` (`:570`). If `08-quality-review.yaml` declares `id: audit`, `loadWorkflow` lists it as `audit` but `get_activity` throws `Activity not found`. Filename id must equal declared id.

# 7. Activity `rules` — permitted, inert, and fragment-ineligible

`rules: z.array(z.string()).optional()` is schema-permitted (`SRV/src/schema/activity.schema.ts:300`; JSON mirror `SRV/schemas/activity.schema.json:581-587`). But: **no server code reads it.** `get_activity` injects only workflow-level `rules.activity` + `rules.universal` (`SRV/src/tools/workflow-tools.ts:890-905`); activity `rules` reaches the worker only as raw YAML text inside the delivered body. `SRV/schemas/README.md:31` lists it as advisory.

Critically, its items are `type: string` **only** — no `{ ref }` variant (contrast `RuleEntrySchema`, `SRV/src/schema/workflow.schema.ts:38-43`). So **activity-level rules cannot be de-duplicated via fragments at all.** Corpus usage: exactly one activity in the whole corpus uses it (`meta/activities/02-resolve-target.yaml`).

# 8. `fragments.rules` / `fragments.checkpoints` — authoring de-dup, *not* wire de-dup

`WorkflowFragmentsSchema` is `.strict()` with exactly two keys (`SRV/src/schema/workflow.schema.ts:64-67`):
- `rules`: `Record<string, string | string[]>` — a list value expands to that many rules at the referencing slot.
- `checkpoints`: `Record<string, CheckpointFragmentBody>` — `message`+`options` required, plus `defaultOption`/`autoAdvanceMs`/`blocking`/`condition` (`SRV/src/schema/activity.schema.ts:106-113`).

Addressing: `workflow::name` (that workflow only) or bare `name` (declaring workflow → `meta` fallback) (`SRV/src/loaders/fragment-resolver.ts:11-13`). **Fragments cannot nest** — "a fragment cannot itself contain a reference — so resolution never recurses" (`:16-17`).

A ref step contributes only `id` + site gates (`when`, `required`, and `condition` *only if the fragment declares none*); any local body field alongside `ref` is an error (`:101-105`).

**They do not reduce delivery cost.** `materializeRuleEntries` splices refs to plain strings at load (`:80-82`), and `injectCheckpointFragmentBodies` expands the fragment body into the delivered raw YAML at its own indentation (`:164-170`, called at `SRV/src/tools/workflow-tools.ts:617-622`). A referenced checkpoint costs the same bytes on the wire as an inline one.

Enforcement (`SRV/scripts/check-fragments.ts`): 9 hard-zero violation classes including `inline-duplicate-of-fragment`, `duplicate-checkpoint` (identical body at **≥2 sites, even within one workflow** — `:307-312`), `duplicate-rule` (only across **≥2 distinct workflows** — `:300-306`), `unused-fragment`, and `undeclared-effect-variable` (a referencing workflow must declare every variable the fragment's `setVariable` writes — `:239-246`).

Corpus reality: **`WD/workflow.yaml` has no `fragments:` block at all** (265 lines, verified). Five other workflows do (`prism`, `prism-audit`, `work-package`, `work-packages`, `substrate-node-security-audit`).

# 9. `bundleTechniques.maxChars` and the real delivery-cost model

`BundleTechniquesSchema` = `{ maxChars: nonneg int }`, `.strict()` (`SRV/src/schema/activity.schema.ts:19-21`).

The delivery algorithm (`SRV/src/tools/workflow-tools.ts:681-834`):
- Eager bundling of step techniques is **automatic for every activity**; no opt-in needed (`:681-682`).
- Cumulative budget = `context_tokens × headroomFraction × charsPerToken` = `context_tokens × 0.8 × 4` chars (`:706-710`; defaults `SRV/src/config.ts:135-136`).
- Eligible steps are collected in document order; **`maxChars` is only a per-technique cap** — a single technique larger than it is skipped (`:756`). `maxChars: 0` is the **opt-out sentinel**: it disables eager technique bundling *and* the sibling eager-resource map entirely, since both live inside `if (!optedOut …)` (`:704`, `:711`, `:792-833`).
- Budget is **stop-and-break**, not best-fit: the first technique that would overflow terminates the loop (`:772`).
- **Any gate kills eligibility.** `collectUngated` (`:713-719`): `if (s.when !== undefined || s.condition !== undefined) continue;` — and because that test precedes the loop branch, a **gated loop excludes its entire body** from bundling.
- Eager resources: a sibling `resources` map, capped at **80,000 chars per resource**; larger ones are skipped (`:800`, `:807`; `SRV/src/utils/resource-delivery.ts:6`).
- `bundle: "reference"` / `contextMode: 'persistent'` collapses already-delivered content to `{delivery: "unchanged", content_hash}` markers, which cost ~nothing and **do not draw down the budget** (`:759-765`). But it is only valid when *this* agent received the earlier payload — the tool description explicitly forbids it on fresh workers (`:588-590`).

**Measured on the workflow-design corpus:**
- `bundleTechniques` is used **nowhere** in the corpus (grep, 0 hits) — the lever is entirely unexercised.
- 112 technique steps across 9 activities; **only 31 (28%) are eager-eligible**. 72% are gated → one `get_technique` round-trip each.
- `WD/activities/08-quality-review.yaml`: 27 technique steps, **0 eager-eligible** — every top-level step carries a `condition`, and both loops (`multi-target-review-loop:14-18`, `audit-fix-cycle:471-475`) are `condition`-gated, so their bodies are excluded too. That activity delivers **zero** step techniques eagerly and costs ~27 sequential fetches.
- `WD/activities/05-impact-analysis.yaml`: 2 technique steps, 0 eligible.
- `WD/resources/anti-patterns.md` is **128,341 bytes** — above the 80,000-char eager cap, so it can never be bundled; `audit-anti-patterns.md:28` links the **whole file** (`../resources/anti-patterns.md`, no `#section`), so every audit pass pulls 128 KB through `get_resource`.
- Fixed per-dispatch floor: `CORE_WORKER_TECHNIQUES` (7 ops, `SRV/src/loaders/core-ops.ts:52-62`) + inherited `techniques.activity: [variable-binding]` (`WD/workflow.yaml:19-21`) ride **every** `get_activity` in full mode (`SRV/src/tools/workflow-tools.ts:645-650`). Raw source bytes: `variable-binding.md` 5,303 + `agent-conduct.md` 4,865 + `workflow-engine/{finalize-activity 3,102, yield-checkpoint 1,988, resume-from-checkpoint 901}` ≈ **16 KB before composition**, per dispatch.
- Raw activity YAML is delivered **verbatim** (`readActivityRaw` → body, `:608-611`, `:941`). Total: 65,748 bytes across 9 files. **698 of 1,935 lines (36%) are structured `condition:`/`breakCondition:` blocks** — and in `08-quality-review.yaml`, **282 of 531 lines (53%)**.

---

# Load-bearing answers

## (1) Is there a schema-level mechanism for activity-to-activity reuse?

**Whole-activity borrowing: yes, but it is a loader feature that neither schema admits.** A `workflow.yaml` `activities:` entry may be a **string file reference**, local (`01-start.yaml`) or cross-workflow (`work-package/02-design-philosophy.yaml`), resolved by `resolveActivityReference` (`SRV/src/loaders/workflow-loader.ts:126-178`, dispatched at `:267-289`), with a matching fallback in `readActivityRaw` so `get_activity` returns the borrowed file (`:585-613`). Borrowed activities keep their **source** workflow as the scope for bare technique/fragment refs (`:171-173`, `:38-40`). Live precedent: `remediate-vuln/workflow.yaml:322-330` borrows 7 activities from `work-package`.

But neither schema permits the string form: `WorkflowSchema.activities` is `z.array(ActivitySchema)` (`SRV/src/schema/workflow.schema.ts:88`, with the comment at `:83-88` admitting strings exist only in "the intermediate raw schema"), and `SRV/schemas/workflow.schema.json:422+` declares items as objects with `additionalProperties: false`. Likewise `activitiesDir` is a "non-schema property" the loader deletes before validation (`SRV/src/loaders/workflow-loader.ts:295-298`). So borrowing works but is invisible to `$schema` validation — a real fragility if #321 leans on it.

**Sub-activity reuse (steps): no mechanism, not even by convention.** `WorkflowFragmentsSchema` is `.strict()` with only `rules` and `checkpoints` (`SRV/src/schema/workflow.schema.ts:64-67`). There is no `fragments.steps`, no `include`, no step-level `ref` (`ref` exists only on `kind: checkpoint`, `SRV/src/schema/activity.schema.ts:124`). Cross-activity reuse below activity granularity happens **only** by both activities binding the same `group::operation` technique — i.e. the reuse unit is the technique, not the step, and duplication of *gates* and *persist steps* is unavoidable by construction. That is exactly the duplication visible in `08-quality-review.yaml` (6 near-identical audit → persist → clean/flagged triplets).

## (2) Cheapest schema-legal way to cut per-dispatch delivery cost

Ranked by bytes removed per unit of authoring change, all strictly schema-legal:

1. **Collapse structured `condition:` blocks to `when:` one-liners.** Both gate identically for the agent, for manifest validation (`SRV/src/utils/validation.ts:79-82`) and for bundling eligibility (`SRV/src/tools/workflow-tools.ts:715`). The *only* place `condition` is load-bearing is a checkpoint step needing `condition_not_met` dismissal (`SRV/src/schema/activity.schema.ts:75`; `SRV/src/tools/workflow-tools.ts:1186-1192`). This removes ~36% of the raw activity YAML corpus-wide and ~53% of `08-quality-review.yaml`, on **every** dispatch, with zero behaviour change. Cost: zero.
2. **Add `#section` anchors to fat resource links.** `parseResourceRef` + `extractMarkdownSection` slice to the named section on **both** delivery paths — eager bundle (`SRV/src/utils/resource-delivery.ts:38-47`) and `get_resource` (`SRV/src/tools/resource-tools.ts:779-786`) — and `extractResourceIds` preserves the anchor (`SRV/src/utils/resource-ref.ts:80-91`). `audit-anti-patterns.md:28` linking all 128 KB of `anti-patterns.md` is the single largest deliverable in the corpus and is currently un-bundleable (above the 80 KB cap).
3. **Un-gate steps you want bundled / gate steps you don't.** Gating is the on/off switch for eager delivery (`:715`). `08`'s 27-step, 0-eligible profile is a direct consequence of putting `operation_type != review` on every step instead of on the enclosing structure. Hoisting mode gates to a loop or to activity granularity flips 27 lazy fetches into one budgeted eager batch.
4. **Reduce dispatch count.** The ~16 KB ops floor + inherited rules are re-delivered in full on every `get_activity`, and reference-mode collapse is *invalid* for fresh disposable workers (`SRV/src/tools/workflow-tools.ts:588-590`, `636`). 12 fan-out dispatches pay that floor 12×; this is the one code-grounded delivery-cost argument in favour of #321's consolidation.
5. **`bundleTechniques: { maxChars: 0 }`** where a worker genuinely needs few of many step techniques — it suppresses the eager technique *and* resource maps wholesale (`:704`, `:711`, `:792`). Note this **shifts** cost to `get_technique` rather than removing it; use only where most steps are skipped at runtime.

Explicitly **not** a cost lever: `fragments.*` (materialized to full text before delivery, §8), and moving techniques to workflow-level `techniques.activity` (deduped by a `Set` union at `:648`, but still delivered in full to every activity).

## (3) Can one activity legally carry the whole audit stage — bounded fix loop + blocking gate before a later checkpoint?

**Yes, and `WD/activities/08-quality-review.yaml` already is that activity.** It carries 6 audit passes, a `loopType: while` fix loop with `maxIterations: 3` (`:467-507`), a `blocking: true` checkpoint (`:77-105`), and a `decisions` blocker gate (`:508-522`) — all inside one schema-valid activity. Nothing in the schema caps step count, loop nesting, or checkpoints per activity.

Four caveats that determine whether it *behaves* as intended:

- **The fix loop's bound is agent-honoured, not enforced.** `maxIterations: 3` and `breakCondition` are agent-executed (`SRV/src/schema/activity.schema.ts:144-145`; `SRV/schemas/README.md:34`). The server will not stop a fourth iteration.
- **"Blocking before a later checkpoint" is server-enforced only *once yielded*.** `activeCheckpoint` genuinely blocks every tool (§3), so a yielded checkpoint is a hard gate. But **reaching** it is agent-honoured: step order is not server-enforced (`step_manifest` order is a warn-only subsequence check, `SRV/src/utils/validation.ts:104-115`), `blocking: true` is advisory (`SRV/src/schema/activity.schema.ts:111`), and only one checkpoint may be active at a time (`SRV/src/tools/workflow-tools.ts:961-963`), so gates must be strictly sequential.
- **The `decisions` blocker gate does nothing on its own.** `blocker-gate` (`:508-522`) is never evaluated by the server (§4); it only makes `scope-and-draft` a legal target. Its branch could equally target `quality-review` itself — legal and unwarned (`SRV/src/utils/validation.ts:39`) — but then nothing bounds the re-entry count.
- **The replay trap is the real blocker.** If the fix loop or a self-transition re-enters and re-yields the same checkpoint id, the server replays the stored option **without prompting** (`SRV/src/tools/workflow-tools.ts:978-1022`). A per-iteration gate inside a merged audit activity **must** use an instance-qualified id (`review-disposition#{iteration}`, per `SRV/src/loaders/workflow-loader.ts:438-464`). None of workflow-design's 16 checkpoints does; three already sit inside a `maxIterations: 50` loop with plain ids (`WD/activities/06-scope-and-draft.yaml:87,119,140`), so that latent defect predates #321 and would be inherited by any merge.

Also relevant to #321's arithmetic: merging activities **shrinks** the number of `artifactPrefix` values, and the prefix is the artifact filename component and the activity sort key (§6). Cutting 9 activities to 4 renames artifacts and requires each merged file's filename id segment to equal its declared `id`, or `get_activity` throws `Activity not found` (`SRV/src/loaders/workflow-loader.ts:570`) while `get_workflow` still lists the activity.
