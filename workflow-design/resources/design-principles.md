---
name: design-principles
description: Condensed, agent-executable reference of the 15 design principles governing workflow creation and modification.
metadata:
  order: 0
  legacy_id: 0
---

# Design Principles Reference

Condensed, agent-executable reference of the 15 design principles governing workflow creation and modification. Each principle includes the rule and the structural enforcement mechanism.

---

## 1. Internalize Before Producing

**Rule:** Demonstrate understanding of the conceptual model (Goal → Activity → Technique), schema-vs-runtime boundaries, inline-vs-modular distinctions, and existing conventions before producing any content.

**Enforcement:** `intake-and-context` activity with `format-literacy` and `constructs-confirmed` checkpoints. Both must pass before content drafting can begin.

**Review mode:** Those checkpoints are skipped; `intake-and-context` uses `review-scope-confirmed` and transitions directly to `quality-review` once `review_scope_confirmed` is true (see [review-mode-guide](./review-mode-guide.md)).

## 2. Define Complete Scope Before Execution

**Rule:** Enumerate every file to create, modify, or remove before starting. Include the workflows worktree. Re-verify after completion.

**Enforcement:** `scope-and-draft` activity with `scope-and-structure-confirmed` checkpoint. The `scope_manifest_confirmed` variable gates the `file-drafting-loop` (the loop runs only once the manifest is confirmed).

## 3. One Question at a Time

**Rule:** Each elicitation question and each checkpoint is atomic. Never combine multiple questions. Wait for the response before proceeding.

**Enforcement:** `03-requirements-refinement` elicits one dimension at a time via a `forEach` over `design_dimensions`, each iteration gated by the instance-qualified `dimension-confirmed#{current_dimension}` checkpoint.

## 4. Maximize Schema Expressiveness

**Rule:** Every piece of structured workflow information must use the most specific formal construct the schema provides. Prose is only acceptable for the `description` and `outcome` fields. Even in those fields, prose must not (a) restate what the surrounding structure already encodes — step position, loop bounds, checkpoint effects, variable defaults; (b) narrate rationale, downstream consumers, or prior-implementation comparisons; (c) enumerate the sequence of activities, phases, or steps (the canonical declaration is `activities[]` or the on-disk directory); (d) prescribe modifications to user-owned environment state (git config, shell, GPG, GitHub account); or (e) carry behavioural rules / role-prescriptions ("The orchestrator coordinates only", "Workers MUST X"). The dedicated `rules:` section on the construct or a parent construct is the canonical home for behavioural constraints. See anti-patterns 36-40. The same placement discipline governs the resource/technique boundary: resources carry what the agent fills or consults (templates, format skeletons, template-consumed vocabularies, reference material); techniques carry what the agent does (protocol phases, named rules, decision criteria, commands) — a resource section shaped as procedure or rules is a technique in the wrong file (AP-85), unguarded and unaddressable there.

**Enforcement:** `08-quality-review` with `expressiveness-confirmed` checkpoint. Schema construct inventory ([schema-construct-inventory](./schema-construct-inventory.md)) is the reference.

## 5. Convention Over Invention

**Rule:** Search for existing conventions before introducing new patterns. Use established naming (NN-name.yaml), field ordering, and structural patterns.

**Enforcement:** `08-quality-review` with `conformance-confirmed` checkpoint comparing against reference workflows.

## 6. Never Modify Upward

**Rule:** The schema is a fixed constraint. Fix content to match the schema, never the reverse. If a gap exists, ask the user whether it's a schema gap or a loader convention.

**Enforcement:** `validate` action on the leading `verify-preconditions` control step of `scope-and-draft`. Schema validation on every YAML file.

## 7. Confirm Before Irreversible Changes

**Rule:** Classify changes by reversibility. Semi-reversible and irreversible changes require explicit confirmation with impact analysis.

**Enforcement:** `05-impact-analysis` activity (update mode) with `impact-confirmed` and `preservation-confirmed` checkpoints.

## 8. Corrections Must Persist

**Rule:** Record user corrections, restate the violated rule, and verify compliance at every subsequent checkpoint. Generalize corrections across similar instances.

**Enforcement:** Cross-cutting concern — tracked throughout all activities.

## 9. Modular Over Inline

**Rule:** workflow.yaml defines metadata and references only. Activities, techniques, and resources live in their own files. Content exists in exactly one location.

**Enforcement:** Workflow rule. `08-quality-review` conformance check flags inline content.

## 10. Encode Constraints as Structure

**Rule:** Critical constraints must be backed by structural enforcement (checkpoints, conditions, validate actions), not just rule text. Text-based rules alone are insufficient.

**Enforcement:** `08-quality-review` with `enforcement-confirmed` checkpoint. Rule-to-structure audit flags unenforceable rules.

## 11. Plan Before Acting

**Rule:** Present approach before implementation. Show what will change, how, and in what order. Get confirmation before modifying any file.

**Enforcement:** `file-approach-confirmed` and `scope-and-structure-confirmed` checkpoints in `scope-and-draft`.

## 12. Non-Destructive Updates

**Rule:** Compare new content against existing content. Flag any material being removed. Content-reducing updates require explicit user approval.

**Enforcement:** `preservation-check` checkpoint in `scope-and-draft` (update mode). `preservation-confirmed` checkpoint in `impact-analysis`.

## 13. Format Literacy Before Content

**Rule:** Verify YAML format comprehension by reading existing files before drafting. Validate all YAML files against their schema before committing.

**Enforcement:** `format-literacy` checkpoint in `intake-and-context`. Schema validation in `scope-and-draft` and `validate-and-commit`.

## 14. Complete Documentation Structure

**Rule:** Every workflow must include a README.md at the root and in each subfolder (activities/, techniques/, resources/). READMEs ORIENT — they state the workflow's purpose, the at-a-glance activity sequence with its flow diagrams, the value each activity delivers, the file structure, a techniques overview, and links to the authoritative files. They do NOT transcribe the structured definition: an activity's `steps[]` (including its inline `kind: checkpoint` and `kind: loop` steps), its activity-level decisions and transitions, per-step technique bindings, the workflow's `variables`, its `rules`, and per-activity estimated times all live in the YAML files and are never restated in a README. Flow diagrams (mermaid/ASCII) are visual orientation and are kept (AP-76).

**Enforcement:** `generate-readme` / `update-readme` steps in validate-and-commit. Scope manifest must include README files.

## 15. Output Economy

**Rule:** Design a workflow's artifact contracts and checkpoint set for the reader who must act on them — every artifact is re-read into agent context downstream, and every checkpoint stalls the pipeline on a human. Artifacts: each fact has one canonical artifact and every other appearance is a link (single-source-and-link); status tables report exceptions only; templates are the maximum shape, not the required shape; lifecycle logs are one row per item updated in place; a workflow has exactly one terminal close-out document. Resources: agent-facing operative documents (template + rules), not tutorials. Checkpoints: one decision, one checkpoint; guidance with no decision is a message; a checkpoint that run evidence shows always answered with its default option is a merge/demote candidate; a checkpoint whose subject is a planning artifact MUST embed a markdown link to that artifact's absolute path so the user can open it without hunting (AP-77 through AP-84, AP-90).

The economy must also be STRUCTURAL: templates cannot prescribe the same fact category in more than one place (canonical-home map, AP-86), cannot carry slots shaped for restating other artifacts (link-only inputs, AP-87), must back their style rules with a boundary conformance gate (AP-88), and must declare each artifact's primary audience so format follows function (AP-89).

**Enforcement:** `manage-artifacts` output-discipline rules (single-source-and-link, exception-only-reporting, state-once-per-artifact, lean-header, omit-null-sections) inherited by every artifact write. Output-economy anti-patterns (AP-77–84, AP-90) and structural-economy anti-patterns (AP-86–89) in the quality-review `audit-anti-patterns` pass. Session-trace checkpoint evidence reviewed in the retrospective.
