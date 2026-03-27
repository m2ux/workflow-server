# Compliance Review: prism-evaluate

**Date:** 2026-03-20
**Workflow:** prism-evaluate v1.0.0
**Files audited:** 10

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 3 |
| Low      | 1 |
| Pass     | Many |

The workflow is structurally sound with correct use of most schema constructs (steps, checkpoints, loops, transitions, triggers, artifacts, variables, rules). Two high-severity findings: missing README documentation files required by workflow-design governance, and an action schema gap affecting validate actions across all workflows. Three medium findings relate to text-only rule enforcement and MCP server caching. One low finding for description duplication after resource extraction.

---

## Schema Expressiveness Findings

### Pass: Correct Use of Formal Constructs

All structured workflow information uses the appropriate schema construct:

| Construct | Usage | Files |
|-----------|-------|-------|
| steps[] | 25 steps across 5 activities | All activity files |
| checkpoints[] | 2 blocking checkpoints with options/effects | scope-definition, dimension-planning |
| loops[] | 1 forEach loop with variable, over, maxIterations | execute-analysis |
| transitions[] | 5 transitions (4 with isDefault, 2 with conditions) | All activity files except deliver-results |
| triggers | 1 workflow trigger with passContext | execute-analysis |
| entryActions[] | 1 validate action | execute-analysis |
| artifacts[] | 2 artifacts with id, name, location | dimension-planning, consolidate-report |
| variables[] | 17 workflow variables with type, description | workflow.toon |
| rules[] | 9 workflow rules + 14 activity rules | workflow.toon + 4 activity files |
| outcome[] | 8 outcome strings | All activity files |
| protocol | 6 step-keyed protocol sections | Both skill files |
| inputs[] | 4+4 skill inputs | Both skill files |
| output[] | 2+1 skill outputs | Both skill files |
| tools | 6+3 tool definitions | Both skill files |
| errors | 3+3 error definitions | Both skill files |
| resources[] | 2 resource indices | plan-evaluation skill |

### Finding EXP-01 (LOW): Step descriptions duplicate resource content

After fix 8 extracted dimension defaults and lens mappings into resources, the `derive-dimensions` step in scope-definition still embeds the default dimension sets as prose ("For proposal/strategy documents: Consistency, Veracity, Plausibility, Feasibility..."). The `map-dimensions` step in dimension-planning embeds mapping summary prose. These are legitimate step descriptions providing worker guidance, but they duplicate the extracted resources. Recommendation: simplify step descriptions to reference resources rather than restating their content.

---

## Convention Conformance Findings

| Convention | Status | Notes |
|------------|--------|-------|
| File naming (`NN-name.toon`) | PASS | All 7 TOON files follow convention |
| Folder structure | PASS | `activities/`, `skills/`, `resources/` present |
| Version format (`X.Y.Z`) | PASS | All files use `1.0.0` |
| Field ordering | PASS | id, version, name/title, description ordering consistent |
| Transition patterns | PASS | `initialActivity: scope-definition`, linear transitions with conditions |
| Checkpoint structure | PASS | Both checkpoints have id, name, message, options with setVariable/transitionTo effects |
| Skill structure | PASS | Both skills have id, version, capability, protocol, inputs, output |
| Modular content | PASS | No inline activities in workflow.toon |
| README documentation | **FAIL** | See finding CON-01 |

### Finding CON-01 (HIGH): Missing README files

The workflow-design workflow rule #14 states: "Every workflow must include a README.md at the root and in each subfolder (activities/, skills/, resources/). Root README documents the workflow overview, modes, activity sequence, variables, and file structure. Subfolder READMEs document the contents of that folder with tables and protocol details."

prism-evaluate has **no README files** — not at the root nor in any subfolder. This violates a mandatory governance convention.

**Recommended fix:** Create 4 README files:
- `workflows/prism-evaluate/README.md` — workflow overview, activity sequence, variables, file structure
- `workflows/prism-evaluate/activities/README.md` — activity table with names, purposes, checkpoints
- `workflows/prism-evaluate/skills/README.md` — skill table with capabilities, protocol summaries
- `workflows/prism-evaluate/resources/README.md` — resource table with descriptions

---

## Rule Enforcement Findings

### Workflow-Level Rules

| Rule | Violable? | Structural Enforcement | Status |
|------|-----------|----------------------|--------|
| EXECUTION MODEL | Yes | None | TEXT-ONLY |
| ORCHESTRATOR DISCIPLINE | Yes | None | TEXT-ONLY |
| TRIGGER ISOLATION | Yes | Partial — validate action in execute-analysis checks `analysis_focus != "security audit"` | PARTIAL |
| AUTOMATIC TRANSITIONS | Yes | None | TEXT-ONLY |
| DIMENSION PLANNING | No (descriptive) | N/A | GUIDANCE |
| MULTI-GROUP SUPPORT | No (descriptive) | N/A | GUIDANCE |
| WORKER PERMISSIONS | Yes | None | TEXT-ONLY |
| ARTIFACT VERIFICATION | Yes | None | TEXT-ONLY |
| TARGET GENERALITY | No (descriptive) | N/A | GUIDANCE |

### Activity-Level Rules

| Activity | Rule | Violable? | Structural Enforcement | Status |
|----------|------|-----------|----------------------|--------|
| dimension-planning | EVIDENCE-BASED FOCUS | Yes | None | TEXT-ONLY |
| dimension-planning | TRIGGER ISOLATION | Yes | Partial (validate in execute-analysis) | PARTIAL |
| dimension-planning | LENS OVERRIDE RESPECT | Yes | None | TEXT-ONLY |
| execute-analysis | TRIGGER ISOLATION | Yes | Partial (validate) | PARTIAL |
| execute-analysis | PIPELINE MODE FIDELITY | Yes | None | TEXT-ONLY |
| execute-analysis | SEQUENTIAL EXECUTION | Yes | None | TEXT-ONLY |
| execute-analysis | TARGET TYPE MAPPING | Yes | None | TEXT-ONLY |
| consolidate-report | METHODOLOGY STRIPPING | Yes | None | TEXT-ONLY |
| consolidate-report | FINDING ID CONVENTION | Yes | None | TEXT-ONLY |
| consolidate-report | SEVERITY RUBRIC | Yes | None | TEXT-ONLY |
| consolidate-report | STANDALONE REPORT | Yes | None | TEXT-ONLY |

### Finding ENF-01 (MEDIUM): Most rules lack structural enforcement

15 of 23 rules (excluding 3 guidance-only) are text-only. While many of these are behavioral constraints that are difficult to enforce structurally (e.g., METHODOLOGY STRIPPING requires content analysis, EVIDENCE-BASED FOCUS requires judgment), some could be partially reinforced:

- **TRIGGER ISOLATION** already has partial enforcement via the validate entryAction. Consider adding validate actions for additional prohibited strings ("security review", "audit").
- **SEQUENTIAL EXECUTION** could be reinforced by the loop construct's `maxIterations: 10` (already present) and the forEach type (which is inherently sequential).

However, many rules (ORCHESTRATOR DISCIPLINE, METHODOLOGY STRIPPING, STANDALONE REPORT) describe agent behavior that cannot be encoded as structural constraints. These are appropriately text-only. Marking as MEDIUM rather than HIGH because the constraints are fundamentally behavioral.

---

## Anti-Pattern Findings

| # | Anti-Pattern | Found? | Details |
|---|---|---|---|
| 1 | Inline content | No | All content modular |
| 2 | Schema modification | No | — |
| 3 | Partial implementation | No | All activities complete |
| 4 | New naming conventions | No | Follows established patterns |
| 5 | Skip/combine checkpoints | No | Each checkpoint atomic |
| 9 | Prose checkpoint | No | Both use formal checkpoint construct |
| 10 | Prose loop | No | Uses forEach construct |
| 11 | Prose conditional | Partial | TARGET TYPE MAPPING rule encodes a value mapping as prose, but no schema construct exists for value mapping tables |
| 12 | Buried artifact | No | All artifacts in artifacts[] |
| 13 | Implied variable | No | All variables declared |
| 15 | Protocol as prose | No | Skills use protocol construct |
| 16 | Input as description | No | Skills use inputs[] |
| 19 | Critical rule without enforcement | Yes | See Rule Enforcement Findings |

### Finding AP-01 (MEDIUM): Anti-pattern #19 — Critical rules without structural enforcement

The TRIGGER ISOLATION rule is the most critical constraint in the workflow (prevents accidental activation of prism's audit-finalize activity). It has partial enforcement via a validate entryAction, but the validation only checks for the literal string "security audit" — it does not check for "security review", "audit" as a primary descriptor, or other prohibited patterns listed in the rule text. The structural enforcement covers only one of the documented violation patterns.

---

## Schema Validation Results

### Finding VAL-01 (HIGH): Action schema gap — validate actions use `condition` field not defined in schema

The action schema (`activity.schema.json`) defines four properties with `additionalProperties: false`:

```json
{ "action", "target", "message", "value" }
```

However, validate actions in execute-analysis use a `condition` field:

```
entryActions[1]:
  - action: validate
    message: "Verify execution_groups is non-empty..."
    condition:
      type: simple
      variable: execution_groups
      operator: exists
```

The `condition` field is not in the action schema. The MCP server's TOON parser strips it, returning `{"action": "validate"}` with no condition — rendering the validate action meaningless in the parsed output.

**This is a systemic schema gap** affecting all workflows that use validate actions with conditions (including prism-audit). The action schema needs a `condition` property added, or validate actions need a different expression mechanism.

**Scope:** This is not a prism-evaluate defect — it's a schema defect. Flagged here for visibility.

### File-Level Validation

| File | Status | Notes |
|------|--------|-------|
| workflow.toon | PASS | All required fields present, valid structure |
| 00-scope-definition.toon | PASS* | Action `target`/`message` fields stripped by server |
| 01-dimension-planning.toon | PASS* | Action `target`/`message` fields stripped by server |
| 02-execute-analysis.toon | PASS* | Validate action `condition` stripped by server (VAL-01) |
| 03-consolidate-report.toon | PASS* | Action `target`/`message` fields stripped by server |
| 04-deliver-results.toon | PASS | No actions |
| 00-plan-evaluation.toon | PASS | Valid skill structure |
| 01-compose-evaluation-report.toon | PASS | Valid skill structure |

*PASS with caveats: Action fields beyond `action` are stripped by the server's TOON parser, likely due to `additionalProperties: false` on the action schema. The TOON files contain `target` and `message` fields (post-fix) which align with the schema's property definitions, but the server does not pass them through.

---

## Recommended Fixes

### High Priority

1. **Create README files** (CON-01) — Create `README.md` at the workflow root and in `activities/`, `skills/`, `resources/` subfolders. Follow the prism workflow's README style as referenced in the workflow-design governance rules.

2. **Raise action schema gap** (VAL-01) — The action schema needs `condition` added as a property for validate actions. This is a `schemas/activity.schema.json` change, not a prism-evaluate change. Until fixed, validate actions with conditions will be stripped by the TOON parser.

### Medium Priority

3. **Strengthen TRIGGER ISOLATION enforcement** (ENF-01, AP-01) — Add additional validate entryActions to execute-analysis checking for "security review" and bare "audit" in analysis_focus, matching all prohibited patterns documented in the rule text.

4. **Simplify step descriptions that duplicate resources** (EXP-01) — After resource extraction (fix 8), update `derive-dimensions` and `map-dimensions` step descriptions to reference resource indices rather than restating their content.

### Low Priority

5. **Investigate MCP server caching** — The server returns stale TOON data after on-disk edits. This may require a server restart or indicates the server reads from a different source than the workflows worktree.
