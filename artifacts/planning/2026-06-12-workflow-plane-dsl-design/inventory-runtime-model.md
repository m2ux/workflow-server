# Inventory: Workflow-Level & Runtime Constructs the Workflow Plane DSL Must Express

Sources (read in full):
- `schemas/workflow.schema.json`, `schemas/activity.schema.json`, `schemas/condition.schema.json`, `schemas/session-file.schema.json`, `schemas/state.schema.json`
- `docs/checkpoint_model.md`, `docs/dispatch_model.md`, `docs/state_management_model.md`, `docs/artifact_management_model.md`, `docs/resource_resolution_model.md`
- `schemas/README.md` (lines ~500–640, executionModel section)
- Live exemplars: `workflows/work-package/workflow.toon` (95 variables, 1 mode, 4 artifactLocations), `workflows/work-package/activities/02-design-philosophy.toon`

All paths relative to `/home/mike1/projects/main/workflow-server/`.

---

## 1. Workflow-level constructs (`workflow.schema.json`)

Required: `id`, `version` (semver `^\d+\.\d+\.\d+$`), `title`.

| Field | Shape | Notes |
|---|---|---|
| `id` | string | Unique workflow identifier (slug) |
| `version` | string semver | |
| `title` | string | |
| `description` | string | |
| `author` | string | |
| `tags` | string[] | |
| `rules` | string[] | Ordered imperative directives governing workflow execution |
| `variables` | VariableDef[] | See §1.1 |
| `modes` | Mode[] | See §1.2 |
| `artifactLocations` | record<string, string \| {path, description?, gitignored?(default false)}> | Keys = location ids referenced by `artifact.location`; `path` supports `{variable}` interpolation (e.g. `{planning_folder_path}`) (schema lines 135–168) |
| `techniques` | { primary?: string, supporting?: string[] } | `::`-path refs; bundled into `get_workflow`; may be present-but-empty in TOON (work-package `workflow.toon:21`) |
| `initialActivity` | string | Required for sequential workflows; optional when all activities are independent entry points (schema line 185–188) |
| `activities` | Activity[] (minItems 1) | Inline embed; omitted in TOON repos where activities are separate files |
| `executionModel` | { roles: {id, description}[] } | **NOT in workflow.schema.json** — documented as required in `schemas/README.md:508–600` and the Workflow Plane design spec (`design-specification.md:39,74,360`). Roles: descriptive metadata, unique ids per workflow, min 1. Patterns: single `agent`; `orchestrator`+`worker`; named multi-agent (up to 7 roles). Design spec plans server-proven role substantiation. DSL MUST express it; flag schema/doc drift. |
| `activitiesDir` | string | Server-resolved pointer to external activity files; in README example, not in JSON schema |
| `$schema` | string | Authoring affordance only |

### 1.1 Variable definitions (`variables[]`)
`{ name, type: "string"|"number"|"boolean"|"array"|"object", description?, defaultValue? (any), required? (default false) }` — `additionalProperties: false`.
Runtime usage seen in work-package: object variables read by **dotted path** in conditions/messages (`validation_results.validation_passed`, `plan.tasks`, `tasks[].id`); array variables feed `forEach.over`; string variables interpolated into checkpoint messages and artifact names.

### 1.2 Modes (`modes[]`)
`{ id*, name*, description?, activationVariable*, recognition?: string[], skipActivities?: string[] (activity ids), defaults?: record<string, any>, resource?: string (path to guidance file) }`.
Semantics (`docs/state_management_model.md` §4): mode active when activationVariable true; activities react via transitions conditioned on the activation variable + workflow-level skipActivities — **no per-activity mode override block exists**. Exemplar: work-package `review` mode (`workflow.toon:31–45`).

---

## 2. Activity-level constructs (`activity.schema.json` — canonical; workflow.schema.json embeds a stale copy, see §10)

Required: `id`, `version` (semver), `name`.

| Field | Shape |
|---|---|
| `description`, `problem` | strings |
| `recognition` | string[] — intent patterns for independent-entry activities (and activity selection) |
| `techniques` | { primary?: string, supporting?: string[] } — primary optional when steps declare per-step techniques |
| `steps` | Step[] (§2.1) |
| `checkpoints` | Checkpoint[] (§2.2) |
| `decisions` | Decision[] (§2.3) |
| `loops` | Loop[] (§2.4) |
| `transitions` | Transition[] (§2.5) |
| `triggers` | WorkflowTrigger[] (§2.6) |
| `entryActions` / `exitActions` | Action[] (§2.7) |
| `artifacts` | Artifact[] (§2.8) |
| `artifactPrefix` | string, `readOnly` — **server-computed** from activity filename (`02-design-philosophy.toon` → `02`); never authored |
| `outcome` | string[] — expected outcomes on success |
| `context_to_preserve` | string[] |
| `required` | boolean default true |
| `estimatedTime` | string pattern `^\d+(-\d+)?\s*(m|min|h|hr|hours?|d|days?)?$` |
| `rules` | string[] — activity-level sequencing rules (NB: technique rules use named key→value map format, different) |

### 2.1 Step (`activity.schema.json` definitions.step)
- `id` — optional **when `technique` present** (loader derives from last `::` segment of the technique ref); required otherwise.
- `description` — guidance; may carry deprecated inline invocation `technique-id::operation-name(arg: {var}, ...)`.
- `technique` — **canonical per-step binding**: `group::operation` ref.
- `technique_args` — **canonical per-step deviation map**: record<string, string|number|boolean> passed to the bound technique (NB: project memory prefers canonical renames over per-call bridging args).
- `when` — inline boolean expression string gating the step (e.g. `"has_saved_state == true"`); preferred for simple comparisons.
- `condition` — LEGACY structured Condition (§3) gating the step.
- `checkpoint` — checkpoint id; worker MUST yield this checkpoint to the orchestrator **before executing the step**.
- `required` — boolean default true.
- `actions` — Action[] (§2.7) attached to the step (observed: `set` with target+description and `message` actions in 02-design-philosophy).
- `triggers` — WorkflowTrigger[] (§2.6).
- (workflow.schema embedded copy also carries LEGACY `name`.)

### 2.2 Checkpoint
`{ id*, name*, message* (supports {variable} interpolation — e.g. "this appears to be a {problem_type} with {complexity} complexity"), condition? (Condition — if false the checkpoint is skipped/dismissible), options*: Option[] minItems 1, required? (default true), blocking? (default true), defaultOption? (option id), autoAdvanceMs? (int >0) }`.
- `defaultOption`/`autoAdvanceMs` only meaningful when `blocking: false` (per activity.schema descriptions).
- Option: `{ id*, label*, description?, effect?: { setVariable?: record<string, string|number|boolean|array|object|null>, transitionTo?: activityId, skipActivities?: activityId[] } }`.
- Exemplar non-blocking auto-advance checkpoint: 02-design-philosophy `classification-confirmed` (blocking:false, defaultOption, autoAdvanceMs:30000).

### 2.3 Decision (automated branching, no user input)
`{ id*, name*, description?, branches*: Branch[] minItems 2 }`; Branch = `{ id*, label*, condition?, transitionTo? (omit ⇒ terminal branch, workflow ends), isDefault? (default false) }`.

### 2.4 Loop
`{ id*, name*, type*: "forEach"|"while"|"doWhile", variable? (iteration var / counter), over? (collection ref, forEach only, dotted path ok e.g. 'plan.tasks'), condition? (while/doWhile), maxIterations? (int >0, default 100 — safety limit), description?, breakCondition? (early exit regardless of main condition), steps?: Step[], activities?: activityId[] }`.
Loop body is **either** inline steps or a list of activity ids.

### 2.5 Transition
`{ to* (activityId), condition? (Condition), isDefault? (default false) }`.
Semantics (`docs/state_management_model.md` §3, "Rule of Determinism"): evaluated **in array order; first true condition wins**; orchestrator must never ask user/LLM; terminal activity = no matching transition. Transitions also arise from `decisionBranch.transitionTo` and `checkpointOption.effect.transitionTo`.

### 2.6 WorkflowTrigger (sub-workflow spawn)
`{ workflow* (workflowId), description?, passContext?: string[] (variable names passed to child) }` — attachable at activity level and step level.
Runtime counterpart: `triggeredWorkflows[]` in state/session (workflowId, planningSlug, sessionIndex, triggeredAt, triggeredFrom{activityId, stepIndex}, status running|completed|aborted|error, completedAt, returnedContext, state) and `parentWorkflow` (state.schema: workflowId, activityId, passedContext, returnTo{activityId, stepIndex}) / `parentSession` snapshot (session-file).

### 2.7 Action
`{ action*: "log"|"validate"|"set"|"emit"|"message", target? (e.g. variable name for set / condition for validate), message? (log content / validation-failure text / markdown shown to user for message), value? (any — assign/emit payload), description?, condition? (Condition gate) }`.
Used in `entryActions`, `exitActions`, and `step.actions`. Note `set` without `value` is used declaratively with `description` documenting the expected assignment (02-design-philosophy `classify-problem`).

### 2.8 Artifact
`{ id*, name* (filename template; `{variable}` substitution incl. `{n}` iteration count, `{decision-title}`; bare filename gets `artifactPrefix-` prepended at write time), location? (key into workflow.artifactLocations or explicit path), description?, action?: "create"|"update" (default create) }`.

---

## 3. Condition language (`condition.schema.json`)

Recursive union, `additionalProperties:false` on each variant:
1. `simple`: `{ type:"simple", variable*, operator*: ==|!=|>|<|>=|<=|exists|notExists, value?: string|number|boolean|null }` (value omitted for exists/notExists).
2. `and`: `{ type:"and", conditions: Condition[] minItems 2 }`.
3. `or`: `{ type:"or", conditions: Condition[] minItems 2 }`.
4. `not`: `{ type:"not", condition: Condition }`.

Evaluated by `evaluateCondition()` against the session variable dictionary. Attached to: step (legacy), action, checkpoint (presentation gate), decision branch, loop condition + breakCondition, transition. Parallel inline form: `when` string expression on steps (`"is_monorepo == true"`). Variables in conditions may use dotted paths into object variables (observed `validation_results.validation_passed`).

---

## 4. Checkpoint JIT runtime flow (`docs/checkpoint_model.md`) — runtime semantics the IR/DSL contracts must respect

1. **Yield (L2 worker):** `yield_checkpoint({session_index, checkpoint_id})` → server records `activeCheckpoint {checkpointId, activityId, yieldedAt}` in session.json and mints a **one-shot, opaque, HMAC-signed `checkpoint_handle`**. **Hard gate:** cannot yield while another checkpoint is active (no nested yields). Worker emits a `<checkpoint_yield>{"checkpoint_handle": "..."}</checkpoint_yield>` block in final text and stops.
2. **Relay (L1):** orchestrator echoes the yield block verbatim upward; does not resolve.
3. **Present/Resolve (L0):** `present_checkpoint({checkpoint_handle})` → server returns message/options/effects from the definition. Host UI presents. Then `respond_checkpoint({checkpoint_handle, ...})` with **EXACTLY one** of:
   - `option_id` — validated against definition; **minimum response time enforced (default 3 s since yield)**;
   - `auto_advance: true` — only for non-blocking checkpoints with `autoAdvanceMs`; server selects `defaultOption` only after full timer elapsed from `yieldedAt`;
   - `condition_not_met: true` — dismisses a conditional checkpoint; only valid when the checkpoint has a `condition` field (server checks field presence, not truth).
   Server clears `activeCheckpoint`, records decision + effects (`setVariable` / `transitionTo` / `skipActivities`) in persistent session state, returns effects.
4. **Resume:** wake in reverse order (L0→L1 via conversation, L1→L2 via host resume; inline mode = persona switch). Worker calls `resume_checkpoint({session_index, checkpoint_handle})` → **hard error if `activeCheckpoint` still set**; returns recorded variable effects for local application. Effects propagate via natural-language resume prompts, never via agent-written state files.

---

## 5. Dispatch model (`docs/dispatch_model.md`) — 3 levels

- **L0 Meta Orchestrator** (user-facing): `discover`, `list_workflows`, `start_session({agent_id, planning_slug?})`; sole user-prompt interface; never executes domain work.
- **L1 Workflow Orchestrator** (persistent background sub-agent, one per client workflow): evaluates variables, `next_activity`, dispatches workers, manages git artifacts/persistence/tracing, relays checkpoints, polls `get_workflow_status`.
- **L2 Activity Worker** (ephemeral, one activity): `get_activity`, executes steps sequentially, domain tools, `yield_checkpoint`, returns structured result (modified variables + created artifacts).

Session topology:
- **L0→L1 creates a CHILD session**: `start_session({workflow_id, planning_slug: <child>, parent_planning_slug: <meta>, agent_id})` → server snapshots parent's seal-verified session.json under child's `parentSession`; trace event links sessions; response carries child `session_index`.
- **L1→L2 SHARES the same `session_index`** — no new session; worker and orchestrator resolve to one canonical session.json.
- `get_workflow_status({session_index})` → `status: active|blocked|completed` (blocked ⇔ `activeCheckpoint` set), `current_activity`, `completed_activities`, `last_checkpoint`, `parent` (derived from `parentSession`).
- Host resume primitive (e.g. `Task(resume=…)`) wakes paused sub-agents; **inline fallback**: single agent adopts all three personas; server enforcement (HMAC, gates, manifests, trace tokens) identical.

---

## 6. State ownership & session model (`docs/state_management_model.md`, `session-file.schema.json`, `state.schema.json`)

**Server-owned state.** Agents never read/write session state; they carry only a 6-char `session_index` (`^[A-Z2-7]{6}$`, base32, deterministically derived from the planning slug). Per planning folder (`.engineering/artifacts/planning/<slug>/`):
- `session.json` — plaintext canonical state (schemaVersion const 1; required: sessionIndex, workflowId, workflowVersion, agentId, seq, ts, startedAt). Fields: `currentActivity`, `currentTechnique`, `condition`, `activeCheckpoint{checkpointId, activityId, yieldedAt}`, `variables{}`, `completedActivities[]`, `skippedActivities[]`, `checkpointResponses{cpId → {optionId, respondedAt, effects{variablesSet, transitionedTo, activitiesSkipped}}}`, `history[]`, `status: running|completed|aborted`, `triggeredWorkflows[]`, `parentSession` (untyped snapshot). (Doc drift: state_management_model.md §5 says `currentSkill`; schema says `currentTechnique` — techniques migration.)
- `.session-token` — sealed HMAC envelope binding session.json to workspace + server signing key; verified on every read; mismatch ⇒ hard `SealMismatchError`. Writes atomic (temp+rename), ordered session.json → token.
- Resume = `start_session({agent_id, planning_slug})`; server restarts transparent; no adoption step.

**Richer runtime-state vocabulary (`state.schema.json`)** the IR must remain projectable onto: `currentStep` (int ≥1), `completedSteps{activityId → int[]}`, `decisionOutcomes{decisionId → {branchId, decidedAt, transitionedTo}}`, `activeLoops[{activityId, loopId, currentIteration, totalItems?, currentItem?, startedAt}]`, `lastError{message, code?, activity?, step?, timestamp}`, `parentWorkflow{workflowId, activityId, passedContext?, returnTo{activityId, stepIndex?}}`, status enum extended: `running|paused|suspended|completed|aborted|error`, `stateVersion`.

**History event vocabulary (shared by both schemas — 21 types):** `workflow_started, workflow_completed, workflow_aborted, workflow_triggered, workflow_returned, workflow_suspended, activity_entered, activity_exited, activity_skipped, step_started, step_completed, checkpoint_reached, checkpoint_response, decision_reached, decision_branch_taken, loop_started, loop_iteration, loop_completed, loop_break, variable_set, error` — entry: `{timestamp*, type*, activity?, step?(int ≥1), checkpoint?, decision?, loop?, data?, error?{message*, code?}}`. This enumerates every observable runtime event class the DSL's constructs can produce.

**State mutation channels (deterministic):** (a) checkpoint option `effects.setVariable`; (b) worker structured result variables; plus mode `defaults` at activation and variable `defaultValue` at init. Transition evaluation is pure first-match over the variable dict.

---

## 7. Artifact & workspace model (`docs/artifact_management_model.md`)

- Two scopes: `target_path` (domain codebase, all edits/builds) vs `.engineering/` (orchestration workspace) — DSL artifacts target the latter.
- Planning folder = session "brain": `README.md` (progress tracker — worker MUST update before yielding `activity_complete`, per finalize protocol), `session.json` (+`.session-token`), `workflow-trace.json`.
- Naming: server infers `artifactPrefix` from activity filename; worker prepends it (`design-philosophy.md` → `02-design-philosophy.md`).
- `artifactLocations` interpolate workflow variables; `gitignored` flag per location.
- Git protocol: `.engineering/workflows` is submodule/orphan worktree; orchestrator `commit-artifacts` phase: cd into submodule → stage/commit → push → cd back → commit submodule ref bump.

---

## 8. Technique references (workflow-facing surface only; techniques stay markdown per locked decision)

- Reference grammar: `[workflow::]technique[::nested…]`; slash form `workflow/technique` normalized to `::`. Same-workflow refs omit the workflow segment.
- A ref addresses a **technique** (standalone `{t}.md`, group index `{g}/TECHNIQUE.md`, nested `{g}/{sub}.md`) or a **rule** (trailing segment matches a rule name; bare group ref `{t}::{group}` expands to all `{group}-*` rules).
- Resolution: explicit workflow segment wins; else current-workflow-first then `meta` shared layer (local shadows meta). Unresolved refs surface explicitly, never dropped.
- Auto-inclusion: resolving a technique appends its remaining rules. Bundle buckets: `techniques` (keyed by full path, `::{sub}` suffix for nested), `rules` ([name, line] tuples), `unresolved`; empty buckets omitted.
- Protocol composition: ancestor `Initial` blocks before / `Final` blocks after the descendant's protocol, recursively along workflow-root + group `TECHNIQUE.md` chain; server renumbers.
- Auto-included core sets (`src/loaders/core-ops.ts`): `CORE_ORCHESTRATOR_TECHNIQUES` into `get_workflow` (dispatch-activity, evaluate-transition, commit-and-persist, handle-sub-workflow, compose-prompt, present-checkpoint-to-user, respond-checkpoint, version-control::*, harness-compat::*, agent-conduct::*); `CORE_WORKER_TECHNIQUES` into `get_activity` (yield-checkpoint, resume-from-checkpoint, finalize-activity, agent-conduct::*). Deduplicated.
- Binding points the DSL must type-check (per locked decision 2's generated contracts): workflow `techniques.primary/supporting`, activity `techniques.primary/supporting`, step `technique` + `technique_args`.

## 9. Resource references (`docs/resource_resolution_model.md` §9–10)

- Lazy-loaded via `get_resource({session_index, resource_id})`; bodies never bundled.
- Ref forms: bare slug `{id}` (resolves within session's workflow), cross-workflow `{workflow}/{id}` (e.g. `meta/activity-worker-prompt`), optional `#section` GitHub-style heading anchor narrowing to that section + body. Loaded from `workflows/{workflow}/resources/{slug}.md`; returns content + id + version.
- Server rewrites markdown resource hyperlinks inside delivered techniques into `get_resource`-callable refs; technique links untouched.
- Mode `resource` field is a plain path (`resources/review-mode.md`) — a third, path-style form the DSL must reconcile.

---

## 10. Schema drift / discrepancies to resolve in the DSL (load-bearing for L1 .d.ts design)

1. `executionModel` documented as **required** (schemas/README.md, design spec) but absent from `workflow.schema.json` and from every live `workflow.toon` (grep returned none). DSL must make it first-class; design spec further plans signed role substantiation.
2. `workflow.schema.json` embeds a **stale activity copy**: step `technique`/`technique_args` marked LEGACY there but **canonical** in `activity.schema.json`; embedded checkpoint lacks `blocking`/`required`; embedded step requires `id` and has LEGACY `name`; embedded `setVariable` values untyped vs typed union in activity.schema. Canonical source = `activity.schema.json`.
3. Dual condition forms (structured `condition` vs inline `when` string) — `when` preferred for simple comparisons; structured needed for and/or/not. DSL can unify behind one typed expression surface compiling to canonical IR conditions.
4. Dotted-path variable reads (`validation_results.validation_passed`, `over: 'plan.tasks'`) are used at runtime but untyped in schemas — variable `components`/sub-shape typing lives only in prose descriptions today (e.g. `plan` sub-shape in workflow.toon:345–347).
5. `artifactPrefix` is server-computed/readOnly — must be excluded from the authoring surface but present in IR/EBNF (L2) or recomputed canonically.
6. Doc drift `currentSkill` (state_management_model.md §5) vs `currentTechnique` (session-file.schema.json).
7. `technique_args` value domain limited to string|number|boolean (no array/object); memory note: prefer canonical renames over args-bridging.
8. Checkpoint `defaultOption`/`autoAdvanceMs` constrained to `blocking:false` in activity.schema prose, but workflow.schema embedded copy carries them without `blocking` — IR (L3 Alloy) should encode: autoAdvanceMs ⇒ defaultOption ∧ ¬blocking; respond modes mutually exclusive; option_id ∈ options; condition_not_met ⇒ condition present; no nested active checkpoints; transitions first-match-ordered; loop maxIterations > 0.
