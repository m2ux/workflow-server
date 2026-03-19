# Meta Workflow Compliance Review

**Workflow:** meta v2.0.0
**Date:** 2026-03-19
**Reviewer:** workflow-design review mode
**Scope:** Full compliance audit against 13 design principles + anti-pattern scan + schema validation + prose-to-skills/resources migration assessment

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 7 |
| Medium | 5 |
| Low | 4 |
| **Total** | **19** |

| Check | Result |
|-------|--------|
| Schema Validation | 16/18 files pass (2 skill files fail) |
| Design Principles | 5 of 13 principles have findings |
| Anti-Patterns | 5 of 23 anti-patterns detected |
| Prose Migration Opportunities | 8 identified |

---

## 1. Schema Validation Results

### Passing (16/18)

| File | Result |
|------|--------|
| workflow.toon | ✅ Pass |
| activities/01-start-workflow.toon | ✅ Pass |
| activities/02-resume-workflow.toon | ✅ Pass |
| activities/03-end-workflow.toon | ✅ Pass |
| skills/00-activity-resolution.toon | ✅ Pass |
| skills/03-artifact-management.toon | ✅ Pass |
| skills/04-orchestrate-workflow.toon | ✅ Pass |
| skills/05-execute-activity.toon | ✅ Pass |
| skills/06-knowledge-base-search.toon | ✅ Pass |
| skills/07-atlassian-operations.toon | ✅ Pass |
| skills/08-gitnexus-operations.toon | ✅ Pass |

### Failing (2/18)

| File | Error | Severity |
|------|-------|----------|
| skills/01-workflow-execution.toon | `state`: Expected object, received string | **Critical** |
| skills/02-state-management.toon | Parse error: Expected 1 inline array item, got 3 | **Critical** |

**SV-1 (Critical): `skills/01-workflow-execution.toon` line 72**
The `state` field is a string (`"Structure defined in state.schema.json..."`) but the skill schema expects an object. The prose description should be restructured into the object format the schema expects, or moved to `description`.

**SV-2 (Critical): `skills/02-state-management.toon`**
TOON parser error on inline array count mismatch. The `examples` field under `format` uses inline values that the parser interprets differently than intended. Needs TOON syntax correction.

---

## 2. Design Principle Compliance

### Principle 4: Maximize Schema Expressiveness — PARTIAL COMPLIANCE

**F-1 (Critical): Missing workflow-level variable declarations**
Activities use 11+ variables in checkpoint effects, decision conditions, and transitions, but `workflow.toon` declares zero variables. Variables used but undeclared:

| Variable | Used In | Context |
|----------|---------|---------|
| `is_monorepo` | start-workflow | checkpoint effect, step condition |
| `target_path` | start-workflow | checkpoint effect |
| `entry_point_confirmed` | resume-workflow | checkpoint effect |
| `ready_to_resume` | resume-workflow | checkpoint effect, transition condition |
| `restart_workflow` | resume-workflow | checkpoint effect, transition condition |
| `has_external_state` | resume-workflow, end-workflow | decision condition |
| `branch_behind_main` | resume-workflow | decision condition |
| `has_conflicts` | resume-workflow | decision condition |
| `abort_completion` | end-workflow | checkpoint effect |
| `has_outcome_gaps` | end-workflow | checkpoint effect |
| `workflow_completed` | end-workflow | checkpoint effect |

**Recommendation:** Declare all 11 variables in `workflow.toon` with types, descriptions, and default values.

**F-2 (High): Procedural prose in step descriptions where constructs exist**
Multiple step descriptions contain if/then logic that could be expressed via step conditions, decisions, or skill references:

| Activity | Step | Prose Pattern | Suggested Construct |
|----------|------|---------------|---------------------|
| start-workflow | select-workflow | "If workflow not specified, call list_workflows" | Step condition on workflow_id existence |
| start-workflow | discover-target | "If it exists, present the repo-type checkpoint. If not, set target_path" | Decision construct |
| start-workflow | prepare-checkpoints | "If activity has checkpoints, prepare to present" | Generic — remove or move to skill protocol |
| start-workflow | load-start-resource | "Call get_resource for index 00 if available" | Step condition on resource availability |

**F-3 (High): Missing artifact declarations**
No activity declares `artifacts[]` despite producing outputs. The schema provides `artifacts[].id`, `.name`, `.location`, `.description`, `.action` specifically for this purpose.

**F-4 (Medium): Checkpoint prerequisite as prose**
`start-workflow` checkpoint `submodule-selection` has `prerequisite: "Only present when is_monorepo is true"` as a prose string. This should be a formal condition:

```
condition:
  type: simple
  variable: is_monorepo
  operator: ==
  value: true
```

**F-5 (Medium): context_to_preserve as prose instead of variables**
All three activities define `context_to_preserve` with 7-8 items each — these are essentially variable declarations written as prose strings. They should be formalized as workflow-level variables.

### Principle 5: Convention Over Invention — PARTIAL COMPLIANCE

**F-6 (Medium): Resource numbering gap**
Resources start at index 02. Indices 00 and 01 are unused. Other workflows (workflow-design, work-package) use 00 as the first resource. The start-workflow activity is the only activity without a companion resource.

**Recommendation:** Create resource 00 (start-workflow reference) and optionally 01 (workflow-discovery-protocol).

### Principle 9: Modular Over Inline — PARTIAL COMPLIANCE

**F-7 (High): Extensive procedural content inline in step descriptions**
The `start-workflow` activity contains 12 steps, many of which are essentially skill protocol steps written as inline descriptions. Steps like "Call get_workflow to load the selected workflow" and "Call list_workflow_resources to discover available resources" duplicate what's already defined in the `workflow-execution` skill's `execution_pattern.start[]` and `tools` sections.

**F-8 (High): `detect-execution-model` step embeds a full inline protocol**
This step's description (line 32 of 01-start-workflow.toon) is 4 lines of procedural logic about orchestrator/worker detection. This is essentially a protocol that belongs in the `orchestrate-workflow` skill or a dedicated resource.

### Principle 10: Encode Constraints as Structure — PARTIAL COMPLIANCE

**F-9 (Medium): Rules lacking structural enforcement**

| Rule | File | Enforceable? | Recommendation |
|------|------|--------------|----------------|
| "This workflow is the entrypoint for all workflow operations" | workflow.toon | No — identity statement, not a constraint | Remove or rephrase as a description |
| "Skills in this workflow are universal and apply to all workflows" | workflow.toon | No — scope declaration | Move to description field |
| "Minimum requirement: User must identify the workflow and provide context" | 02-resume-workflow.toon | Yes | Add `validate` entry action |
| "Never end a workflow with incomplete required activities" | 03-end-workflow.toon | Yes | Add `validate` entry action checking completedActivities |

**F-10 (Low): "Key insight:" prefix pattern in rules**
Rules in `resume-workflow` and `end-workflow` use "Key insight:" as a prefix. Rules should be imperative constraints ("Do X" / "Never Y"), not descriptive insights. Move insights to the companion resource.

| Rule | Activity | Recommendation |
|------|----------|----------------|
| "Key insight: Successful resumption requires understanding both workflow progress AND context of previous decisions" | resume-workflow | Move to resource 02 |
| "Key insight: A well-ended workflow leaves a clear trail for future reference and ensures nothing is left incomplete" | end-workflow | Move to resource 03 |

### Principles 1-3, 6-8, 11-13: COMPLIANT

These principles are either fully compliant or not directly testable against static workflow content (they govern the workflow creation process, not the workflow's own content).

Notable strengths:
- **P3 (One question at a time):** All 9 checkpoints are atomic — each asks exactly one question.
- **P9 (Modular over inline):** Skills are well-separated into individual files. The rules.toon file properly externalizes global agent rules.

---

## 3. Anti-Pattern Scan

### Detected (5/23)

**AP-9: "Ask the user whether to proceed" (as prose)**
`start-workflow` step `discover-target` describes checkpoint presentation as prose: "If it exists, present the repo-type checkpoint." The checkpoint exists as a schema construct but the step doesn't reference it structurally.

**AP-11: "If X then do A, otherwise B" (as prose)**
Four step descriptions contain if/then prose:
- `select-workflow`: "If workflow not specified, call list_workflows to show options"
- `discover-target`: "If it exists, present the repo-type checkpoint. If not, set target_path"
- `load-start-resource`: "Call get_resource for index 00 (start-here resource) if available"
- `prepare-checkpoints`: "If activity has checkpoints, prepare to present when reached"

**AP-13: "Track whether the user approved" (implicit)**
11 variables are used in checkpoint effects and decision conditions but never formally declared (see F-1).

**AP-15: "First load the workflow, then get the activity" (as prose)**
Multiple step descriptions in `start-workflow` describe tool call sequences that duplicate the `workflow-execution` skill protocol:
- "Call get_workflow to load the selected workflow"
- "Call list_workflow_resources to discover available resources"
- "Call get_resource for index 00"
- "Call get_activity for the initialActivity"

**AP-19: "The agent must never do X" (as rule text only)**
Two rules in `resume-workflow` and `end-workflow` express constraints without structural enforcement (see F-9).

### Not Detected (18/23)

Remaining anti-patterns are either not present or not testable against static content.

---

## 4. Prose-to-Skills/Resources Migration Assessment

This section evaluates whether existing prose in the meta workflow could be migrated to dedicated skills or resources, improving modularity and reducing inline content.

### Migration Opportunity M-1: Start-workflow step descriptions → Skill protocol references
**Severity:** High | **Files affected:** `01-start-workflow.toon`

Steps 1-4 and 8-12 of `start-workflow` duplicate the `workflow-execution` skill's `execution_pattern.start[]`:

| Step | Current Description (prose) | Already In Skill |
|------|---------------------------|------------------|
| select-workflow | "If workflow not specified, call list_workflows to show options" | `workflow-execution.tools.list_workflows` |
| load-workflow | "Call get_workflow to load the selected workflow" | `workflow-execution.tools.get_workflow` |
| initialize-state | "Initialize state per state-management skill" | `state-management.initialization` |
| apply-rules | "Read and apply workflow rules" | Implicit in workflow-execution |
| discover-resources | "Call list_workflow_resources to discover available resources" | `workflow-execution.tools.list_workflow_resources` |
| load-start-resource | "Call get_resource for index 00 if available" | `workflow-execution.tools.get_resource` |
| get-initial-activity | "Call get_activity for the initialActivity" | `workflow-execution.tools.get_workflow_activity` |
| present-activity | "Present first activity to user with steps and any entry actions" | `workflow-execution.interpretation` |
| prepare-checkpoints | "If activity has checkpoints, prepare to present when reached" | `workflow-execution.interpretation.checkpoints` |

**Recommendation:** Simplify step descriptions to name the operation and reference the relevant skill rather than re-stating the protocol. This reduces the 12-step activity to concise structural references.

### Migration Opportunity M-2: detect-execution-model → Skill reference
**Severity:** High | **Files affected:** `01-start-workflow.toon`

The 4-line `detect-execution-model` step description is a full inline protocol. The `orchestrate-workflow` skill already covers this. The step could reference the skill: `skill: orchestrate-workflow` with a condition on detecting the execution model rule.

### Migration Opportunity M-3: Target resolution logic → New resource
**Severity:** Medium | **Files affected:** `01-start-workflow.toon`

Steps `discover-target` and `read-submodules` contain procedural prose for monorepo detection and submodule parsing. This is not covered by any existing skill or resource. Options:
- Create resource `00-start-workflow.md` with the target resolution protocol, git commands, and monorepo detection checklist
- Create a `target-resolution` skill if reuse across workflows is expected

### Migration Opportunity M-4: "Key insight:" rules → Resources
**Severity:** Low | **Files affected:** `02-resume-workflow.toon`, `03-end-workflow.toon`

Two "Key insight:" rules are descriptive guidance, not constraints. They belong in companion resources:
- "Key insight: Successful resumption requires..." → resource 02
- "Key insight: A well-ended workflow leaves..." → resource 03

### Migration Opportunity M-5: context_to_preserve → Workflow variables
**Severity:** High | **Files affected:** `workflow.toon`, all 3 activities

The `context_to_preserve` fields across all three activities define 20 items that are essentially variable specifications. These should be formalized as `variables[]` in `workflow.toon`. The activity-level `context_to_preserve` can then be removed or reduced to a cross-reference.

### Migration Opportunity M-6: Checkpoint prerequisite prose → Formal condition
**Severity:** Medium | **Files affected:** `01-start-workflow.toon`

The `submodule-selection` checkpoint's `prerequisite` field is a prose string. Replace with a formal `condition` object.

### Migration Opportunity M-7: Decision transitionTo targets → Verify step references
**Severity:** Medium | **Files affected:** `02-resume-workflow.toon`, `03-end-workflow.toon`

Decision branches reference targets (`assess-external-state`, `branch-sync-checkpoint`, `conflict-resolution-checkpoint`, `continue-assessment`, `verify-external-state`) that don't exist as defined steps in their activities. These are either:
- Planned but unimplemented steps (missing from the steps array)
- Conceptual labels that should be formal step IDs

If these represent actual branching targets, the corresponding steps should be added. If they're illustrative, the decisions should be removed or the targets corrected.

### Migration Opportunity M-8: README skills table → Update for current inventory
**Severity:** Low | **Files affected:** `README.md`

The README's skills table lists 5 skills but the workflow has 9. Missing from the table: `orchestrate-workflow`, `execute-activity`, `knowledge-base-search`, `gitnexus-operations`.

---

## 5. Recommended Fix Priority

### Immediate (Critical)

1. **SV-1, SV-2:** Fix schema validation failures in `01-workflow-execution.toon` and `02-state-management.toon`
2. **F-1:** Declare all 11 variables in `workflow.toon`

### Short-term (High)

3. **M-1, F-7, F-8:** Simplify start-workflow step descriptions to reference skill protocols instead of duplicating them
4. **F-3:** Add `artifacts[]` declarations to activities that produce outputs
5. **M-5:** Migrate `context_to_preserve` items to formal workflow-level variables
6. **M-7:** Resolve decision transitionTo targets — add missing steps or correct references

### Medium-term (Medium)

7. **F-4, M-6:** Replace prose prerequisite with formal condition on `submodule-selection` checkpoint
8. **F-6, M-3:** Create resource `00-start-workflow.md` with target resolution protocol
9. **F-9:** Add `validate` entry actions for enforceable rules
10. **M-4, F-10:** Move "Key insight:" text from rules to companion resources

### Low Priority

11. **M-8:** Update README skills table to reflect all 9 skills
12. **F-2 remaining:** Convert remaining if/then prose to step conditions where practical

---

## 6. Strengths

The meta workflow demonstrates several design qualities worth noting:

- **Clean independent-activity model.** The three activities operate as standalone entry points matched via recognition patterns — no forced sequential flow for what are genuinely independent operations.
- **Comprehensive skill inventory.** Nine well-modularized skills cover the full operational domain, from activity resolution through orchestration to external integrations.
- **Strong checkpoint design.** All 9 checkpoints are atomic, use appropriate effects, and provide meaningful user decision points with consequences wired to state variables.
- **Decision constructs.** `resume-workflow` and `end-workflow` use formal decision constructs for automated branching — the correct schema pattern for non-user-facing conditional logic.
- **Resource separation.** Companion resources for resume and end activities properly separate reference material from structural definitions.
