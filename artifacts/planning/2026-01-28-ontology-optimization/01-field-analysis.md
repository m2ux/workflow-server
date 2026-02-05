# Field Analysis: Ontology Redundancy and Overlap

**Date:** 2026-01-28

---

## Methodology

This analysis examines each entity's fields to identify:
- **Redundancy:** Fields that duplicate information
- **Overlap:** Fields with unclear boundaries
- **Inconsistency:** Similar concepts named differently

---

## Entity: Workflow

| Field | Type | Purpose | Observations |
|-------|------|---------|--------------|
| `id` | string | Unique identifier | Standard, no issues |
| `version` | semver | Schema version | Standard |
| `title` | string | Display name | ⚠️ Other entities use `name` |
| `description` | string | Detailed description | Standard |
| `author` | string | Creator | Metadata only |
| `tags` | string[] | Categorization | Metadata only |
| `rules` | string[] | Execution guidelines | Could these be structured? |
| `variables` | Variable[] | State definitions | Standard |
| `initialActivity` | string | Starting point | Only for sequential workflows |
| `activitiesDir` | string | External activities path | File organization |
| `activities` | Activity[] | Inline activities | Standard |

### Issues Identified

1. **`title` vs `name`:** Workflow uses `title`, but Activity, Step, Checkpoint, etc. use `name`. This inconsistency adds cognitive load.
   - **Recommendation:** Standardize on `name` for all entities, or clearly document the distinction.

2. **`rules` as string[]:** Rules are unstructured strings. Compare with the structured `get_rules` output which has sections, priorities, etc.
   - **Question:** Should rules be structured at the schema level?

---

## Entity: Activity

| Field | Type | Purpose | Observations |
|-------|------|---------|--------------|
| `id` | string | Unique identifier | Standard |
| `version` | semver | Activity version | Standard |
| `name` | string | Display name | Standard |
| `description` | string | What activity does | ⚠️ Overlaps with `problem` |
| `problem` | string | User problem addressed | ⚠️ Overlaps with `description` |
| `recognition` | string[] | Intent patterns | For matching user goals |
| `skills.primary` | string | Primary skill ID | Required |
| `skills.supporting` | string[] | Supporting skills | Optional |
| `steps` | Step[] | Execution tasks | Standard |
| `checkpoints` | Checkpoint[] | User decisions | Standard |
| `decisions` | Decision[] | Auto branching | Standard |
| `loops` | Loop[] | Iteration | Standard |
| `transitions` | Transition[] | Navigation | Standard |
| `triggers` | WorkflowTrigger | Child workflow | Standard |
| `entryActions` | Action[] | On enter | ⚠️ See exitActions |
| `exitActions` | Action[] | On exit | ⚠️ See outcome |
| `outcome` | string[] | Expected results | ⚠️ Overlaps with exitActions |
| `context_to_preserve` | string[] | Preserved context | Documentation purpose |
| `required` | boolean | Mandatory flag | Standard |
| `estimatedTime` | string | Time estimate | Standard |
| `notes` | string[] | Additional notes | Documentation |

### Issues Identified

1. **`description` vs `problem`:**
   - `description`: "What this activity accomplishes" (solution-oriented)
   - `problem`: "User problem this activity addresses" (problem-oriented)
   - **Analysis:** These serve different purposes—one describes the solution, one describes the need. However, in practice they often contain similar content.
   - **Recommendation:** Keep both but clarify guidance. `problem` is for intent matching, `description` is for execution guidance.

2. **`exitActions` vs `outcome`:**
   - `exitActions`: Actions to execute (imperative)
   - `outcome`: Expected results (declarative)
   - **Analysis:** These are conceptually different—actions are executed, outcomes are documented expectations.
   - **Recommendation:** Keep both, they serve different purposes.

3. **`recognition` vs `problem`:**
   - Both used for intent matching
   - `recognition`: Short patterns for quick matching
   - `problem`: Full problem statement for semantic matching
   - **Analysis:** Complementary—quick_match uses recognition, fallback uses problem
   - **Recommendation:** Document their relationship more clearly.

---

## Entity: Step

| Field | Type | Purpose | Observations |
|-------|------|---------|--------------|
| `id` | string | Unique identifier | Standard |
| `name` | string | Task name | Standard |
| `description` | string | What step does | Standard |
| `skill` | string | Skill to apply | ⚠️ vs Activity's skills reference |
| `required` | boolean | Mandatory flag | Standard |
| `actions` | Action[] | Actions to perform | Standard |

### Issues Identified

1. **`skill` (singular) vs Activity's `skills` (object with primary/supporting):**
   - Step: `skill: z.string().optional()`
   - Activity: `skills: { primary: string, supporting?: string[] }`
   - **Analysis:** Steps can optionally reference a single skill, Activities require a primary skill and can have supporting skills.
   - **Recommendation:** Consider aligning—perhaps Steps could use the same SkillsReference schema for consistency.

---

## Entity: Checkpoint

| Field | Type | Purpose | Observations |
|-------|------|---------|--------------|
| `id` | string | Unique identifier | Standard |
| `name` | string | Checkpoint name | Standard |
| `message` | string | User prompt | Standard |
| `prerequisite` | string | Pre-action | Not widely used |
| `options` | CheckpointOption[] | Choices | Standard |
| `required` | boolean | Mandatory | Standard |
| `blocking` | literal(true) | Always true | ⚠️ Redundant? |

### Issues Identified

1. **`blocking: literal(true)`:**
   - Checkpoints are defined as always blocking
   - The schema enforces `blocking: z.literal(true).default(true)`
   - **Question:** If it's always true, why is it a field?
   - **Analysis:** This may be for future flexibility or to align with a pattern
   - **Recommendation:** Either remove the field (since it's invariant) or make it actually variable.

---

## Entity: Decision

| Field | Type | Purpose | Observations |
|-------|------|---------|--------------|
| `id` | string | Unique identifier | Standard |
| `name` | string | Decision name | Standard |
| `description` | string | What's decided | Standard |
| `branches` | DecisionBranch[] | Conditional paths | Standard |

### Checkpoint vs Decision Analysis

| Aspect | Checkpoint | Decision |
|--------|------------|----------|
| Blocking | Always true | N/A (instant) |
| Input source | User | Variable evaluation |
| Options/Branches | CheckpointOption[] | DecisionBranch[] |
| Effect mechanism | option.effect | branch.transitionTo |

**Analysis:** These are fundamentally different:
- Checkpoints pause for user input
- Decisions evaluate conditions automatically

**Recommendation:** Keep separate. They could theoretically be unified with `source: 'user' | 'auto'` but the current separation is clear.

---

## Entity: Loop

| Field | Type | Purpose | Observations |
|-------|------|---------|--------------|
| `id` | string | Unique identifier | Standard |
| `name` | string | Loop name | Standard |
| `type` | enum | forEach/while/doWhile | Standard |
| `variable` | string | Iteration variable | Standard |
| `over` | string | Collection (forEach) | Standard |
| `condition` | Condition | Continue condition | Standard |
| `maxIterations` | number | Safety limit | Standard |
| `breakCondition` | Condition | Early exit | Standard |
| `steps` | Step[] | Steps per iteration | ⚠️ See activities |
| `activities` | string[] | Activities in loop | ⚠️ See steps |

### Issues Identified

1. **`steps` vs `activities` in Loop:**
   - Loops can contain either inline steps OR activity IDs
   - **Analysis:** This dual capability allows:
     - Simple loops with inline steps (common case)
     - Complex loops that iterate over full activities (rare case)
   - **Recommendation:** This flexibility seems intentional. Document when to use each.

---

## Entity: Skill

| Field | Type | Purpose | Observations |
|-------|------|---------|--------------|
| `id` | string | Unique identifier | Standard |
| `version` | semver | Skill version | Standard |
| `capability` | string | What skill enables | Standard |
| `description` | string | Detailed description | ⚠️ vs capability |
| `architecture` | object | Architectural patterns | Domain-specific |
| `execution_pattern` | object | Tool sequences | Domain-specific |
| `tools` | object | Tool definitions | Domain-specific |
| `flow` | string[] | Ordered steps | ⚠️ vs execution_pattern |
| `matching` | object | Goal matching | Domain-specific |
| `state` | object | State management | Domain-specific |
| `interpretation` | object | How to interpret constructs | Domain-specific |
| `errors` | object | Error definitions | Standard |

### Issues Identified

1. **`capability` vs `description`:**
   - `capability`: Short statement of what skill enables
   - `description`: Longer explanation
   - **Analysis:** Similar to Activity's problem/description split. Capability is the tagline, description is the detail.
   - **Recommendation:** Keep both, clarify purpose.

2. **`flow` vs `execution_pattern`:**
   - `flow`: Ordered list of steps as strings
   - `execution_pattern`: Structured object with phases (start, per_activity, etc.)
   - **Analysis:** `flow` appears to be a human-readable summary, `execution_pattern` is structured for programmatic use
   - **Recommendation:** Keep both, different purposes.

---

## Cross-Entity Inconsistencies

### Naming Patterns

| Concept | Workflow | Other Entities |
|---------|----------|----------------|
| Display name | `title` | `name` |
| Explanation | `description` | `description` |
| Identifier | `id` | `id` |

**Recommendation:** Standardize display name field. Options:
1. Rename Workflow.title to Workflow.name (breaking change)
2. Keep distinction, document rationale (title is "official name", name is "short label")

### Version Fields

All entities with versions use `version: semver`. This is consistent.

### Required/Optional Patterns

| Entity | Has `required` field |
|--------|---------------------|
| Activity | Yes |
| Step | Yes |
| Checkpoint | Yes |
| Variable | Yes |

This is consistent for execution elements.

---

## Summary of Redundancy Findings

### Confirmed Redundancies

1. **`blocking` on Checkpoint:** Always true, provides no information

### Potential Overlap (Keep With Clarification)

1. **`description` vs `problem` on Activity:** Different purposes, needs clearer guidance
2. **`exitActions` vs `outcome` on Activity:** Imperative vs declarative, both useful
3. **`recognition` vs `problem` on Activity:** Quick match vs semantic match
4. **`capability` vs `description` on Skill:** Tagline vs detail

### Inconsistencies to Address

1. **`title` vs `name`:** Standardize across entities
2. **`skill` vs `skills`:** Step uses singular, Activity uses object

---

## Recommendations Summary

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| Workflow.title vs .name | Low | Document or standardize |
| Checkpoint.blocking | Low | Consider removing invariant field |
| Step.skill vs Activity.skills | Medium | Align schemas for consistency |
| description/problem overlap | Low | Improve documentation |
