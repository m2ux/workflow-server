# Workflow Design Activities

> Part of the [Workflow Design Workflow](../README.md)

Nine activities that guide an agent from free-form description to validated, committed workflow files and a closing retrospective. `requirements-refinement`, `pattern-analysis`, `impact-analysis`, and `scope-and-draft` are mode-dependent (skipped in review mode); `pattern-analysis` is also skipped in update mode. `post-update-review` runs only in update mode as an automatic post-commit compliance audit. `retrospective` is the terminal activity in every mode.

Heading numbers below match on-disk `NN-` file prefixes (gaps at 02/07 are intentional).

This file is an orientation map. The authoritative definition of each activity — its steps, checkpoints, decisions, loops, and transitions — lives in the per-activity YAML linked from each section below and is served by `get_activity`.

---

### 01. Intake and Context

Derive create/update/review from the request (`intake-classification`), land gap flags (`operation_type_ambiguous`, `change_request_clear`, composite `intent_needs_confirmation`) and `{headless_mode}` (default true; false on explicit interactive opt-out such as “interactive”, “not headless”, or “with checkpoints”), set targets (`target_workflow_id` / `target_workflow_ids`), bind the planning folder and seed its `README.md` (create/update), then internalize schemas/conventions via `context-loading`. Gate 1 (`design-intent-batch`) fires only when `intent_needs_confirmation`; the clear path announces and proceeds. Create/update auto-confirm format literacy and schema constructs. Review with certain targets announces and sets `review_scope_confirmed`; ambiguous review targets enter Gate 1. Review-seeded updates skip Gate 1.

Definition: [`01-intake-and-context.yaml`](./01-intake-and-context.yaml). Leads to [Requirements Refinement](#03-requirements-refinement), or directly to [Quality Review](#08-quality-review) in review mode.

---

### 03. Requirements Refinement

Guided specification: create mode runs an optional design-context soft gate, then a `forEach` over design dimensions (prepare → surface questions → capture); update mode synthesizes the specification from the change request (`synthesize-update-specification`) with no per-dimension elicitation. Both paths persist the design specification; `spec-confirmed` is a soft gate (stakeholder attestation at Gate 2). It then surfaces design assumptions (`work-package::review-assumptions::collect`), reconciles via `reconcile-design-assumptions` in a `while has_resolvable_assumptions` loop, and leaves open judgements in the assumptions log for Gate 2 — no per-assumption interview parade.

Definition: [`03-requirements-refinement.yaml`](./03-requirements-refinement.yaml). Skipped in review mode; leads to [Pattern Analysis](#04-pattern-analysis) (create) or [Impact Analysis](#05-impact-analysis) (update).

---

### 04. Pattern Analysis

Extract structural and content patterns from comparable existing workflows, persist the comparison as a planning artifact, and soft-gate adoption at `patterns-confirmed` (`defaultOption` + `autoAdvanceMs`; auto-resolve when `{headless_mode}`). Create mode only.

Definition: [`04-pattern-analysis.yaml`](./04-pattern-analysis.yaml). Leads to [Scope and Draft](#06-scope-and-draft).

---

### 05. Impact Analysis

Assess the impact of proposed changes against an existing workflow's files, transitions, and references, and flag any content that will be removed so removals are deliberate rather than silent. When `removal_count` is zero the activity messages and continues; otherwise one soft `impact-and-preservation-confirmed` gate covers both blast radius and removals. Update mode only.

Definition: [`05-impact-analysis.yaml`](./05-impact-analysis.yaml). Leads to [Scope and Draft](#06-scope-and-draft).

---

### 06. Scope and Draft

In create/update modes, derive `{target_path}` and ensure a dedicated workflows worktree on `{workflow_branch}` (compose WP `create-worktree`) before drafting. Then define the complete file manifest and structural design up front, run a per-file drafting and review pass over every entry in the confirmed manifest (writes under `{target_path}`), validating each YAML file against its schema as it is written. After drafting, a block-indexed review (`review-draft-yaml`) feeds a single attestation gate — create mode `draft-attestation`, update mode `batch-review-attested` (change summary + blocks together). The value is a complete, pre-approved scope and a set of drafted files that are reviewed, attested, and schema-valid. Carries a per-file user checkpoint in create mode and a content-preservation guard in update mode.

Definition: [`06-scope-and-draft.yaml`](./06-scope-and-draft.yaml). Skipped in review mode; leads to [Quality Review](#08-quality-review).

---

### 08. Quality Review

Quality review of the drafted content. In create/update modes it runs the expressiveness, conformance, rule-hygiene, and rule-enforcement audit passes — each pass reports a zero-finding action message when clean, or a non-blocking flagged-findings message (no checkpoint) when findings remain, since they are fixed automatically — then a bounded fix cycle — activity steps edit via `yaml-authoring`, re-validate via `audit-schema-validation`, and record via `apply-audit-fixes`, then re-run the audits, up to 3 iterations — and a critical-blocker gate that returns to Scope and Draft when a Critical finding remains. In review mode it `forEach`es over `target_workflow_ids` (binding each to `target_workflow_id`) and runs the compliance audit (reload, principles, anti-patterns, schema validation, verify-high-findings, compile-report) per target, then presents a severity-rated report, after which the user chooses whether to fix the findings (`fix-issues` / `selective-fixes` seeds update mode and skips intake re-confirmation). The value is workflow content that has been checked against the design principles and conventions, and had its fixable findings resolved in place automatically, before it is committed.

Definition: [`08-quality-review.yaml`](./08-quality-review.yaml). Leads to [Validate and Commit](#09-validate-and-commit).

---

### 09. Validate and Commit

Final schema validation, scope verification, and README generation/update, then — in create/update modes — Gate 2 (`approve-to-commit`): a blocking batch that links design specification, assumptions/open judgements, impact, draft attestation, and planning README. Gate 2 stays interactive even when `{headless_mode}`. After approval: commit from the session `{target_path}` worktree (already on `{workflow_branch}` from scope-and-draft ensure), and a pull request opened against the `workflows` branch and marked ready (`publish-workflow-pr`); workflow changes never land straight on `workflows`. Validation and scope soft gates are presented only when `fail_count` or `unaddressed_count` is greater than zero. In review mode it instead saves and commits the compliance report directly.

Definition: [`09-validate-and-commit.yaml`](./09-validate-and-commit.yaml). Terminal in create and review modes; leads to [Post-Update Review](#10-post-update-review) in update mode.

---

### 10. Post-Update Review

Automatic post-commit compliance audit of the updated workflow. Reloads the committed state, then binds expressiveness, conformance, principles, anti-patterns, and schema-validation audits as consecutive steps (plus `scope-audit`), summarizes findings, and persists a review snapshot. When `review_findings_count` is zero it proceeds to the retrospective; otherwise `post-update-disposition` asks whether to accept, iterate, or revert. Update mode only.

Definition: [`10-post-update-review.yaml`](./10-post-update-review.yaml). Clean runs transition to the [Retrospective](#11-retrospective); the fix/revert dispositions restart the workflow at [Intake and Context](#01-intake-and-context).

---

### 11. Retrospective

Terminal activity for every mode. In create/update modes it records a `COMPLETE.md` completion summary (`create-completion-doc`) — what was delivered, the design decisions and alternatives rejected, scope outcome, and known limitations — then conducts a session retrospective (`conduct-retrospective`) that analyses the non-checkpoint interactions and records prioritized workflow improvements. When `{worktree_created}` is true, optional teardown composes WP `remove-worktree` for the session `{target_path}`. It is the workflow-design counterpart of work-package's Complete activity, minus the PR-merge and next-package-selection steps (workflow-design commits directly and has no package portfolio). A trivial session skips the retrospective.

Definition: [`11-retrospective.yaml`](./11-retrospective.yaml). Terminal in all modes.
