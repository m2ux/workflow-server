---
name: design-principles
description: Condensed, agent-executable reference of the 15 design principles governing workflow creation and modification.
metadata:
  order: 0
  legacy_id: 0
---

# Design Principles Reference

Condensed, agent-executable reference of the 15 design principles governing workflow creation and modification. Each principle includes the rule and the structural enforcement mechanism.

These principles — together with [anti-patterns](./anti-patterns.md) and [schema-construct-inventory](./schema-construct-inventory.md) — are the **workflow-design canon** for design-time authoring. Principles state Rule + Enforcement and cite lower layers; they do not re-embed catalog Detect (`canon-layer-cites-not-restates`). Workflow / activity / technique `rules` (and technique `## Rules`) are runtime-relevant only; any design-time constraint found there is migrated into this canon (`runtime-rules-only`), not left as injected session prose.

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

**Rule:** Every piece of structured workflow information must use the most specific formal construct the schema provides. Prose is only for `description` / `outcome` (and equivalent) fields that do not restate structure, narrate rationale, enumerate sequence, prescribe user-env mutation, or carry behavioural rules. Operative Detect lives in [schema-construct-inventory](./schema-construct-inventory.md) and the Schema Expressiveness / Description Hygiene anti-patterns (`checkpoint-not-prose`–`no-monolith-masking-steps`, `no-rationale-in-description`–`role-rules-not-description`, `resource-fills-not-does`, `no-technique-resource-dual-home`).

**Technique binding:** Ordered procedure lives in the bound technique's protocol; bound steps are pure binding; one operation per procedural step; activity `techniques[]` is strategy-only — see `procedure-in-protocol`, `bound-step-no-description`, `no-monolith-masking-steps`, `techniques-list-disjoint`.

**Technique library as extension:** Prefer techniques (especially meta) over schema/engine changes; I/O names stay call-site-agnostic (`io-agnostic-contract`).

**Enforcement:** `08-quality-review` with `expressiveness-confirmed` checkpoint (`audit-expressiveness` walks the construct inventory).

## 5. Convention Over Invention

**Rule:** Search for existing conventions before introducing new patterns. Use established naming, field ordering, structural patterns, and positive documentation voice — see [convention-conformance](./convention-conformance.md), `no-invented-naming`, and `documentation-voice-positive`.

**Enforcement:** `08-quality-review` with `conformance-confirmed` checkpoint (`audit-conformance` applies that resource against reference workflows).

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

**Enforcement:** `08-quality-review` conformance check flags inline content (`no-inline-content`).

## 10. Encode Constraints as Structure

**Rule:** Critical constraints must be backed by structural enforcement (checkpoints, conditions, validate actions), not just rule text. Text-based rules alone are insufficient — see `structure-backed-constraints`.

**Enforcement:** `08-quality-review` with `enforcement-confirmed` checkpoint (`audit-rule-enforcement` applies that anti-pattern).

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

**Rule:** Every workflow must include a README.md at the root and in each subfolder (`activities/`, `techniques/`, `resources/`). READMEs orient (purpose, flow diagrams, value, structure, links) — they do not transcribe YAML. Operative Detect: `readme-orients-not-transcribes`.

**Enforcement:** `generate-readme` / `update-readme` steps in validate-and-commit. Scope manifest must include README files.

## 15. Output Economy

**Rule:** Design artifact contracts and checkpoints for the reader who must act on them — one canonical home per fact, exception-only status, lean templates, one close-out document, one decision per checkpoint, statement-form messages with artifact links where named. Operative Detect: Output Economy anti-patterns (`single-closeout-artifact`–`lifecycle-row-update`, `link-named-artifacts`–`statement-not-question`, `no-caption-only-message`) and structural-economy entries (`canonical-fact-home`–`artifact-audience-declared`), plus `manage-artifacts` output-discipline rules.

**Enforcement:** `manage-artifacts` discipline on every artifact write; Output Economy entries in the quality-review `audit-anti-patterns` pass. Session-trace checkpoint evidence reviewed in the retrospective.
