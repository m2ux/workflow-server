# Workflow Design Activities

> Part of the [Workflow Design Workflow](../README.md)

Ten sequential activities that guide an agent from free-form description to validated, committed workflow files. Activities 3–7 are mode-dependent (skipped in review mode). Activity 10 runs only in update mode as an automatic post-commit compliance audit. Each activity section below includes its purpose, skills, steps, checkpoints, transitions, and mode overrides.

---

### 01. Intake

**Purpose:** Accept the user's free-form description, classify as create/update/review, and extract initial design intent. In update mode, loads the existing workflow and parses the change request. In review mode, loads the target workflow and presents its structure for audit.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00)

**Steps:**

1. **accept-description** — Receive and summarize the user's workflow description
2. **classify-operation** — Determine create, update, or review based on user intent
3. **extract-design-intent** — Extract purpose, domain, activity count, model type, constraints
4. **set-mode** — Set `is_update_mode`, `is_review_mode`, and `workflow_id` variables

**Checkpoints:** `mode-confirmation` — Confirm the classified operation type.

**Transitions:** Default to [Context and Literacy](#02-context-and-literacy).

**Mode overrides:**
- **Update:** Adds steps to load existing workflow, parse change request, and present current structure. Adds `change-request-confirmed` checkpoint.
- **Review:** Adds steps to load target workflow, enumerate contents, and present review scope. Skips `accept-description`, `classify-operation`, `extract-design-intent`, `set-mode`. **`review-scope-confirmed` checkpoint** (blocking) sets `review_scope_confirmed` before continuing.

---

### 02. Context and Literacy

**Purpose:** Load schema definitions, read existing workflows to understand conventions, and verify TOON format comprehension. Gates all subsequent content production via `format_literacy_confirmed` and `schema_constructs_confirmed` variables.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00), supporting [`toon-authoring`](../skills/README.md#skill-protocol-toon-authoring-01)

**Steps:**

1. **load-schemas** — Fetch `workflow-server://schemas` to load all schema definitions
2. **read-schema-documentation** — Read `schemas/README.md` for the full schema ontology, field tables, and validation guidance
3. **survey-existing-workflows** — Call `list_workflows` and `get_workflow` for 2+ reference workflows
4. **read-toon-examples** — Read existing TOON files to confirm syntax understanding
5. **identify-applicable-constructs** — Identify which schema constructs apply to this workflow
6. **present-convention-summary** — Summarize observed conventions for user confirmation

**Checkpoints:** `format-literacy` (TOON format understanding), `constructs-confirmed` (schema constructs identified). In review mode, `format-literacy` is skipped and `constructs-confirmed` is adapted to audit context.

**Transitions:** Default to [Requirements Refinement](#03-requirements-refinement) (gated by both confirmed variables). In review mode, to [Quality Review](#08-quality-review) when `is_review_mode` and `review_scope_confirmed` are true.

---

### 03. Requirements Refinement

**Purpose:** Systematically elicit workflow design details one question at a time. Each design dimension has its own checkpoint to enforce atomic, sequential elicitation.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00)

**Steps:** 8 steps covering purpose, activities, activity model, checkpoints, artifacts, variables, skills, and rules.

**Checkpoints:** 8 atomic checkpoints — one per design dimension: `purpose-confirmed`, `activities-confirmed`, `model-confirmed`, `checkpoints-confirmed`, `artifacts-confirmed`, `variables-confirmed`, `skills-confirmed`, `rules-confirmed`.

**Transitions:** Default to [Pattern Analysis](#04-pattern-analysis).

**Mode:** Skipped in review mode. In update mode, skips `elicit-activity-model`, `elicit-variables`, `elicit-skills`.

---

### 04. Pattern Analysis

**Purpose:** Audit 2+ existing workflows of the same type to extract reusable structural and content patterns. Present patterns alongside proposed structure.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00)

**Steps:** Select reference workflows, extract structural patterns, extract content patterns, present comparison.

**Checkpoints:** `patterns-confirmed` — Confirm which patterns to adopt.

**Transitions:** Default to [Scope and Structure](#06-scope-and-structure).

**Mode:** Skipped in update and review modes.

---

### 05. Impact Analysis

**Purpose:** For update mode only. Enumerate all files in the existing workflow, identify affected files, check transition and reference integrity, flag content that will be removed.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00)

**Steps:** Enumerate existing files, classify impact, check transition integrity, check reference integrity, flag content removal.

**Checkpoints:** `impact-confirmed` (impact scope), `preservation-confirmed` (content removals).

**Transitions:** Default to [Scope and Structure](#06-scope-and-structure).

**Mode:** Skipped in create and review modes.

---

### 06. Scope and Structure

**Purpose:** Define the complete file manifest and structural design. Enumerates every file to create, modify, or remove, and proposes the folder structure and implementation order.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00)

**Steps:** Verify worktree, design folder structure, enumerate file manifest, present structural design, present approach.

**Checkpoints:** `scope-confirmed` (sets `scope_manifest_confirmed`), `structure-confirmed` (sets `approach_confirmed`).

**Transitions:** Default to [Content Drafting](#07-content-drafting) (gated by both confirmed variables).

**Mode:** Skipped in review mode. In update mode, skips `design-folder-structure`.

---

### 07. Content Drafting

**Purpose:** Draft or modify each file in the scope manifest with per-file approach and review checkpoints. Validates all TOON files against the schema immediately after drafting.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00), supporting [`toon-authoring`](../skills/README.md#skill-protocol-toon-authoring-01)

**Steps:** Present file approach, draft file content, validate against schema, present for review, advance to next file.

**Loop:** `forEach` over `scope_manifest` files.

**Checkpoints:** `file-approach-confirmed` (per file), `file-review` (per file).

**Transitions:** Default to [Quality Review](#08-quality-review).

**Mode:** Skipped in review mode. In update mode, adds `preservation-check` checkpoint for content being removed.

---

### 08. Quality Review

**Purpose:** Three review passes over all content: schema expressiveness, convention conformance, and rule-to-structure audit. Each pass has its own checkpoint.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00)

**Steps:** 6 steps — review and present findings for each of the three passes. Uses [resource 01](../resources/01-schema-construct-inventory.md) for expressiveness audit and [resource 02](../resources/02-anti-patterns.md) for anti-pattern scan.

**Checkpoints:** `expressiveness-confirmed`, `conformance-confirmed`, `enforcement-confirmed`.

**Transitions:** Default to [Validate and Commit](#09-validate-and-commit).

**Mode:** In review mode, gains 7 additional steps (load all workflow files, principle compliance audit, anti-pattern scan, schema validation check, compile compliance report, present report, offer fixes) and a `review-disposition` checkpoint.

---

### 09. Validate and Commit

**Purpose:** Run schema validation, re-verify scope manifest, generate/update README, commit to the workflows worktree. In review mode, save the compliance report as an artifact.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00), supporting [`toon-authoring`](../skills/README.md#skill-protocol-toon-authoring-01)

**Steps:** Run schema validation, verify scope manifest, generate README (create) or update README (update), stage and commit, verify commit.

**Checkpoints:** `validation-passed`, `scope-verified`.

**Transitions:** In update mode, transitions to [Post-Update Review](#10-post-update-review). Terminal in create and review modes.

**Mode:** In review mode, skips validation/scope/README steps and instead saves the compliance report and commits it to the parent repository.

---

### 10. Post-Update Review

**Purpose:** Automatically runs after validate-and-commit in update mode. Reloads the updated workflow from the workflow-server and runs all 5 audit passes (schema expressiveness, convention conformance, rule enforcement, anti-pattern scan, schema validation) to verify the update did not introduce new compliance issues.

**Skills:** primary [`workflow-design`](../skills/README.md#skill-protocol-workflow-design-00)

**Steps:** Reload updated workflow, run 5 audit passes, compile findings summary, present results, save review snapshot.

**Checkpoints:** `post-update-disposition` — Accept results, fix findings (transitions back to intake), or revert commit.

**Transitions:** Terminal activity. The `iterate` and `revert` checkpoint options use `transitionTo: intake` to restart the workflow in update mode if findings need to be addressed.

**Mode:** Update mode only (reached via conditional transition from validate-and-commit).
