# Compliance Review: prism-update

**Date:** 2026-03-22
**Workflow:** prism-update v1.0.0
**Files audited:** 14 (1 workflow.toon, 7 activities, 5 skills, 1 README.md)

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 5 |
| Low      | 5 |
| Pass     | 18 |

The prism-update workflow is well-structured with clean TOON syntax, proper modular decomposition, and correct schema validation. The main gaps are missing subfolder documentation (Principle 14), absent `artifacts[]` declarations, and several text-only rules that lack structural enforcement. All schema validation passes cleanly.

---

## Schema Expressiveness Findings

### SE-1: Step-level variable assignment described as prose [Medium]

**Files:** `activities/00-discover-changes.toon`, `activities/05-verify.toon`

Two steps describe variable-setting logic as prose descriptions instead of using step `actions[]`:

- **discover-changes** step `determine-next-index`: *"Set next_index to highest existing resource index + 1."* — This is a `set` action (`{action: set, target: next_index}`).
- **verify** step `set-result`: *"Set has_issues based on findings."* — This is a `set` action (`{action: set, target: has_issues}`).

**Recommendation:** Add `actions: [{action: set, target: next_index}]` and `actions: [{action: set, target: has_issues}]` to these steps respectively.

### SE-2: No `artifacts[]` declarations [High]

**Files:** All activity files

The workflow produces concrete artifacts (git commits per change type, a feature branch, a PR) but none are formally declared using the `artifacts[]` field. The commit-and-submit activity produces a PR URL that should be tracked.

**Recommendation:** Add `artifacts[]` entries to:
- `import-resources`: 4 potential commit artifacts (sync, rename, import, delete)
- `update-routing`: 1 commit artifact
- `update-docs`: 1 commit artifact
- `commit-and-submit`: 1 PR artifact

### SE-3: Iteration in step descriptions without `loops` construct [Low]

**Files:** `activities/02-import-resources.toon`

Step descriptions use "for each" language (e.g., "Overwrite each modified resource," "Git mv each renamed resource," "Copy each new upstream prism"). The `loops` schema construct exists for expressing iteration.

**Mitigating factor:** The iteration is at the implementation level within steps, not at the workflow control-flow level. The skill protocol (`01-sync-resources.toon`) provides the detailed per-item procedure. Using `loops` at the activity level would add structural overhead without meaningful control-flow benefit here.

**Recommendation:** Accept as-is. The skill protocol adequately captures the iteration detail.

### SE-4: Checkpoint options without effects [Low]

**File:** `activities/01-review-changes.toon`

The `change-review` checkpoint's "confirm" and "adjust-exclusions" options have no `effect` declarations. Only "abort" has an effect (`transitionTo: workflow-end`).

**Mitigating factor:** The "confirm" option works by fallthrough — the default transition proceeds to `import-resources` regardless. The "adjust-exclusions" response is captured in checkpoint state and the step `apply-exclusions` handles it.

**Recommendation:** Consider adding `effect: {setVariable: {exclusions_adjusted: true}}` to the "adjust-exclusions" option so the `apply-exclusions` step can conditionally skip when not needed.

---

## Convention Conformance Findings

### CC-1: Missing subfolder READMEs [High]

**Convention:** Principle 14 requires README.md at the root and in each subfolder (activities/, skills/, resources/).

| Location | Status |
|----------|--------|
| `README.md` (root) | PASS |
| `activities/README.md` | **MISSING** |
| `skills/README.md` | **MISSING** |
| `resources/` folder | N/A (no resources) |

**Recommendation:** Create `activities/README.md` with an activity table (index, name, skill, checkpoints, transitions) and `skills/README.md` with a skill table (index, name, capability, inputs, outputs).

### CC-2: Missing `estimatedTime` on all activities [Medium]

**Files:** All 7 activity files

No activity declares `estimatedTime`. Other workflows (e.g., workflow-design) consistently provide time estimates for each activity.

**Recommendation:** Add `estimatedTime` to each activity. Suggested values:
- discover-changes: "3-5m"
- review-changes: "2-5m"
- import-resources: "5-10m"
- update-routing: "10-20m"
- update-docs: "5-10m"
- verify: "3-5m"
- commit-and-submit: "3-5m"

### CC-3: Missing `context_to_preserve` on all activities [Medium]

**Files:** All 7 activity files

No activity declares `context_to_preserve`. This field documents which state variables and context items should carry forward across activity transitions.

**Recommendation:** Add `context_to_preserve` to key activities:
- discover-changes: `["changes", "next_index", "exclusions"]`
- review-changes: `["changes", "exclusions"]`
- import-resources: `["changes", "next_index"]`
- verify: `["has_issues", "stale_references"]`

### CC-4: No explicit `activitiesDir` in workflow.toon [Low]

**File:** `workflow.toon`

The workflow.toon does not declare `activitiesDir: activities` explicitly. The server auto-discovers from the conventional directory, but making it explicit improves clarity.

**Recommendation:** Add `activitiesDir: activities` to workflow.toon.

### CC-5: `required` field not explicitly set on activities [Low]

**Files:** All 7 activity files

Activities rely on the schema default for `required` (implicitly true). Other workflows set this explicitly.

**Mitigating factor:** All activities in this workflow are required, and the schema default is correct. Explicit declaration is a convention preference.

**Recommendation:** Add `required: true` to each activity for consistency with other workflows.

---

## Rule Enforcement Findings

### RE-1: "WORKTREE SCOPE" — text-only enforcement [Medium]

**Rule:** *"All file operations happen in the workflows worktree (workflows/ directory). Never modify MCP server source (src/, schemas/)."*

No structural mechanism prevents an agent from writing outside the workflows directory. No `validate` entry action checks the current working directory.

**Recommendation:** Add a `validate` entry action on `import-resources`, `update-routing`, and `update-docs` to verify the working directory is within the workflows worktree. Example: `{action: validate, target: resource_path, message: "File operations must occur within the workflows worktree"}`.

### RE-2: "VERBATIM COPY" — text-only enforcement [Medium]

**Rule:** *"Upstream prism content is copied verbatim including YAML frontmatter. Do not modify lens prompt content during import."*

No verification step compares imported content against upstream originals. The verify activity checks for stale references and routing mismatches but does not validate content integrity.

**Recommendation:** Add a verification step to the `verify` activity that checksums imported resources against upstream sources, or add a `validate` action in `import-resources` that confirms byte-for-byte fidelity.

### RE-3: "RESOURCE NAMING" — text-only, partially mitigated [Low]

**Rule:** *"Resources use the convention {NN}-{hyphenated-name}.md where NN is a zero-padded index. Indices are permanent — never reuse a deleted index."*

The verify activity checks for duplicate indices but does not validate the full naming convention (zero-padded, hyphenated). The skill protocol in `sync-resources` prescribes the convention procedurally.

**Recommendation:** Accept as-is. The skill protocol and verify activity provide adequate coverage.

### RE-4: "ROUTING COVERAGE" — partially enforced [Low]

**Rule:** *"Skill routing updates must cover all affected surfaces: goal-mapping-matrix, code-vs-general, model-sensitivity, neutral-variant-routing, resource lists, lens catalogs, and selection guides."*

The `update-routing` activity has explicit steps per skill, and the `verify` activity checks for stale references. The `update-skill-routing` skill has a `coverage` rule listing all surfaces. However, no `validate` action confirms all surfaces were touched.

**Recommendation:** Accept as-is. The step-per-skill structure plus verification provides reasonable enforcement.

### RE-5: "SINGLE-AGENT EXECUTION" and "AUTOMATIC TRANSITIONS" — inherently text-based [Pass]

These rules govern the execution model and are appropriately expressed as text. The transition schema structure inherently enforces automatic transitions.

---

## Anti-Pattern Findings

### AP-1: Anti-pattern #12 — "This produces a report" (buried in description) [High]

**File:** `activities/06-commit-and-submit.toon`

Step `create-pr` produces a PR (an artifact) that is only described in the step description. No `artifacts[]` field is used. Cross-referenced with SE-2 above.

### AP-2: Anti-pattern #10 — Iteration as prose [Low]

**File:** `activities/02-import-resources.toon`

Step descriptions use "for each" language. Cross-referenced with SE-3 above. Mitigated by skill protocol detail.

### AP-3: Anti-pattern #19 — Critical rules as text only [Medium]

**Files:** `workflow.toon` rules 1, 3

The WORKTREE SCOPE and VERBATIM COPY rules are critical constraints that rely solely on text. Cross-referenced with RE-1 and RE-2 above.

No other anti-patterns matched (20/23 passed, 3 N/A for design review context).

---

## Schema Validation Results

| File | Status |
|------|--------|
| `workflow.toon` | PASS |
| `activities/00-discover-changes.toon` | PASS |
| `activities/01-review-changes.toon` | PASS |
| `activities/02-import-resources.toon` | PASS |
| `activities/03-update-routing.toon` | PASS |
| `activities/04-update-docs.toon` | PASS |
| `activities/05-verify.toon` | PASS |
| `activities/06-commit-and-submit.toon` | PASS |
| `skills/00-diff-upstream.toon` | PASS |
| `skills/01-sync-resources.toon` | PASS |
| `skills/02-update-skill-routing.toon` | PASS |
| `skills/03-update-prism-docs.toon` | PASS |
| `skills/04-verify-prism-consistency.toon` | PASS |

**Result: 13/13 PASS** — All TOON files are valid against their respective schemas.

---

## Recommended Fixes

### Priority 1 — High Severity

| # | Finding | Fix |
|---|---------|-----|
| 1 | CC-1: Missing subfolder READMEs | Create `activities/README.md` and `skills/README.md` with tables documenting contents |
| 2 | SE-2/AP-1: No artifacts declarations | Add `artifacts[]` to import-resources, update-routing, update-docs, commit-and-submit |

### Priority 2 — Medium Severity

| # | Finding | Fix |
|---|---------|-----|
| 3 | SE-1: Variable assignment as prose | Add step `actions[]` to discover-changes:determine-next-index and verify:set-result |
| 4 | RE-1/AP-3: WORKTREE SCOPE text-only | Add `validate` entry actions to file-modifying activities |
| 5 | RE-2/AP-3: VERBATIM COPY text-only | Add content integrity check to verify activity |
| 6 | CC-2: Missing estimatedTime | Add time estimates to all 7 activities |
| 7 | CC-3: Missing context_to_preserve | Add context preservation declarations to key activities |

### Priority 3 — Low Severity

| # | Finding | Fix |
|---|---------|-----|
| 8 | SE-3/AP-2: Iteration as prose | Accept as-is (mitigated by skill protocol) |
| 9 | SE-4: Checkpoint options without effects | Optional: add effects to change-review confirm/adjust options |
| 10 | CC-4: No explicit activitiesDir | Add `activitiesDir: activities` to workflow.toon |
| 11 | CC-5: Implicit required on activities | Add `required: true` to all activities |
| 12 | RE-3: RESOURCE NAMING text-only | Accept as-is (mitigated by skill protocol + verify) |
