# Design Philosophy

**Work Package:** Optimize Skill Delivery  
**Issue:** #96 - Agents receive excessive skill content upfront, reducing context efficiency  
**Created:** 2026-04-01

---

## Problem Statement

The workflow server's skill delivery mechanism loads all skills for a workflow or activity in bulk, regardless of which step the agent is currently executing. When an agent bootstraps via `get_skills`, it receives the complete set of workflow-level management skills (session-protocol, execute-activity, state-management, orchestrate-workflow, agent-conduct). When executing steps, the agent must call `get_skill` per step, but the tool has no step-level scoping — it returns the skill by ID without contextual filtering.

The consequence is twofold: (1) workflow bootstrap front-loads multiple management skills that the agent must parse and hold in context simultaneously, and (2) there is no mechanism to deliver a single, focused skill payload scoped to a specific step.

### System Context

The skill delivery system consists of:

- **`get_skills` tool** (`src/tools/resource-tools.ts`): Reads all skill IDs from `workflow.skills[]`, loads each via `readSkill`, resolves referenced resources, and returns the bundled set. This is the workflow-level bulk loader.
- **`get_skill` tool** (`src/tools/resource-tools.ts`): Loads a single skill by `skill_id` with `workflow_id` context. Validates skill association against the current activity's declarations (primary, supporting, and step-level). Resolves and bundles resources.
- **Skill loader** (`src/loaders/skill-loader.ts`): Resolution chain — workflow-specific directory, then universal (meta) directory, then cross-workflow search. Skills are TOON files parsed and validated against `SkillSchema`.
- **Activity schema** (`src/schema/activity.schema.ts`): Supports both activity-level skill references (`skills.primary`, `skills.supporting`) and step-level declarations (`step.skill`). The work-package workflow has already migrated to step-level declarations.
- **Validation** (`src/utils/validation.ts`): `validateSkillAssociation` checks that a requested skill is declared in the activity's skills or step-level skill fields. Currently advisory (warnings, not blocking).

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — functional correctness is not affected, but agent efficiency and context quality are degraded |
| Scope | All workflow-executing agents; most visible in activities with many skills |
| Business Impact | Increased token consumption, higher risk of protocol confusion, slower workflow throughput |

---

## Problem Classification

**Type:** Inventive Goal — Improvement  

**Subtype:**  
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate (user-adjusted to simple for workflow path selection)  

**Rationale:** The system works correctly but delivers more content than agents need at any given moment. The requirements are clearly specified (6 concrete requirements from the user), the domain is fully within the codebase, and the transformation is systematic. The work-package workflow has already been migrated to step-level skill declarations, establishing the pattern for other workflows.

---

## Workflow Path Decision

**Selected Path:** Skip optional activities (direct to codebase comprehension → planning)

**Activities Included:**
- [x] Codebase Comprehension
- [ ] Requirements Elicitation — skipped (requirements already specified)
- [ ] Research — skipped (internal architecture concern, not pattern-discovery)
- [x] Plan & Prepare

**Rationale:** The user provided 6 specific, actionable requirements. The domain is the workflow server's own skill delivery system — entirely accessible through codebase analysis. No external research or requirements discovery is needed. The existing work-package migration to step-level skills serves as the reference pattern.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Backward Compatibility | Existing workflow definitions must continue to function during migration |
| Reference Pattern | Work-package skills already migrated to step level — follow this established pattern |
| Schema Stability | TOON schema format itself is out of scope; skill references remain declarative |
| Scope Boundary | Workflow transition logic and checkpoint mechanics are not modified |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Step-scoped skill delivery | `get_skill` accepts step-id and returns exactly 1 skill | All step-level `get_skill` calls return single skill |
| Management skill consolidation | Count of skills loaded at bootstrap | 1 management skill (down from 3-5) |
| 1-skill-per-step invariant | Steps declaring >1 skill | 0 steps with multi-skill declarations |
| Context volume reduction | Skill content per load | Reduced to single-step scope |

---

## Notes

- The work-package workflow has already been migrated to step-level skill declarations and serves as the reference implementation for this work.
- Activity-level skill fields (`skills.primary`, `skills.supporting`) will be deprecated in favor of step-level `skill` declarations, but the schema should retain them for backward compatibility during the transition.
- Workflow management skills (session-protocol, execute-activity, state-management, orchestrate-workflow, agent-conduct) need consolidation analysis to determine what can be merged into a single cohesive management skill.
