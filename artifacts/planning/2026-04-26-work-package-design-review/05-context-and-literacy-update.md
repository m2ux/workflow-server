# Context and Literacy (Update Mode) — Work Package Workflow Remediation

**Date:** 2026-04-26
**Activity:** `context-and-literacy` (update-mode pass)
**Mode:** update (`is_update_mode = true`, `is_review_mode = false`)
**Target workflow:** `work-package` v3.7.0
**Worker:** `worker-context-update`
**Prior literacy state (from review-mode pass):**
- `format_literacy_confirmed = true`
- `schema_constructs_confirmed = true`

---

## 1. Why this pass exists

Format literacy and schema-construct literacy were already confirmed during the
review-mode pass (artifact `02-context-and-literacy.md`). In update mode, the
activity's `auto-confirm-literacy` step re-asserts both flags as `true` because
the agent demonstrated format understanding while loading and analyzing the
target workflow during update-mode intake (`04-intake-update.md`).

This artifact narrows the construct inventory to **only the constructs that the
remediation edits will actually touch**, so subsequent activities
(`scope-and-structure`, `content-drafting`, `review-and-finalize`) can edit
with precise schema awareness.

## 2. Schema constructs in scope for the upcoming edits

Mapping each construct to the audit-finding bucket from `04-intake-update.md`
(buckets A–F):

### 2.1 `workflow.rules[]` (workflow-level rule array)

- **Schema:** `schemas/workflow.schema.json` — `rules[]` is an array of objects
  with `name` (string), `description` (string), and an optional grouped form
  via `category` keys. Critical/blocking semantics live in description prose.
- **Touched by:** Bucket A items 10.1, 10.2 (deletions of two prose rules from
  `workflow.toon rules[]`).
- **Edit operation:** Remove `rules[1]` (blocking-checkpoint enforcement) and
  `rules[7]` (ORCHESTRATION MODEL prose). Net: 7 → 5 entries.
- **Anti-pattern reference:** Principle 10 — rules that are runtime/loader
  concerns or pure README content should not occupy the workflow rules array.

### 2.2 `workflow.variables[]` (workflow-level variable declarations)

- **Schema:** `schemas/workflow.schema.json` — `variables[]` is an array of
  `{ name, type, default?, description? }`. Types include `string`, `number`,
  `boolean`, `object`, `array`. Object shapes can carry sub-shape via
  description.
- **Touched by:** Bucket B (variable declarations finding 4.4).
- **Edit operation:** Add 8 string variables (`current_branch`,
  `existing_pr_number`, `jira_issue_key`, `comprehension_artifact_path`,
  `block_path`, `block_line_range`, `change_block_index_path`, `artifact_name`)
  and document 2 object shapes (`plan` with `task_count` + `tasks[]`,
  `current_assumption` with `id` + `statement`). Net: 70 → 78 entries.
- **Anti-pattern reference:** Principle 4 — every variable interpolated in
  messages, conditions, or `setVariable` effects must be declared.

### 2.3 `activity.rules[]` (activity-level rule array)

- **Schema:** `schemas/activity.schema.json` — same shape as workflow rules.
  May be flat or grouped by category key (e.g., `tool-usage[]`,
  `error-handling[]`).
- **Touched by:**
  - Bucket A item 10.5 (`activities/14-codebase-comprehension.toon rules[7]`
    — likely delete; restates an existing `condition`).
  - Bucket D (`activities/14-codebase-comprehension.toon rules[1..3]` — delete
    duplicates that already live in `skills/22-build-comprehension.toon`).
- **Edit operation:** Delete restating/duplicating rules from activity `rules[]`.
- **Anti-pattern reference:**
  - Anti-pattern 24 — protocol restatement (rule re-encodes a condition).
  - Anti-pattern 27 — cross-level rule duplication (activity duplicates skill).

### 2.4 `activity.steps[].entryActions[]` (activity step entry actions)

- **Schema:** `schemas/activity.schema.json` — `entryActions[]` array on a
  step. Action shapes include `validate` (assert a condition before the step
  runs), `set` (assign a variable), and others. Validation actions surface as
  hard preconditions instead of prose rules.
- **Touched by:** Bucket A item 10.3 (Atlassian `cloudId` PREREQUISITE on
  `activities/01-start-work-package.toon`).
- **Edit operation:** Add `entryActions[].validate` (or step-level `condition:
  jira_cloud_id != null`) on the `verify-jira-issue` step. Remove the prose
  rule that currently encodes this as text.
- **Anti-pattern reference:** Principle 10 — text-only rule that the schema
  can express structurally.

### 2.5 `activity.steps[].condition` (per-step condition)

- **Schema:** `schemas/condition.schema.json` — supports `simple` (variable +
  operator + value), `and`, `or`, `not`. Used both at step level and at
  transition level.
- **Touched by:** Bucket A item 10.3 (alternative encoding for Jira gate) and
  used as the verification target for 10.5 (confirm the existing
  `has_open_questions == true` condition already enforces sufficiency before
  deleting the prose rule).
- **Edit operation:** Add `condition` on a step (10.3) or simply read existing
  conditions (10.5).

### 2.6 `activity.checkpoints[]` (activity checkpoints)

- **Schema:** `schemas/activity.schema.json` — `checkpoints[]` array with
  `{ id, name, condition?, message, options[] }`, where each option has
  `{ id, label, description?, effect? }`. Effects can `setVariable` or
  emit other side effects.
- **Touched by:** Bucket A item 10.4 (encode SYMBOL VERIFICATION as a
  self-review checkpoint on `activities/08-implement.toon`).
- **Edit operation:** Add a checkpoint with a symbol-provenance question; or
  alternatively use a `validate` exit action on the relevant step. Remove the
  prose rule that currently encodes this requirement.

### 2.7 `skill.rules` (skill-level rule object, grouped form)

- **Schema:** `schemas/skill.schema.json` — `rules` is an *object* whose keys
  are category names (e.g., `tool-usage`, `error-handling`, `persistent-artifacts`)
  and whose values are arrays of rule objects. Flat string-prefixed rules are
  an anti-pattern.
- **Touched by:** Bucket C item 4.1/4.2
  (`skills/03-create-issue.toon:43-50 tool-usage` — single semicolon-joined
  string into a grouped `tool-usage[]` array).
- **Edit operation:** Refactor a flat string rule into the grouped array form
  under `tool-usage[]`.
- **Anti-pattern reference:** Anti-pattern 26 — flat prefix keys (e.g.,
  `tool-usage: "..."`) instead of grouped arrays.

### 2.8 `skill.protocol[].description` (skill step description)

- **Schema:** `schemas/skill.schema.json` — `protocol[]` is the ordered step
  list; each step has an `id`, `name`, and `description` (free-form markdown).
  Step-specific behaviors belong in the step description, not in a top-level
  `rules` array.
- **Touched by:** Bucket C item 4.3 (`skills/22-build-comprehension.toon:86`
  `tool-usage` rule that applies to a single step — `architecture-survey`).
- **Edit operation:** Move the rule text into the
  `architecture-survey` step's description and delete the standalone rule.
- **Anti-pattern reference:** Anti-pattern 29 — single-step rule (a rule that
  governs only one protocol step belongs in that step's description).

### 2.9 `transitions[]` (terminal-state expressiveness)

- **Schema:** `schemas/activity.schema.json` — `transitions[]` array with
  `{ to, condition?, isDefault? }`. A terminal activity may model end-state
  with `to: workflow-end`.
- **Touched by:** Bucket F item 4.5 (optional —
  `activities/13-complete.toon`).
- **Edit operation (optional):** Add an explicit
  `transitions[].to: "workflow-end"` to make terminal state expressive.

### 2.10 `resources/*` and README markdown (documentation drift)

- **Schema:** Not schema-validated (markdown). `resources/README.md` follows a
  table convention: `| id | filename | description |`. Resource files have
  YAML-ish frontmatter (`id:`, `version:`) followed by markdown body.
- **Touched by:** Buckets E and F:
  - `workflows/work-package/README.md` (version header 3.6.1 → 3.7.0; "fourteen
    activities" reconciliation).
  - `workflows/work-package/REVIEW-MODE.md` (activity-ID renames
    `issue-management` → `start-work-package`, `update-pr` → `submit-for-review`).
  - `workflows/work-package/skills/README.md` ("24" vs "25" skill-count
    reconciliation).
  - `workflows/work-package/resources/README.md` (mark `02-readme.md` row
    deprecated or remove).
  - `workflows/work-package/resources/02-readme.md` (resolve duplicate
    `id: readme` — rename to `readme-deprecated` or delete the file).
- **Edit operation:** Plain text edits; no schema involvement except the YAML
  frontmatter `id` field on the resource file.

## 3. Constructs explicitly **not** in scope

To bound subsequent activities, the following constructs will **not** be
touched in this remediation:

- `workflow.modes[]` — review mode is unchanged.
- `workflow.initialActivity` — `start-work-package` is unchanged.
- Activity ordering / `activity.id` / `activity.name` — no renames, no
  additions, no deletions.
- Skill IDs / skill ordering / skill primary-vs-supporting roles.
- Any `condition.schema.json` operator semantics (we only *read* them for 10.5
  verification).
- Any `state.schema.json` constructs.
- Transition graph between activities (only the optional `transitions[].to:
  workflow-end` on `13-complete.toon` is even a candidate).

## 4. Convention recap (re-affirmed from review-mode artifact)

These conventions, already documented in `02-context-and-literacy.md`, govern
the upcoming edits:

| Convention | Form |
|---|---|
| File naming | `NN-name.toon` (zero-padded two-digit prefix, kebab-case) |
| Folder layout | `activities/`, `skills/`, `resources/` under workflow root |
| TOON syntax | key:value pairs; `[N]` array suffix on multi-element arrays; quoted strings when value contains `:`; inline `{key: value}` shorthand for short objects |
| Field ordering on activities | `id`, `version`, `name`, `description`, `problem`, `skills`, `required`, `estimatedTime`, `rules[]`, `steps[]`, `checkpoints[]`, `transitions[]`, `outcome[]`, `context_to_preserve[]` |
| Field ordering on skills | `id`, `version`, `name`, `description`, `_resources[]?`, `rules{}`, `protocol[]`, `outputs[]?` |
| Version format | `MAJOR.MINOR.PATCH` (semver). README header version must equal `workflow.toon version`. |
| Variable declarations | every variable referenced in messages, conditions, or `setVariable` effects must appear in `workflow.variables[]` |
| Skill rules form | grouped object (`rules.tool-usage[]`, `rules.error-handling[]`, etc.) — never flat-prefix strings |

## 5. Literacy gates

- `format_literacy_confirmed = true` (carried over from review-mode pass; the
  update-mode `auto-confirm-literacy` step re-asserts this).
- `schema_constructs_confirmed = true` (same).

The activity's `format-literacy` and `constructs-confirmed` checkpoints both
have a guarding condition `is_update_mode != true`, so neither fires in update
mode. The transition `to: requirements-refinement` (default) gates on both
flags being `true`, which they are.

## 6. Variables to preserve into next activity

- `format_literacy_confirmed = true`
- `schema_constructs_confirmed = true`
- `target_workflow_id = "work-package"`, `workflow_id = "work-package"`
- `planning_folder_path` (unchanged)
- `is_update_mode = true`, `is_review_mode = false`
- Construct-in-scope inventory from §2 (carried as design context, not as a
  workflow variable).

## 7. Outcome

- Schema constructs in scope for remediation are enumerated and mapped 1:1 to
  the audit-finding buckets from `04-intake-update.md`.
- No new construct families are needed; every edit fits within existing
  schema-permitted shapes (rules arrays, variable declarations, entryActions,
  conditions, checkpoints, grouped skill rules, step descriptions, optional
  terminal transition, plus README markdown).
- Both literacy flags remain `true`; activity transitions to
  `requirements-refinement` per the default transition rule.
