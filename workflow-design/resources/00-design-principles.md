# Design Principles Reference

Condensed, agent-executable reference of the 14 design principles governing workflow creation and modification. Each principle includes the rule and the structural enforcement mechanism.

---

## 1. Internalize Before Producing

**Rule:** Demonstrate understanding of the conceptual model (Goal → Activity → Skill), schema-vs-runtime boundaries, inline-vs-modular distinctions, and existing conventions before producing any content.

**Enforcement:** `02-context-and-literacy` activity with `format-literacy` and `constructs-confirmed` checkpoints. Both must pass before content drafting can begin.

**Review mode:** Those checkpoints are skipped; intake uses `review-scope-confirmed`, then `02-context-and-literacy` runs a shortened step set and transitions directly to `08-quality-review` once `review_scope_confirmed` is true (see `resources/04-review-mode-guide.md`).

## 2. Define Complete Scope Before Execution

**Rule:** Enumerate every file to create, modify, or remove before starting. Include the workflows worktree. Re-verify after completion.

**Enforcement:** `06-scope-and-structure` activity with `scope-confirmed` checkpoint. `scope_manifest_confirmed` variable gates the transition to content drafting.

## 3. One Question at a Time

**Rule:** Each elicitation question and each checkpoint is atomic. Never combine multiple questions. Wait for the response before proceeding.

**Enforcement:** `03-requirements-refinement` uses 8 separate checkpoints, one per design dimension.

## 4. Maximize Schema Expressiveness

**Rule:** Every piece of structured workflow information must use the most specific formal construct the schema provides. Prose is only acceptable for `description`, `problem`, and `recognition` fields.

**Enforcement:** `08-quality-review` with `expressiveness-confirmed` checkpoint. Schema construct inventory (resource 01) is the reference.

## 5. Convention Over Invention

**Rule:** Search for existing conventions before introducing new patterns. Use established naming (NN-name.toon), field ordering, and structural patterns.

**Enforcement:** `08-quality-review` with `conformance-confirmed` checkpoint comparing against reference workflows.

## 6. Never Modify Upward

**Rule:** The schema is a fixed constraint. Fix content to match the schema, never the reverse. If a gap exists, ask the user whether it's a schema gap or a loader convention.

**Enforcement:** `validate` entry action on content-drafting. Schema validation on every TOON file.

## 7. Confirm Before Irreversible Changes

**Rule:** Classify changes by reversibility. Semi-reversible and irreversible changes require explicit confirmation with impact analysis.

**Enforcement:** `05-impact-analysis` activity (update mode) with `impact-confirmed` and `preservation-confirmed` checkpoints.

## 8. Corrections Must Persist

**Rule:** Record user corrections, restate the violated rule, and verify compliance at every subsequent checkpoint. Generalize corrections across similar instances.

**Enforcement:** Cross-cutting concern — tracked throughout all activities.

## 9. Modular Over Inline

**Rule:** workflow.toon defines metadata and references only. Activities, skills, and resources live in their own files. Content exists in exactly one location.

**Enforcement:** Workflow rule. `08-quality-review` conformance check flags inline content.

## 10. Encode Constraints as Structure

**Rule:** Critical constraints must be backed by structural enforcement (checkpoints, conditions, validate actions), not just rule text. Text-based rules alone are insufficient.

**Enforcement:** `08-quality-review` with `enforcement-confirmed` checkpoint. Rule-to-structure audit flags unenforceable rules.

## 11. Plan Before Acting

**Rule:** Present approach before implementation. Show what will change, how, and in what order. Get confirmation before modifying any file.

**Enforcement:** `file-approach-confirmed` checkpoint in content-drafting. `structure-confirmed` checkpoint in scope-and-structure.

## 12. Non-Destructive Updates

**Rule:** Compare new content against existing content. Flag any material being removed. Content-reducing updates require explicit user approval.

**Enforcement:** `preservation-check` checkpoint in content-drafting (update mode). `preservation-confirmed` checkpoint in impact-analysis.

## 13. Format Literacy Before Content

**Rule:** Verify TOON format comprehension by reading existing files before drafting. Validate all TOON files against their schema before committing.

**Enforcement:** `format-literacy` checkpoint in context-and-literacy. Schema validation in content-drafting and validate-and-commit.

## 14. Complete Documentation Structure

**Rule:** Every workflow must include a README.md at the root and in each subfolder (activities/, skills/, resources/). Root README documents the workflow overview, modes, activity sequence, variables, and file structure. Subfolder READMEs document the contents of that folder.

**Enforcement:** `generate-readme` / `update-readme` steps in validate-and-commit. Scope manifest must include README files.
