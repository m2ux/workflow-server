# Change Block Index

**Work Package:** Issue #128 — Canonical identifier naming convention
**Branch:** `chore/128-canonical-naming-convention` vs `main`
**PR:** #129 (draft)
**Files Changed:** 14 (1 in parent repo `docs/`, 13 in `workflows` submodule)
**Total Changes:** 22 hunks
**Estimated Review Time:** ~11 minutes (30 sec/change)

## Instructions

Review the changes in your side-by-side diff tool using this index for reference. Click any row number to jump to its rationale paragraph for context on why the change was made. Report row numbers for files with issues (e.g., "3, 7, 12") or "none" if all looks good.

The diff spans two git scopes:
- **Parent repo** (`/home/mike1/projects/work/workflow-server/2026-06-07-issue-128`): `git diff 52521005..HEAD -- docs/technique-protocol-specification.md`
- **`workflows` submodule** (committed `3512c65`): `git -C workflows diff 12e76a9..3512c65`

## File Index

| Row | Path | File |
|-----|------|------|
| [1](#block-1) | docs/ | technique-protocol-specification.md |
| [2](#block-2) | workflows/cicd-pipeline-security-audit/techniques/ | write-cicd-report.md |
| [3](#block-3) | workflows/prism/activities/ | 01-structural-pass.toon |
| [4](#block-4) | workflows/prism/techniques/ | full-prism.md |
| [5](#block-5) | workflows/prism/techniques/ | generate-report.md |
| [6](#block-6) | workflows/prism/techniques/ | orchestrate-prism.md |
| [7](#block-7) | workflows/work-package/activities/ | 01-start-work-package.toon |
| [8](#block-8) | workflows/work-package/activities/ | 12-submit-for-review.toon |
| [9](#block-9) | workflows/work-package/activities/ | README.md |
| [10](#block-10) | workflows/work-package/techniques/manage-git/ | detect-merge-strategy.md |
| [11](#block-11) | workflows/work-package/techniques/ | research-knowledge-base.md |
| [12](#block-12) | workflows/work-package/ | workflow.toon |
| [13](#block-13) | workflows/workflow-design/resources/ | anti-patterns.md |
| [14](#block-14) | workflows/workflow-design/techniques/ | workflow-design.md |

## Block Rationale

### Block 1

`docs/technique-protocol-specification.md` (3 hunks) — the normative half of the work package. Adds a new "Naming structure" subsection under §3.2 (after the existing case rule), a positive-rule-name paragraph under §3.4, and a summary bullet in §8 Authoring rules. The §3.2 addition states that an identifier's grammatical shape encodes its kind: a boolean is an affirmative predicate (the `is_`/`has_` prefix is value-gated, not mandatory), a collection is a plural item noun with no representation suffix, a key-addressed value is a singular mapping name, and an I/O id is a qualified noun phrase with the head noun last. The §3.4 addition declares a `<rule-name>` is a positive declarative assertion of the invariant it guards. All three sections cross-reference AP-60. The framing deliberately complements rather than competes with the existing case rule ("case settles which alphabet, structure settles which words and in what order").

### Block 2

`write-cicd-report.md` — rule slug rename `no-false-positives` → `confirmed-flow-only`. The rule body is unchanged; only the `### heading` slug is rewritten from a negation to the positive invariant it guards (observations need a confirmed source-to-sink flow). This is one of the 5 negation→positive rule-slug conversions sanctioned in implementation. No dotted-address citation of the old slug exists elsewhere, so the rename is self-contained.

### Block 3

`prism/activities/01-structural-pass.toon` (2 hunks) — defect fix for AP-59 (code-token integrity), not a new AP-60 rename. Two `{lens-name}` (kebab) designators inside the `portfolio-{...}.md` artifact-name templates are corrected to `{lens_name}` (snake), so the embedded symbol designator matches the snake variable the engine resolves. Without this, the slot would not bind. The surrounding artifact name and description are otherwise unchanged.

### Block 4

`prism/techniques/full-prism.md` — rule slug rename `no-context-leakage` → `isolated-context`. Body unchanged (worker runs in isolation). Negation→positive conversion.

### Block 5

`prism/techniques/generate-report.md` — rule slug rename `no-reassignment` → `severities-inherited`. Body unchanged (severities are inherited from the authoritative source). Negation→positive conversion.

### Block 6

`prism/techniques/orchestrate-prism.md` — rule slug rename `no-analysis` → `dispatch-only`. Body unchanged (the orchestrator dispatches, captures paths, presents results; it does not analyse). Negation→positive conversion.

### Block 7

`work-package/activities/01-start-work-package.toon` (2 hunks) — the boolean variable rename `squash_merge_available` → `squash_merge_supported`, applied at its definition site: the `detect-merge-strategy` step description, the `set` action `target`, and the `context_to_preserve` entry. `supported` reads as an affirmative predicate (the repo supports squash merges) per AP-60 sub-rule (1). This is the source-of-truth surface for the rename; downstream surfaces follow.

### Block 8

`work-package/activities/12-submit-for-review.toon` (3 hunks) — propagates the `squash_merge_supported` rename to its read sites: the `instruct-merge-strategy` step description, the `dco-sign-off` checkpoint message template (`Squash merge available: {squash_merge_supported}`), and the `merge-strategy-reminder` checkpoint condition variable. The user-facing label text "Squash merge available" is intentionally left as prose; only the `{...}` designator is renamed.

### Block 9

`work-package/activities/README.md` (2 hunks) — documentation propagation of the `squash_merge_supported` rename in two prose references (the `instruct-merge-strategy` step summary and the checkpoint table row for `merge-strategy-reminder`). No behavioural content; keeps the human-facing activity doc in sync with the TOON.

### Block 10

`work-package/techniques/manage-git/detect-merge-strategy.md` (2 hunks) — the technique that produces the boolean. Renames the `### squash_merge_available` output heading and the protocol step-4 `Set {squash_merge_available} = true` designator to `squash_merge_supported`. This is the output-declaration surface that the `01-start-work-package` step consumes.

### Block 11

`work-package/techniques/research-knowledge-base.md` — rule slug rename `no-narration` → `synthesize-directly`. Body unchanged (synthesize answers directly, do not narrate the search). Negation→positive conversion.

### Block 12

`work-package/workflow.toon` — the variable declaration in the `variables[89]` block: `squash_merge_available` → `squash_merge_supported`. The `type: boolean`, `defaultValue: false`, and description are unchanged. This is the schema-level declaration that the engine resolves all reads/writes against; renaming it here is what makes the rename coherent across all the TOON read/write sites in blocks 7–10.

### Block 13

`workflow-design/resources/anti-patterns.md` — adds AP-60, the new anti-pattern entry (the canonical naming-structure rule with four sub-rules: boolean/collection/I-O-id/rule-slug). This is the machine-readable enforcement spec mirrored by the §3.2/§3.4 prose in block 1. Note the AP-60 title line cites `squash_merge_available` as the *example of the defect* — this is a deliberate didactic citation of the pre-fix name, not an orphaned reference. The entry explicitly composes with AP-42/52/55/57/59 and names the §8 audit heuristic as its sole mechanical enforcement.

### Block 14

`workflow-design/techniques/workflow-design.md` (2 hunks) — wires AP-60 into the step-8 audit. Updates the anti-pattern count "59 entries" → "60 entries" and adds a "Naming structure (AP-60)" audit-heuristic bullet describing exactly what to flag for each of the four sub-rules and, critically, what NOT to flag (conformant unprefixed affirmative booleans, past-participle result flags, `_mode`/`_type` kind suffixes, irreplaceable-clarity negations). This is the only place the convention is mechanically enforced.

## Review Outcome

User completed side-by-side review and resolved the `file-index-table` checkpoint with **`rationale-confirmed` — no issues**. All 14 block-rationale paragraphs confirmed accurate (provenance attested); no blocks flagged. See [09-manual-diff-review.md](09-manual-diff-review.md).
