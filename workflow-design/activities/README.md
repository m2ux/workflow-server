# Workflow Design Activities

> Part of the [Workflow Design Workflow](../README.md)

Eight activities that guide an agent from free-form description to validated, committed workflow files. `requirements-refinement`, `pattern-analysis`, `impact-analysis`, and `scope-and-draft` are mode-dependent (skipped in review mode); `pattern-analysis` is also skipped in update mode. `post-update-review` runs only in update mode as an automatic post-commit compliance audit.

This file is an orientation map. The authoritative definition of each activity — its steps, checkpoints, decisions, loops, and transitions — lives in the per-activity YAML linked from each section below and is served by `get_activity`.

---

### 01. Intake and Context

Classify the request as create, update, or review, set the corresponding mode + target, then internalize the schema system and YAML format conventions before any drafting begins. It also binds the session's planning folder and, in create/update modes, seeds its `README.md` from the [design-context-readme](../resources/design-context-readme.md) template via `work-package::manage-artifacts::create-readme` — the entry point whose progress tracker every later activity updates. In update mode it loads the existing workflow first; in review mode it confirms the audit target and branches straight to quality review. This is the literacy gate: nothing downstream proceeds until the agent has the schema and format baseline.

Definition: [`01-intake-and-context.yaml`](./01-intake-and-context.yaml). Leads to [Requirements Refinement](#02-requirements-refinement), or directly to [Quality Review](#06-quality-review) in review mode.

---

### 02. Requirements Refinement

Guided one-question-at-a-time elicitation of the workflow specification across its design dimensions — purpose, activities, checkpoints, artifacts, variables, techniques, and rules. The value is a confirmed specification captured incrementally, without overwhelming the user with combined questions.

Definition: [`03-requirements-refinement.yaml`](./03-requirements-refinement.yaml). Skipped in review mode; leads to [Pattern Analysis](#03-pattern-analysis) (create) or [Impact Analysis](#04-impact-analysis) (update).

---

### 03. Pattern Analysis

Extract structural and content patterns from comparable existing workflows so the target workflow reuses proven conventions rather than reinventing them, and present those patterns alongside the proposed structure. Create mode only.

Definition: [`04-pattern-analysis.yaml`](./04-pattern-analysis.yaml). Leads to [Scope and Draft](#05-scope-and-draft).

---

### 04. Impact Analysis

Assess the impact of proposed changes against an existing workflow's files, transitions, and references, and flag any content that will be removed so removals are deliberate rather than silent. Update mode only.

Definition: [`05-impact-analysis.yaml`](./05-impact-analysis.yaml). Leads to [Scope and Draft](#05-scope-and-draft).

---

### 05. Scope and Draft

Define the complete file manifest and structural design up front, then run a per-file drafting and review pass over every entry in the confirmed manifest, validating each YAML file against its schema as it is written. After drafting, a block-indexed review of the full drafted set (`review-draft-yaml`) captures a draft attestation before the audit passes run. The value is a complete, pre-approved scope and a set of drafted files that are individually reviewed, attested, and schema-valid. Carries a per-file user checkpoint in create mode and a content-preservation guard in update mode.

Definition: [`06-scope-and-draft.yaml`](./06-scope-and-draft.yaml). Skipped in review mode; leads to [Quality Review](#06-quality-review).

---

### 06. Quality Review

Quality review of the drafted content. In create/update modes it runs the expressiveness, conformance, rule-hygiene, and rule-enforcement audit passes, then a bounded fix-revalidate loop — apply the selected fixes via `apply-audit-fixes`, re-run the audits, up to 3 iterations — and a critical-blocker gate that returns to Scope and Draft when a Critical finding remains. In review mode it runs the full compliance audit (load all files, principle compliance, anti-pattern scan, schema validation, tool-technique-doc consistency) and compiles a severity-rated report, after which the user chooses whether to fix the findings. The value is workflow content that has been checked against the design principles and conventions, and had its fixable findings resolved in place, before it is committed.

Definition: [`08-quality-review.yaml`](./08-quality-review.yaml). Leads to [Validate and Commit](#07-validate-and-commit).

---

### 07. Validate and Commit

Final schema validation, scope verification, README generation/update, and commit of the workflow changes to the workflows worktree. A blocking pre-commit attestation gate confirms sign-off before staging, with an option to return to Scope and Draft. In review mode it instead saves and commits the compliance report. The value is a workflow that is guaranteed loadable, has nothing left undone from its scope, has a human-readable entry point, and is committed with a deliberate sign-off.

Definition: [`09-validate-and-commit.yaml`](./09-validate-and-commit.yaml). Terminal in create and review modes; leads to [Post-Update Review](#08-post-update-review) in update mode.

---

### 08. Post-Update Review

Automatic post-commit compliance audit of the updated workflow against the design principles and anti-patterns. It reloads the committed state from the workflow-server (not cached data), runs a scope-discipline audit (`scope-audit`) comparing the committed change set against the scope manifest to flag drift, and produces a severity-rated findings summary persisted as a review snapshot, so update work is verified against the principles after it lands. Update mode only.

Definition: [`10-post-update-review.yaml`](./10-post-update-review.yaml). Terminal activity; the fix/revert dispositions restart the workflow at [Intake and Context](#01-intake-and-context).
