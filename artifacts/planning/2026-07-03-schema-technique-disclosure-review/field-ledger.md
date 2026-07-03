# Field Ledger — Schema Effectiveness (Phase 1a)

Date: 2026-07-03. Method: every top-level field/construct in the six schemas traced to its `src/` consumer(s) and classified **ENFORCED** (engine behavior or blocking validation depends on it), **ADVISORY** (rendered to the agent; compliance never checked — includes warning-only validation), or **INERT** (schema-legal but no code path surfaces or acts on it beyond the verbatim raw-YAML pass-through of `get_activity`).

**File legend** (paths under repo root): WT `src/tools/workflow-tools.ts` · RT `src/tools/resource-tools.ts` · WL `src/loaders/workflow-loader.ts` · TL `src/loaders/technique-loader.ts` · ML `src/loaders/markdown-technique-loader.ts` · VA `src/utils/validation.ts` · AS `src/schema/activity.schema.ts` · WS `src/schema/workflow.schema.ts` · CS `src/schema/condition.schema.ts` · SS `src/schema/session.schema.ts`.

A structural fact that shapes the whole ledger: **`get_activity` returns the raw activity YAML file** (`readActivityRaw` WL:382–443, used at WT:353–355), with step ids injected (AS:171–180) and two server blocks appended (composed `artifacts`, inherited `activity_rules`). Every activity field is therefore "surfaced" verbatim; the INERT/ADVISORY distinction is whether any code *reads* it.

## 1. workflow.schema.json

| Field | Consumer | Class | Notes / misread risk |
|---|---|---|---|
| `$schema` | none (WS:39 parses only) | INERT | Editor affordance only. |
| `id` | WL:72–86 (file resolution), WT:167, RT:340; session `workflowId` | ENFORCED | Must match directory name or unloadable. |
| `version` | VA:51–56 drift check (warning on every authed tool, WT:142–144); RT:243, 383 | ADVISORY | Format Zod-enforced at load; mid-session drift only warns. |
| `title` | WL:240–241 (list_workflows), WT:169 | ADVISORY | Display + workflow matching. |
| `description` | WT:170, RT:343 | ADVISORY | |
| `author` | **none** | **INERT** | No read anywhere in src. |
| `tags` | WL:241 (list_workflows manifest) | ADVISORY | Agent-side goal→workflow matching only. |
| `rules.workflow` | WT:171–175 (get_workflow `rules`) | ADVISORY | Orchestrator-only text. |
| `rules.activity` | WT:398–400 (`activity_rules` block in every get_activity) | ADVISORY | Worker-facing; re-delivered per call (see payload-measurements §2). |
| `rules.universal` | WT:173 and WT:399 (both payloads) | ADVISORY | Only dual-audience bucket. Risk: activity-file `rules:` is a different construct not merged into `activity_rules` — two same-named rule surfaces in one payload. |
| `variables[]` | WT:176 (rendered in get_workflow) | ADVISORY | Engine keeps a separate untyped bag. |
| `variables[].type` | **none** | **INERT** | No coercion; declared `boolean` vs effect-set `"true"` diverges silently. |
| `variables[].defaultValue` | **none** | **INERT** | Session bag initializes `{}` (SS:255); defaults never seeded — a condition on a "defaulted" variable sees `undefined`. |
| `variables[].required` | **none** | **INERT** | Never checked. |
| `techniques.workflow` | WT:153–156 (get_workflow bundle + core orchestrator ops); RT:512 (`[0]` special) | ENFORCED | Index-0 has special meaning for pre-activity get_technique. |
| `techniques.activity` | WT:371–373 (injected into every get_activity bundle) | ENFORCED | Inheritance mechanism; unresolved refs surface in bundle `unresolved` (TL:585). |
| `initialActivity` | WT:177; VA:32–34 (first-transition mismatch → warning only) | ADVISORY | Wrong first activity is not blocked. |
| `activities[]` / `activitiesDir` | WL:144–210 (assembly), WL:257–259 | ENFORCED | **Invalid activity files silently skipped with a log warning (WL:44–47)** — workflow loads without them; surfaces later as "Activity not found". `activitiesDir` consumed then deleted pre-validation (WL:158, 195–197). |

## 2. activity.schema.json

### Activity top level

| Field | Consumer | Class | Notes |
|---|---|---|---|
| `id` | WL:257–259 (navigation key); filename must carry it | ENFORCED | Also the namespace for activity-group shorthand (RT:552–559). |
| `version` | Zod-required (AS:236); no runtime reader | INERT (validation-only) | Activity version drift never checked (unlike workflow). |
| `name` | WT:178 (stubs), WT:328 | ADVISORY | |
| `description` | raw YAML only | ADVISORY | |
| `techniques[]` | WT:370–373 (bundle); RT:523–526 (`[0]` special) | ENFORCED | |
| `decisions[]` | WL:302–337 → VA warnings | ADVISORY | Branch conditions **stringified** (WL:352–367), never evaluated. |
| `transitions[]` | WL:303–329 → VA:42–47, 107–129 | ADVISORY | **Transition legality is a warning, not a gate** — next_activity moves anywhere. |
| `triggers[]` / `passContext` | **none** | **INERT** | `dispatch_child` takes explicit `workflow_id` and creates the child with an **empty** variable bag (RT:418–423); no context is ever passed. Actively misleading name. |
| `outcome[]` | **none** | **INERT** | `activity_manifest[].outcome` (free text, VA:149) is never compared against it; name collision invites false belief in reconciliation. |
| `required` | WT:178 (stub only) | ADVISORY | |
| `rules[]` (activity-file) | raw YAML only | ADVISORY | Not merged into `activity_rules`. |
| `artifactPrefix` | server-computed from filename (WL:51, 134); sorts activity order (WL:58–60); WT:379–382 | ENFORCED | Authored value overwritten. Second job (activity ordering) undocumented in schema. |
| `artifacts[]` | server-computed (`composeActivityArtifacts` WT:66–103 from technique `outputs[].artifact.name`) | ENFORCED (computed); authored value **IGNORED** | An authored `artifacts:` passes Zod, appears verbatim in the body, and can contradict the appended composed block — two contracts in one payload. (Corpus: 0 authored uses; guard `check:artifacts` enforces.) |

### Step common fields

| Field | Consumer | Class | Notes |
|---|---|---|---|
| `kind` | AS:88–110 superRefine; AS:289–301 (checkpoint discovery) | ENFORCED | `kind: action` has no required extras — a bare marker step is legal. |
| `id` | AS:131–161 `populateStepIds` (dup → **hard load error**); RT:528–542 (get_technique lookup); VA:74–91 (manifests, warn) | ENFORCED (identity) | |
| `when` | **no evaluator in src** — raw YAML only | ADVISORY | Schema text says "evaluated against current variable state at runtime" — **evaluation is 100 % agent-side.** VA:74–80 still expects when-gated steps in step_manifest (phantom "Missing steps" warnings). |
| `condition` (structured) | presence gates `condition_not_met` dismissal (WT:643–650); copied into checkpoint def AS:299; never evaluated | ADVISORY / presence-ENFORCED | `when`↔`condition` duality: only `condition` makes a checkpoint dismissible; migrating condition→when silently removes dismissability. |
| `required` | **none** | **INERT** | api-reference.md:139 contradicts the schema affordance ("all steps required; optionality at activity level"). |
| `actions[]` (log/validate/set/emit/message) | **none** | **INERT** | **No interpreter for any action verb.** `set` does NOT mutate the session bag (only checkpoint `setVariable` does, WT:686–696). Pure fossil. |

### kind: technique

| Field | Consumer | Class | Notes |
|---|---|---|---|
| `technique` (string / object.name) | AS:114–116 → RT:531, WT:76, AS:142 | ENFORCED | Bare op resolves activity-group-first, then workflow-local → meta fallback (TL:86–166). |
| `technique.inputs` (deviations) | **none server-side** | ADVISORY | Rename/literal/`{template}` grammar entirely agent convention; server validates neither id existence (guard does) nor value resolution (nothing does). |
| `technique.outputs` (remaps) | **none server-side** | ADVISORY | Remap target never checked to land anywhere. |

### kind: checkpoint

| Field | Consumer | Class | Notes |
|---|---|---|---|
| `message` / `options[]` | AS:101–102 (presence); WT:617–623 (**option_id hard-validated**); WT:562 (presented) | ENFORCED | The strongest server enforcement in the system. |
| `options[].effect.setVariable` | WT:664, 686–696 — applied to session bag + history | **ENFORCED (engine-applied)** | The **only** declarative path that mutates server-held variables. |
| `options[].effect.transitionTo` | WT:665, 724 (recorded/returned); WL:340–347 (valid-transition set) | ADVISORY | **Not auto-applied** — orchestrator must still call next_activity. Easily misread as an engine transition. |
| `options[].effect.skipActivities` | WT:666, 698–709 (recorded) | semi-INERT | Written to `skippedActivities`, **which nothing ever reads**. |
| `defaultOption` / `autoAdvanceMs` | WT:625–641 (auto_advance path; **timer enforced server-side**) | ENFORCED | Despite the name nothing auto-advances; it is a minimum-wait before the orchestrator may request the default. |
| `blocking` | **none** | **INERT** | api-reference.md:121 claims auto_advance requires `blocking: false` — **false**: server checks only defaultOption+autoAdvanceMs (WT:625). A `blocking: true` checkpoint with those fields can be advanced past the user. |
| checkpoint `#instance` ids | WL:269–295 (base-id match); replay key WT:440–478 | ENFORCED | Loop-body checkpoints must be instance-qualified or iteration 2+ replays iteration 1's answer. |

### kind: loop

| Field | Consumer | Class | Notes |
|---|---|---|---|
| `loopType` | AS:105 (presence only) | presence-ENFORCED / semantics ADVISORY | forEach/while/doWhile executed entirely by the agent. |
| `variable` / `over` | none | ADVISORY | |
| `breakCondition` | **none** | **INERT** | "Evaluated each iteration" — by nobody. |
| `maxIterations` | **none** | **INERT** | A safety bound no code bounds. |
| `steps` (body) | AS:106, AS:272–282 (flatten → lookup/artifacts), AS:152–155 (id uniqueness) | ENFORCED (structure) | VA:74 expects only top-level ids in step_manifest — loop-body ids reported there trigger "Unexpected steps". |

## 3. technique.schema.json

| Field | Consumer | Class | Notes |
|---|---|---|---|
| `id` | TL:86–166 (resolution) | ENFORCED | |
| `version` | format check; rendered TL:34 | ADVISORY | No drift tracking. |
| `capability` | rendered TL:35, 190 | ADVISORY | |
| `rules` | TL:316–351 (addressable `tech::rule`; **prefix expansion** `tech::group` → all `group-*` rules); TL:367–380 (auto-bundled); child-wins merge TL:404–408 | ENFORCED (addressing) / ADVISORY (content) | A rule named `foo-bar` is silently swept into a `tech::foo` group ref. |
| `inputs[].id` | merge key TL:394–401, 508 | ENFORCED (composition) | |
| `inputs[].required` / `.default` | parsed (ML:331–339); rendered only | ADVISORY | Server never verifies a required input was supplied nor applies a default. |
| `protocol[]` | rendered TL:37, 192; **block titles `Initial`/`Final` are load-bearing** (TL:411–455) | ENFORCED (composition) / ADVISORY (content) | Typo in Initial/Final silently demotes the block. (Corpus: feature unused — 0 occurrences.) |
| `outputs[].id` | merge key TL:509; WT:99 | ENFORCED | |
| `outputs[].artifact.name` | **drives the composed activity artifact contract** (WT:96–99) | ENFORCED | |
| `outputs[].artifact.action` | **none — loader never emits it** (ML:400 sets `{name}` only) | **INERT** | Enum unreachable from authored content. |

## 4. condition.schema.json

| Field | Consumer | Class | Notes |
|---|---|---|---|
| `simple`/`and`/`or`/`not` | `evaluateCondition` CS:31–68 — **zero runtime callers in server tools** (only smoke script + tests); `conditionToString` WL:352–367 (advisory text match) | ADVISORY / near-INERT at runtime | All condition evaluation is agent-side from raw YAML. |
| nested `conditions` recursion | — | **defect** | Generated `workflow.schema.json` / `condition.schema.json` emit `items: {}` for compound-condition arrays (Zod→JSON-Schema recursion lost) — authoring-time JSON-Schema validation accepts garbage inside and/or/not; Zod catches it only at load, where the invalid activity is then *silently skipped* (WL:44–47). `activity.schema.json` generates proper `$ref`s. |
| `exists`/null semantics | CS:60–63 | ADVISORY | `exists` treats `null` as absent; `== null` matches only literal null — two subtly different "is unset" idioms. |

## Engine-evaluated vs agent-interpreted boundary

The server is a **state ledger + payload composer**, not an executor.

**Engine enforces (blocks or mutates):** session identity/seal; active-checkpoint gate on all content tools; checkpoint resolution (option validity, min-response-time, autoAdvance timer, replay) and **`setVariable` application**; terminal handling; load-time structure (Zod, per-kind step contracts, step-id uniqueness, technique resolution/composition, artifact synthesis).

**Engine warns only (`_meta.validation`):** transition legality, initialActivity-first, transition_condition text match, step/activity manifests, version drift.

**Agent interprets everything else** — step ordering/execution, all `when`/`condition`/`breakCondition`/branch evaluation (the server's own `evaluateCondition` is dead code at runtime), loop mechanics and bounds, `actions[]`, `triggers[]`, variable typing/defaults, technique protocols, input binding and output remaps, artifact writing, all rule compliance. The single declarative path from definition into engine state is a checkpoint option's `setVariable`.

## Top 10 misinterpretation risks

1. **Conditions are never evaluated server-side** — any agent or author assuming the server gates a step or picks a branch is wrong.
2. **Transition validation is advisory** — next_activity moves anywhere with only a warning.
3. **`required` means three different unenforced things** (variable / step / activity), inviting all three to be read as engine-enforced.
4. **`blocking` is inert and api-reference.md contradicts the code** — a blocking checkpoint with defaultOption+autoAdvanceMs can be advanced past the user.
5. **`condition_not_met` is keyed to the legacy `condition` field** — migrating a checkpoint gate to `when` silently removes dismissability.
6. **`step_manifest` expects gated steps** — skipped `when`-steps yield phantom "Missing steps" warnings; loop-body ids yield "Unexpected steps".
7. **`transition_condition` matches by exact string equality** against `conditionToString` output — paraphrase or `when`-spelling mismatches.
8. **Invalid activity files vanish silently at load** — surfacing later as "Activity not found".
9. **Checkpoint effects `transitionTo`/`skipActivities` are not engine-applied** — treating the returned effect as executed desynchronizes the orchestrator.
10. **Schema fossils look executable** — `step.actions[]`, `triggers[]`/`passContext`, `outputs[].artifact.action`, `variables[].type/defaultValue/required`, `maxIterations`/`breakCondition`, `author`; plus the generated-schema recursion defect feeding risk 8.
