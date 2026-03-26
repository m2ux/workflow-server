# Compliance Review: work-package

**Date:** 2026-03-26
**Workflow:** work-package v3.4.0
**Files audited:** 72
**Audit passes:** 5 (Schema Expressiveness, Convention Conformance, Rule-to-Structure, Anti-Pattern Scan, Schema Validation)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 4 |
| High     | 5 |
| Medium   | 7 |
| Low      | 3 |
| **Total findings** | **19** |
| Pass (schema validation) | 68/72 |

The work-package workflow is structurally mature with well-defined activities, comprehensive variable declarations, and good use of formal schema constructs (loops, decisions, transitions, conditions, checkpoints). The primary areas of concern are:

1. **Documentation drift** — The activities/README.md is significantly out of sync with the TOON source files (checkpoint counts, IDs, required flags, variable defaults)
2. **Skill schema violations** — 4 skill files have malformed `tools` definitions with bare string values
3. **Text-only critical rules** — The orchestrator/worker execution model rules (3 rules) lack any structural enforcement
4. **Combined checkpoint** — The design-philosophy activity combines classification and path selection into a single 5-option checkpoint

---

## Pass 1: Schema Expressiveness Findings

### SE-1: Conditional logic in step descriptions (Medium)

**Files:** `07-assumptions-review.toon` (step `evaluate-open-assumptions`), `14-codebase-comprehension.toon` (step `revise-initial-questions`)

Both steps encode if/else conditional variable assignment logic in their `description` field:

```
"If zero open assumptions remain, set has_open_assumptions to false...
If open assumptions exist, set has_open_assumptions to true."
```

**Recommendation:** Express this as step-level `actions` with conditions, or as a `decision` construct. The `set` action type exists for variable assignment but currently lacks conditional semantics at the action level.

### SE-2: Full protocol embedded in step description (Medium)

**File:** `01-start-work-package.toon`, step `activate-issue`

The step description is 6 sentences long and encodes a complete multi-step protocol (detect platform → get user ID → set assignee → find transition → execute transition → handle already-done). This procedural content belongs in a skill `protocol`, not in a step description.

**Recommendation:** Create a dedicated skill for issue activation or extend the `create-issue` skill protocol with an `activate-issue` phase.

### SE-3: Combined checkpoint violates atomicity (High)

**File:** `02-design-philosophy.toon`, checkpoint `classification-and-path`

This single checkpoint combines two distinct decisions into one 5-option selection:
1. Problem classification confirmation (revise vs. accept)
2. Workflow path selection (full, elicit-only, research-only, skip)

Design Principle #3 requires each checkpoint to be atomic. The activities/README.md documents these as 4+ separate checkpoints (problem-classified, workflow-path, design-philosophy-doc, assumptions-review), but the TOON only defines 1. The README is aspirational; the TOON is the source of truth.

**Recommendation:** Split into 2 checkpoints: `classification-confirmed` (confirm/revise classification) and `workflow-path-selected` (select path). Consider also adding `design-philosophy-doc` and `assumptions-review` checkpoints as the README implies.

---

## Pass 2: Convention Conformance Findings

### CC-1: Activity numbering discontinuity (Medium)

Activity 14 (`codebase-comprehension`) executes between activities 02 and 03 in the workflow flow, but its file is named `14-codebase-comprehension.toon`. This breaks the convention that file number order matches execution order. The activity was added after the initial 13-activity design to avoid renumbering all subsequent files.

**Impact:** Confusing for new readers — execution order (02 → 14 → 03) does not match file sort order.

**Recommendation:** Accept as-is (renumbering would be disruptive) but document the exception clearly in the activities README.

### CC-2: Resource ID collision (Low)

**File:** `resources/README.md`

Resources 01 and 02 are both named `readme` in the resource index table. They should have distinct identifiers.

**Recommendation:** Rename resource 02 to `readme-v2` or `planning-readme-template` to avoid ambiguity.

### CC-3: modeOverrides placement inconsistency (Low)

Some activities place `modeOverrides` near the top of the file (01, 02, 05, 09, 10, 11, 12, 13) while activity 07 places it at the bottom (after transitions and exitActions). This is a minor ordering inconsistency.

**Recommendation:** Standardize modeOverrides placement — conventionally after `rules` and before `steps` (matching activities 01 and 02).

---

## Pass 3: Rule Enforcement Findings

### RE-1: AUTOMATIC TRANSITION RULE — text-only (High)

**Rule:** "The orchestrator MUST advance between activities automatically without asking the user."

**Violation scenario:** An agent can simply pause between activities and ask "Shall I proceed?" — no structural mechanism prevents this.

**Current enforcement:** None.

**Recommendation:** This is inherently difficult to enforce structurally. However, adding a `validate` entry action at the orchestrator level or documenting it in the orchestration skill's `rules` with a `validate` action pattern would strengthen enforcement.

### RE-2: EXECUTION MODEL / ORCHESTRATOR DISCIPLINE — text-only (High)

**Rules:** "This workflow uses an orchestrator/worker pattern" and "The orchestrator MUST NOT execute activity steps."

**Violation scenario:** An agent can execute steps directly without spawning a worker sub-agent. This is the most common violation pattern.

**Current enforcement:** None. These rules are purely textual.

**Recommendation:** These are architectural constraints that are difficult to enforce via schema constructs. The rules are well-documented but rely entirely on agent compliance.

### RE-3: PREREQUISITE (read AGENTS.md) — text-only (Medium)

**Rule:** "Agents MUST read and follow AGENTS.md before starting any work."

**Current enforcement:** None.

**Recommendation:** Add a `validate` entry action on the `start-work-package` activity: `{ action: "validate", target: "agents_md_read", message: "Agent must read AGENTS.md before starting" }`.

### RE-4: README PROGRESS RULE — weak enforcement (Medium)

**Rule:** "After each completed activity, the orchestrator MUST update the planning folder README.md."

**Current enforcement:** `exitActions` with `message` type on each activity. Messages are informational only — they don't prevent the agent from proceeding without updating.

**Recommendation:** Change `message` exit actions to `validate` actions that check for README changes, or accept the current message-based reminder pattern as sufficient.

### RE-5: CHECKPOINT YIELD RULE — partially enforced (Medium)

**Rule:** "When a checkpoint message references generated content... the worker MUST include that content in the 'context' field of the checkpoint_pending yield."

**Current enforcement:** Several checkpoint messages explicitly instruct "Present the full assumptions table as a message to the user BEFORE showing this question." But there's no structural mechanism that forces the worker to include context.

**Recommendation:** Consider adding a `requiresContext` field to checkpoint schema to flag checkpoints that need generated content.

### RE-6: SYMBOL VERIFICATION — text-only (Low)

**Rule (activity 08):** "Every symbol introduced or referenced in code or documentation MUST have provenance."

**Current enforcement:** Step `self-review` in the task-cycle loop references resource 14 (task-completion-review) for verification. The rule is reinforced by process but not structurally gated.

**Recommendation:** Accept as-is — this is a runtime validation concern better handled by the skill protocol.

---

## Pass 4: Anti-Pattern Findings

### AP-5: Combined checkpoint (High)

**Anti-pattern:** #5 "Skip/combine these checkpoints"

**Location:** `02-design-philosophy.toon`, checkpoint `classification-and-path`

The checkpoint combines classification confirmation and workflow path selection into a single 5-option question. This violates the "one question at a time" principle and anti-pattern #5.

**Recommendation:** Split into separate checkpoints (see SE-3 above).

### AP-9/AP-11: Prose conditional logic (Medium)

**Anti-patterns:** #9 "Ask the user whether to proceed" (as prose), #11 "If X then do A, otherwise B" (as prose)

**Locations:** Steps in activities 07 and 14 that describe conditional variable-setting logic in prose (see SE-1 above).

**Recommendation:** Express as formal `actions` with conditions where the schema supports it.

---

## Pass 5: Schema Validation Results

### Automated validator results (npx tsx scripts/validate-workflow-toon.ts)

| File | Result | Details |
|------|--------|---------|
| `workflow.toon` | ✅ Pass | |
| `activities/01-start-work-package.toon` | ✅ Pass | |
| `activities/02-design-philosophy.toon` | ✅ Pass | |
| `activities/03-requirements-elicitation.toon` | ✅ Pass | |
| `activities/04-research.toon` | ✅ Pass | |
| `activities/05-implementation-analysis.toon` | ✅ Pass | |
| `activities/06-plan-prepare.toon` | ✅ Pass | |
| `activities/07-assumptions-review.toon` | ✅ Pass | |
| `activities/08-implement.toon` | ✅ Pass | |
| `activities/09-post-impl-review.toon` | ✅ Pass | |
| `activities/10-validate.toon` | ✅ Pass | |
| `activities/11-strategic-review.toon` | ✅ Pass | |
| `activities/12-submit-for-review.toon` | ✅ Pass | |
| `activities/13-complete.toon` | ✅ Pass | |
| `activities/14-codebase-comprehension.toon` | ✅ Pass | |
| **skills/00-review-code.toon** | ❌ Fail | `tools.usage`: Expected object, received string |
| **skills/01-review-test-suite.toon** | ❌ Fail | `tools.usage`: Expected object, received string |
| `skills/02-respond-to-pr-review.toon` | ✅ Pass | |
| **skills/03-create-issue.toon** | ❌ Fail | `tools.next`: Expected object, received string |
| `skills/04-classify-problem.toon` | ✅ Pass | |
| `skills/05-elicit-requirements.toon` | ✅ Pass | |
| `skills/06-research-knowledge-base.toon` | ✅ Pass | |
| `skills/07-analyze-implementation.toon` | ✅ Pass | |
| `skills/08-create-plan.toon` | ✅ Pass | |
| `skills/09-create-test-plan.toon` | ✅ Pass | |
| `skills/10-implement-task.toon` | ✅ Pass | |
| `skills/11-review-diff.toon` | ✅ Pass | |
| `skills/12-review-strategy.toon` | ✅ Pass | |
| `skills/13-review-assumptions.toon` | ✅ Pass | |
| `skills/14-manage-artifacts.toon` | ✅ Pass | |
| **skills/15-manage-git.toon** | ❌ Fail | `tools.next`: Expected object, received string |
| `skills/16-validate-build.toon` | ✅ Pass | |
| `skills/17-finalize-documentation.toon` | ✅ Pass | |
| `skills/18-update-pr.toon` | ✅ Pass | |
| `skills/19-conduct-retrospective.toon` | ✅ Pass | |
| `skills/20-summarize-architecture.toon` | ✅ Pass | |
| `skills/21-create-adr.toon` | ✅ Pass | |
| `skills/22-build-comprehension.toon` | ✅ Pass | |
| `skills/23-reconcile-assumptions.toon` | ✅ Pass | |

**Summary:** 68/72 files pass. 4 skill files fail due to malformed `tools` definitions.

### SV-1: Bare string values under `tools` map (Critical)

**Files:** `00-review-code.toon`, `01-review-test-suite.toon`, `03-create-issue.toon`, `15-manage-git.toon`

The `tools` field in the skill schema is a map where keys are tool names and values must be `toolDefinition` objects. These 4 skills have bare string values assigned to keys like `usage` and `next` directly under `tools`:

```
tools:
    usage: Reference for review criteria    # <-- string, should be object
  read_file:
    when: Reviewing each changed file       # <-- correct (object)
```

**Fix:** Move the bare `usage` and `next` strings into a proper tool definition object, or remove them if they're orphaned fragments.

### SV-2: Schema-vs-runtime field discrepancy (Medium)

**Observation:** Several fields used in activity TOON files are not defined in the on-disk JSON schemas but pass the validator:

| Field | Used in | Schema status |
|-------|---------|---------------|
| `defaultOption` | Checkpoints in activities 03, 04, 05, 06, 07, 08, 09, 11, 14 | Not in `checkpoint` properties |
| `autoAdvanceMs` | Same checkpoints | Not in `checkpoint` properties |
| `skipCheckpoints` | Activity 07 modeOverrides | Not in modeOverrides properties |

The validator passes these files, indicating the runtime schema or the TOON parser accepts these fields. The on-disk JSON schema definitions may be outdated relative to the actual runtime implementation.

**Recommendation:** Update `activity.schema.json` to formally define `defaultOption`, `autoAdvanceMs` on checkpoints and `skipCheckpoints` on modeOverrides.

---

## Documentation Drift Findings

### DD-1: Activities README checkpoint mismatches (Critical)

The `activities/README.md` documents checkpoint counts and IDs that significantly diverge from the TOON source files:

| Activity | README claims | TOON actual | Discrepancy |
|----------|--------------|-------------|-------------|
| 02 design-philosophy | 5 checkpoints: problem-classified, workflow-path, design-philosophy-doc, assumptions-review | 1 checkpoint: classification-and-path | README fabricates 4 checkpoints |
| 04 research | 4 checkpoints: kb-insights, web-research-confirmed, assumptions-review, research-complete | 2 checkpoints: research-findings, research-assumptions-review | Count and names differ |
| 05 impl-analysis | 2 checkpoints: analysis-confirmed, assumptions-review | 2 checkpoints: analysis-confirmed, analysis-assumptions-review | Name mismatch on second |
| 06 plan-prepare | 3 checkpoints: approach-confirmed, assumptions-review, assumptions-log-final | 2 checkpoints: approach-confirmed, assumptions-log-final | README adds non-existent checkpoint |
| 09 post-impl-review | 5 checkpoints: file-index-table, block-interview, code-review, test-quality, architecture-summary | 3 checkpoints: file-index-table, block-interview, review-findings | Count and names differ |
| 13 complete | 1 checkpoint: retrospective-review | 0 checkpoints | README fabricates a checkpoint |
| 14 codebase-comprehension | 3 checkpoints: existing-artifacts-review, architecture-confirmed, comprehension-sufficient | 2 checkpoints: architecture-confirmed, comprehension-sufficient | Extra checkpoint in README |

**Root cause:** The README appears to have been authored to reflect an earlier or planned design that was later simplified in the TOON files, but the README was never updated to match.

**Recommendation:** Regenerate the activities README checkpoint tables directly from the TOON source files.

### DD-2: Variable default value inconsistency (Critical)

**Workflow variable `needs_comprehension`:**
- `workflow.toon` declares `defaultValue: true`
- README Variables section says `(default: false)`

This contradicts the runtime behavior — comprehension is mandatory after design-philosophy, so `true` (the TOON value) is correct.

### DD-3: Required flag inconsistencies (Critical)

| Activity | TOON `required` | README table |
|----------|-----------------|-------------|
| 05 implementation-analysis | `false` | "yes" |
| 14 codebase-comprehension | `false` | "yes" |

The TOON values are correct per the flow logic: `implementation-analysis` is skipped when `skip_optional_activities == true`, and `codebase-comprehension` could theoretically be bypassed (though in practice it always runs after design-philosophy).

### DD-4: Skills list drift in README (Low)

The activities README skills tables for design-philosophy list only `review-assumptions` as supporting, but the TOON file adds `reconcile-assumptions`. Similarly, the codebase-comprehension README skills table may be outdated.

---

## Recommended Fixes (prioritized)

### Critical

1. **Fix 4 skill schema violations** (SV-1) — Remove or restructure bare string values under `tools` in skills 00, 01, 03, 15

2. **Regenerate activities/README.md** (DD-1) — Rebuild checkpoint tables, skills tables, and all per-activity documentation from TOON source files

3. **Fix variable default in README** (DD-2) — Update `needs_comprehension` documentation to show `default: true`

4. **Fix required flags in README** (DD-3) — Update implementation-analysis and codebase-comprehension to show correct `required: false`

### High

5. **Split classification-and-path checkpoint** (SE-3, AP-5) — Break the 5-option combined checkpoint in design-philosophy into 2+ atomic checkpoints

6. **Update on-disk schemas** (SV-2) — Add `defaultOption`, `autoAdvanceMs` to checkpoint schema; add `skipCheckpoints` to modeOverrides schema. This is a schema maintenance task, not a workflow content fix.

### Medium

7. **Extract activate-issue protocol** (SE-2) — Move the inline protocol from step description to a skill protocol section

8. **Express conditional logic formally** (SE-1) — Convert prose if/else in steps to formal `actions` or `decision` constructs where schema supports it

9. **Standardize modeOverrides placement** (CC-3) — Move activity 07's modeOverrides to the conventional position

10. **Add validate action for AGENTS.md** (RE-3) — Add entry action to start-work-package

### Low

11. **Resolve resource ID collision** (CC-2) — Rename resource 02 to avoid duplicate `readme` ID

12. **Document activity 14 numbering exception** (CC-1) — Add a note in activities README

13. **Update skills README** (DD-4) — Sync supporting skill lists with TOON definitions
