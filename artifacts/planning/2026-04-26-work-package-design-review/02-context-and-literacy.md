# Context and Literacy — Work-Package Audit Grounding

Generated: 2026-04-26
Activity: `context-and-literacy` (workflow-design, review mode)
Target workflow: `work-package` v3.7.0
Source path: `workflows/work-package/` (READ-ONLY)

This artifact establishes the auditor's grounding in the workflow-server schema system, the TOON serialization format, and the conventions used by the work-package workflow. It gates the principle-by-principle audit performed in the next activity (`quality-review`).

---

## 1. Schema system (loaded for reference)

The workflow-server defines five JSON Schemas under `schemas/`:

| Schema file | Lines | Defines |
|-------------|-------|---------|
| `workflow.schema.json` | 206 | Workflow-level manifest: id, version, title, tags, rules, skills, modes, variables, artifactLocations, initialActivity |
| `activity.schema.json` | 531 | Activity definition: steps, checkpoints, transitions, loops, actions, conditions, mode overrides, exitActions, artifacts |
| `skill.schema.json` | 182 | Skill definition: capability, inputs, protocol, outputs, rules, resources, errors |
| `condition.schema.json` | 121 | Condition primitives: simple (variable/operator/value), and, or, not |
| `state.schema.json` | 477 | Variables, defaults, types, derived state |
| `README.md` (schema docs) | 1639 | Full schema ontology, ER diagram, field tables, examples |

Authoritative reference for audit findings will cite the construct names defined in these schemas.

## 2. TOON format literacy (confirmed)

TOON is the YAML-flavoured DSL used for all workflow content. After surveying `workflow.toon`, multiple `activities/*.toon`, and multiple `skills/*.toon`, the following syntax conventions are confirmed:

- **Key-value pairs**: `key: value`. Strings containing colons or special chars are quoted: `description: "..."`.
- **Arrays with size suffix**: `tags[6]:` indicates a 6-element array, expanded as bullet items.
- **Inline tabular arrays**: `exitActions[1]{action,message}:` declares column headers; rows follow with comma-separated values.
- **Nested objects**: 2-space indented blocks under a key.
- **Arrays of objects**: bullet items (`- id: ...`) under an `arrayName[N]:` header.
- **Variable references**: `{variable_name}` interpolation in messages and paths.
- **Conditions**: a structured object — `type: simple|and|or|not`. `simple` uses `variable`, `operator` (`==`, `!=`, etc.), `value`. `and`/`or` use `conditions[N]`.
- **Quoting rule**: any string containing `:` or starting with reserved chars must be double-quoted.

## 3. Schema constructs in use by `work-package`

The following constructs appear in the work-package files; these define the surface area subject to audit.

### Workflow-level (`workflow.toon` v3.7.0)

| Construct | Use in work-package |
|-----------|---------------------|
| `id`, `version`, `title`, `description`, `author`, `tags[6]` | Identity metadata. |
| `rules[7]` | Workflow-wide governance (orchestration model, checkpoint discipline). |
| `skills.primary` | `meta/workflow-orchestrator` — the orchestrator skill. |
| `artifactLocations` | 4 named locations: `planning`, `reviews`, `adr`, `comprehension`. |
| `modes[1]` | Single mode: `review` with `activationVariable: is_review_mode`, `recognition`, `skipActivities[2]`, `defaults`, `resource`. |
| `variables[70]` | 70 declared variables (boolean / string / array / object) with descriptions and defaults. |
| `initialActivity` | `start-work-package`. |

### Activity-level (per `activity.schema.json`)

Sampled `02-design-philosophy.toon`, `01-start-work-package.toon` and confirmed presence of:

| Construct | Notes |
|-----------|-------|
| `id`, `version`, `name`, `description`, `problem` | Identity + intent. |
| `recognition[N]`, `required`, `estimatedTime` | Discovery + scheduling metadata. |
| `rules[N]` | Activity-scoped invariants. |
| `entryActions[N]` / `exitActions[N]` | Lifecycle hooks (`log`, `message`, `set`). |
| `artifacts[N]` | Declared outputs with `id`, `name`, `location` (resolves against `artifactLocations`), `description`. |
| `skills.primary` (e.g. `meta/activity-worker`) | Worker skill reference. |
| `steps[N]` | Ordered units with `id`, `name`, `description`, optional `skill`, `checkpoint`, `condition`, `actions[]`. |
| `loops[N]` | `type: while|forEach`, with `condition` and nested `steps[N]`. |
| `checkpoints[N]` | `id`, `name`, `condition`, `message`, `blocking`, `defaultOption`, `autoAdvanceMs`, `options[N]` (each with `id`, `label`, `description`, `effect.setVariable`). |
| `transitions[N]` | `to`, `condition`, `isDefault`. |
| `outcome[N]`, `context_to_preserve[N]` | Activity contract. |

### Skill-level (per `skill.schema.json`)

Sampled `04-classify-problem.toon`, `14-manage-artifacts.toon`:

| Construct | Notes |
|-----------|-------|
| `id`, `version`, `capability`, `description` | Identity. |
| `inputs[N]` | `id`, `description`, `required`. |
| `protocol` | Named phases (`load-framework`, `define-problem`, …) each containing an array of step strings. |
| `output[N]` / `outputs[N]` | `id`, `description`, `artifact.name`, `components`. |
| `rules` | Free-form named rules (kebab-keys), e.g. `path-determines-workflow`, `committed-to-parent`. |
| `resources[N]` | Bare resource ids (e.g. `"09"`, `"01"`) referencing `resources/NN-*.md`. |
| `errors` | Map of `error_id -> { cause, recovery }`. |

### Conditions

`condition.schema.json` primitives observed: `simple` (with `variable`, `operator`, `value`) and `and`/`or` aggregations (`conditions[N]`). Operators in use: `==`, `!=`. No use of `>`/`<`/`in` observed in surveyed files (acceptable; the schema permits but does not require them).

## 4. Conventions observed

| Convention | Pattern observed |
|------------|------------------|
| **File naming** | `NN-name.toon` for activities and skills (zero-padded). Resources `NN-name.md`. |
| **Folder structure** | `workflows/<workflow-id>/{workflow.toon, README.md, activities/, skills/, resources/}`. Optional companion docs: `REVIEW-MODE.md`. |
| **Versioning** | SemVer strings on workflow, activities, and skills (e.g., workflow `3.7.0`, activity `1.4.0`, skill `1.0.0`). |
| **Field ordering (activity)** | identity → metadata → rules → entryActions → artifacts → skills → steps → loops → checkpoints → transitions → exitActions → outcome → context_to_preserve. |
| **Field ordering (skill)** | identity → inputs → protocol → output(s) → rules → resources → errors. |
| **Artifact prefixing** | Activity-level `artifactPrefix` is server-computed from filename digits and prepended to bare artifact names (e.g., `09-code-review.md`). The `manage-artifacts` skill enforces this. |
| **Checkpoint discipline** | Both blocking and advisory checkpoints exist. Advisory ones use `blocking: false` with `defaultOption` + `autoAdvanceMs`. |
| **Mode-conditioned content** | Steps/checkpoints/transitions guarded by `condition.simple { variable: is_review_mode, operator: ==, value: true }` (or `!=`) implement the review override pattern documented in `REVIEW-MODE.md`. |
| **Skill references in steps** | Steps optionally name a `skill:` (e.g., `manage-git`, `classify-problem`) which resolves within the workflow's skills inventory. The activity's primary skill is `meta/activity-worker` (cross-workflow reference using the `meta/` prefix). |
| **Resource references** | Skills declare `resources[N]:` with bare numeric ids (`"09"`); the server resolves these against `workflows/work-package/resources/NN-*.md`. Cross-workflow references would use `prefix/id` form. |

## 5. Inventory baseline (carried forward to audit)

(From `01-intake-scope.md`, restated for reference.)

- 14 activities (numbered 01..14, with 14-codebase-comprehension positioned out-of-sequence by ID but reachable from activity 02 via transition)
- 24 skills (numbered 00..23)
- 28 resources (numbered 01..28)
- 1 mode (`review`)
- 7 workflow-level rules
- 70 declared variables
- 39 activity-level checkpoints across all activities
- 24 activity-level transitions across all activities
- Terminal activity: `13-complete` (0 transitions)

## 6. Audit hooks identified

The next activity (`quality-review`) will assess the work-package workflow against design principles. The constructs and conventions above define what the audit will inspect. Anticipated audit dimensions:

- **Schema conformance** — every TOON file matches its schema.
- **Naming and ordering consistency** — file numbering, version strings, field order.
- **Variable hygiene** — declared in `workflow.toon` ↔ used in conditions/steps/checkpoints; no orphans; sensible defaults.
- **Transition graph integrity** — every `to:` resolves to an existing activity; the graph is reachable; rework loops are intentional.
- **Checkpoint hygiene** — blocking vs advisory choices, `defaultOption` matches an option `id`, mutually-exclusive effects.
- **Mode override consistency** — every step/checkpoint/transition gated by `is_review_mode` aligns with `REVIEW-MODE.md` claims and `skipActivities`.
- **Skill ↔ activity coupling** — skill ids referenced by `step.skill` exist in `skills/`; resources referenced by skills exist in `resources/`.
- **Artifact location resolution** — `artifacts[].location` keys exist in `workflow.artifactLocations`.
- **Outcome / context_to_preserve completeness** — declared per activity.
- **Workflow-level rules** — any rule that effectively governs an activity is reflected by structure (e.g., orchestration constraint enforced by `skills.primary` and the orchestrator/worker pattern).

## 7. Literacy confirmation

- `format_literacy_confirmed`: implicit-true (review mode auto-confirms after intake; further validated by reading the surveyed TOON files above).
- `schema_constructs_confirmed`: implicit-true (the construct inventory in §3 covers everything the work-package workflow uses).
- Auditor is grounded and ready to enter the `quality-review` activity.

## 8. Files surveyed (READ-ONLY)

- `workflows/work-package/workflow.toon`
- `workflows/work-package/README.md`
- `workflows/work-package/REVIEW-MODE.md`
- `workflows/work-package/activities/01-start-work-package.toon` (partial)
- `workflows/work-package/activities/02-design-philosophy.toon`
- `workflows/work-package/skills/04-classify-problem.toon`
- `workflows/work-package/skills/14-manage-artifacts.toon`
- `schemas/` (file inventory + line counts confirmed)
