# Workflow Design Activities

> Part of the [Workflow Design Workflow](../README.md)

Eight activities that guide an agent from free-form description to validated, committed workflow files. `requirements-refinement`, `pattern-analysis`, `impact-analysis`, and `scope-and-draft` are mode-dependent (skipped in review mode); `pattern-analysis` is also skipped in update mode. `post-update-review` runs only in update mode as an automatic post-commit compliance audit. Each step is a pure binding (`id` + `technique` + structural fields); the WHAT/HOW of a step lives in the operation its `technique` binds. Each activity section below lists its bound steps, checkpoints, transitions, and mode overrides.

---

### 01. Intake and Context

**Purpose:** Operation-type capture followed by the schema-system and TOON-format baseline. Classify the request as create, update, or review, establish the corresponding mode + target, then internalize the schema system and format conventions before drafting begins. In update mode, loads the existing workflow before proceeding; in review mode, confirms the audit target.

**Techniques:** supporting [`variable-binding`](../../meta/techniques/variable-binding.md)

**Steps:**

1. `intake-classification` — binds [`intake-classification`](../techniques/intake-classification.md); carries the `mode-confirmation` checkpoint
2. `context-loading` — binds [`context-loading`](../techniques/context-loading.md)
3. `auto-confirm-literacy` — pure action/control step (no bound technique): when `is_update_mode` is true, sets `format_literacy_confirmed` and `schema_constructs_confirmed` to true

**Checkpoints (5):** `review-scope-confirmed` (review mode, blocking — sets `review_scope_confirmed`), `mode-confirmation` (create/update — confirms classified operation), `change-request-confirmed` (update mode — confirms existing structure and change request), `format-literacy` (create mode — sets `format_literacy_confirmed`), `constructs-confirmed` (create mode — sets `schema_constructs_confirmed`).

**Transitions:** To [Quality Review](#06-quality-review) when `is_review_mode` and `review_scope_confirmed` are both true; otherwise default to [Requirements Refinement](#02-requirements-refinement) (gated by `format_literacy_confirmed` and `schema_constructs_confirmed`).

---

### 02. Requirements Refinement

**Purpose:** Guided elicitation of the workflow specification across purpose, activities, checkpoints, artifacts, variables, techniques, and rules — one question at a time.

**Techniques:** supporting [`variable-binding`](../../meta/techniques/variable-binding.md)

**Steps:**

1. `elicitation` — binds [`elicitation`](../techniques/elicitation.md)

**Checkpoints (8):** one per design dimension — `purpose-confirmed`, `activities-confirmed`, `model-confirmed` (create mode), `checkpoints-confirmed`, `artifacts-confirmed`, `variables-confirmed` (create mode), `techniques-confirmed` (create mode), `rules-confirmed` (sets `requirements_confirmed`).

**Transitions:** In update mode, to [Impact Analysis](#04-impact-analysis); otherwise default to [Pattern Analysis](#03-pattern-analysis).

**Mode:** Skipped in review mode. In update mode, the `model-confirmed`, `variables-confirmed`, and `techniques-confirmed` checkpoints are skipped (gated on `is_update_mode != true`).

---

### 03. Pattern Analysis

**Purpose:** Extract structural and content patterns from comparable existing workflows for reuse in the target workflow. Present patterns alongside the proposed structure.

**Techniques:** supporting [`variable-binding`](../../meta/techniques/variable-binding.md)

**Steps:**

1. `pattern-analysis` — binds [`pattern-analysis`](../techniques/pattern-analysis.md)

**Checkpoints (1):** `patterns-confirmed` — adopt all, selective adoption, or diverge with justification.

**Transitions:** Default to [Scope and Draft](#05-scope-and-draft).

**Mode:** Skipped in update and review modes (`required: false`).

---

### 04. Impact Analysis

**Purpose:** Assess the impact of proposed changes against an existing workflow's files, transitions, and references. Flag content that will be removed. Update mode only.

**Techniques:** supporting [`variable-binding`](../../meta/techniques/variable-binding.md)

**Entry action:** Validates `is_update_mode` is true before proceeding.

**Steps:**

1. `impact-analysis` — binds [`impact-analysis`](../techniques/impact-analysis.md)

**Checkpoints (2):** `impact-confirmed` (impact scope), `preservation-confirmed` (content removals).

**Transitions:** Default to [Scope and Draft](#05-scope-and-draft).

**Mode:** Skipped in create and review modes (`required: false`).

---

### 05. Scope and Draft

**Purpose:** Define the complete file manifest and structural design, then run a per-file drafting and review pass over every entry in the confirmed scope manifest, validating each TOON file against its schema.

**Techniques:** supporting [`variable-binding`](../../meta/techniques/variable-binding.md)

**Entry action:** Validates `scope_manifest_confirmed` is true before drafting begins.

**Steps:**

1. `scope-definition` — binds [`scope-definition`](../techniques/scope-definition.md); carries the `scope-and-structure-confirmed` checkpoint
2. `present-file-approach` — binds [`content-drafting`](../techniques/content-drafting.md)
3. `toon-authoring` — binds [`toon-authoring`](../techniques/toon-authoring.md)
4. `present-for-review` — binds [`content-drafting`](../techniques/content-drafting.md)
5. `advance-to-next-file` — pure control step (no bound technique)

**Loop:** `file-drafting-loop` — `forEach` over `scope_manifest` (bound to `current_file`, max 50 iterations), repeating `present-file-approach` → `toon-authoring` → `present-for-review`.

**Checkpoints (5):** `scope-and-structure-confirmed` (non-blocking, 30s auto-advance — sets `scope_manifest_confirmed` and `approach_confirmed`), `file-approach-confirmed` (create mode, per file), `file-review` (create mode, per file), `preservation-check` (update mode, when `has_unflagged_removals`), `batch-review` (update mode, non-blocking, 30s auto-advance).

**Transitions:** Default to [Quality Review](#06-quality-review).

**Mode:** Skipped in review mode. In update mode, `file-approach-confirmed` and `file-review` are skipped and the `batch-review` / `preservation-check` checkpoints apply instead.

---

### 06. Quality Review

**Purpose:** Quality review of drafted workflow content. In create/update modes, runs four audit passes (expressiveness, conformance, rule hygiene, rule enforcement). In review mode, runs the full compliance audit (load all files, principle compliance, anti-pattern scan, schema validation, tool-technique-doc consistency) and compiles a report.

**Techniques:** supporting [`variable-binding`](../../meta/techniques/variable-binding.md)

**Steps (11, condition-gated by mode):**

*Review mode (`is_review_mode == true`):*

1. `load-all-workflow-files` — binds [`reload-workflow`](../techniques/reload-workflow.md)
2. `principle-compliance-audit` — binds [`audit-principles`](../techniques/audit-principles.md)
3. `anti-pattern-scan` — binds [`audit-anti-patterns`](../techniques/audit-anti-patterns.md)
4. `schema-validation-check` — binds [`audit-schema-validation`](../techniques/audit-schema-validation.md)
5. `tool-technique-doc-consistency` — binds [`audit-consistency`](../techniques/audit-consistency.md)
6. `compile-report` — binds [`compile-report`](../techniques/compile-report.md)
7. `offer-fixes` — pure control step carrying the `review-disposition` checkpoint

*Create/update modes (`is_review_mode != true`):*

8. `audit-expressiveness` — binds [`audit-expressiveness`](../techniques/audit-expressiveness.md)
9. `audit-conformance` — binds [`audit-conformance`](../techniques/audit-conformance.md)
10. `audit-rule-hygiene` — binds [`audit-rule-hygiene`](../techniques/audit-rule-hygiene.md)
11. `audit-rule-enforcement` — binds [`audit-rule-enforcement`](../techniques/audit-rule-enforcement.md)

**Checkpoints (5):** `expressiveness-confirmed`, `conformance-confirmed`, `rule-hygiene-confirmed`, `enforcement-confirmed` (all create/update, non-blocking with 30s auto-advance), and `review-disposition` (review mode — fix issues / report only / selective fixes; the fix options set `user_wants_fixes`, flip to update mode, and `transitionTo: intake-and-context`).

**Transitions:** Default to [Validate and Commit](#07-validate-and-commit).

---

### 07. Validate and Commit

**Purpose:** Final validation, scope verification, README generation/update, and commit of workflow changes to the workflows worktree. In review mode, save the compliance report and commit it.

**Techniques:** supporting [`variable-binding`](../../meta/techniques/variable-binding.md)

**Steps (7, condition-gated by mode):**

*Review mode (`is_review_mode == true`):*

1. `save-compliance-report` — binds [`persist-report`](../techniques/persist-report.md)
2. `commit-report` — binds [`version-control::commit-regular-files`](../../meta/techniques/version-control/commit-regular-files.md)

*Create/update modes (`is_review_mode != true`):*

3. `run-schema-validation` — binds [`audit-schema-validation`](../techniques/audit-schema-validation.md)
4. `verify-scope-manifest` — binds [`scope-verification`](../techniques/scope-verification.md)
5. `readme-authoring` — binds [`readme-authoring`](../techniques/readme-authoring.md)

*All non-review paths:*

6. `stage-and-commit` — binds [`version-control::commit-regular-files`](../../meta/techniques/version-control/commit-regular-files.md)
7. `verify-commit` — binds [`commit-verification`](../techniques/commit-verification.md)

**Checkpoints (2):** `validation-passed` (create/update, non-blocking 30s auto-advance — sets `all_files_validated`), `scope-verified` (create/update, non-blocking 30s auto-advance).

**Transitions:** In update mode, to [Post-Update Review](#08-post-update-review). Terminal in create and review modes. Exit action logs completion.

---

### 08. Post-Update Review

**Purpose:** Post-commit compliance audit of the updated workflow against design principles and anti-patterns. Reloads the committed state from the workflow-server (not cached data) and produces a severity-rated findings summary. Update mode only.

**Techniques:** supporting [`variable-binding`](../../meta/techniques/variable-binding.md)

**Steps:**

1. `reload-updated-workflow` — binds [`reload-workflow`](../techniques/reload-workflow.md)
2. `run-audit-passes` — binds [`run-audit-passes`](../techniques/run-audit-passes.md)
3. `summarize-findings` — binds [`summarize-findings`](../techniques/summarize-findings.md)
4. `save-review-snapshot` — binds [`persist-report`](../techniques/persist-report.md)

**Artifacts:** `post-update-review-report` — `{target_workflow_id}-post-update-review.md` (created in the `reviews` location).

**Checkpoints (1):** `post-update-disposition` — accept, fix findings (`transitionTo: intake-and-context`), or revert commit (`transitionTo: intake-and-context`).

**Transitions:** Terminal activity, reached via the conditional transition from validate-and-commit. The `iterate` and `revert` options restart the workflow at `intake-and-context`.

**Mode:** Update mode only.
