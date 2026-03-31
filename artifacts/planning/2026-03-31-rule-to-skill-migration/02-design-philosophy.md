# Design Philosophy

**Work Package:** Rule-to-Skill Migration  
**Issue:** #88 - Extract convoluted workflow rule groups into dedicated skill+resource sets  
**Created:** 2026-03-31

---

## Problem Statement

Workflow TOON files embed behavioral protocols as prose rule text in their `rules[]` arrays. Many of these rules are semantically identical across workflows — the orchestrator discipline rules alone appear in 5 different workflows, restated in different words each time. The `meta/rules.toon` file contains 85 global rules across 16 sections, all returned verbatim in every `start_session` response regardless of which workflow is being started. Additionally, the `meta` workflow appears in `list_workflows` output even though it is a skill/rule repository, not a runnable workflow.

### System Context

The system has three rule layers:

1. **Global rules** (`meta/rules.toon`): 85 rules across 16 sections — loaded by `readRules()` in `rules-loader.ts` and returned in every `start_session` response as a single monolithic payload.
2. **Workflow-level rules** (each workflow's `workflow.toon` `rules[]`): 118 rules across 10 workflows — embedded as prose in each TOON file, with heavy duplication of orchestration, execution, and domain protocols.
3. **Skill-level rules** (inside skill TOON files): Already formalized as part of the Goal → Activity → Skill → Tools model.

The new `get_skills(workflow_id)` capability (#86) enables workflows to discover skills dynamically. Skills already have structured `protocol`, `rules`, `inputs`, `output`, and `resources` sections — the formalism that workflow-level rules lack.

The skill loader (`skill-loader.ts`) resolves skills via a layered search: workflow-specific → universal (meta/skills/) → cross-workflow scan. This means skills placed in `meta/skills/` are automatically available to all workflows.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — the system works, but rule drift causes behavioral inconsistencies |
| Scope | All 10 workflows, `start_session` tool, `list_workflows` tool, meta workflow structure |
| Business Impact | Rule changes require N updates; agents receive ~85 rules in `start_session` before any activity begins; `meta` appears as a runnable workflow confusing agents |

---

## Problem Classification

**Type:** Inventive Goal — Improvement  

**Subtype:**  
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Complex

**Rationale:** This is an improvement to the workflow architecture, not a fix for a broken system. It touches ~140+ rules across 8+ workflows, requires server code changes (`start_session` response slimming, `list_workflows` meta exclusion), and restructures how agents discover behavioral protocols. The changes affect the behavioral contract between the server and all consuming agents — a single misstep could silently change agent behavior. The scope spans three layers (global rules, workflow rules, skill definitions) and requires careful migration to preserve semantic equivalence.

---

## Workflow Path Decision

**Selected Path:** Research only (skip elicitation)

**Activities Included:**
- [ ] Requirements Elicitation
- [x] Research
- [x] Codebase Comprehension
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:**
- **Requirements are clear**: The issue has well-defined scope with prioritized extraction targets, acceptance criteria, and concrete rule counts from prior analysis.
- **Elicitation unnecessary**: The problem was identified through systematic workflow audit — no stakeholder discovery needed.
- **Research warranted**: Need to determine the optimal skill/resource structure for extracted rule groups. Questions include: should each extracted skill have an associated resource? What protocol structure best preserves the behavioral semantics of prose rules? How should `start_session` be slimmed — empty rules, minimal bootstrap instruction, or pointer to `get_skills`?
- **Comprehension needed**: Must trace all rules across all workflows to build a complete duplication map and verify semantic equivalence before extraction.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Behavioral Equivalence | Agents must follow the same constraints after migration — no behavioral regression |
| Dependency | Requires #86 (workflow-level skills) to be merged first |
| Backward Compatibility | `start_session` response shape change may affect existing agent implementations |
| Ordering | Priority 1 extractions (orchestrator-discipline, worker-execution-discipline) should land first as they provide the most value and test the migration pattern |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Rule duplication eliminated | Count of semantically duplicate rules across workflows | 0 duplicates for extracted groups |
| Skills formalized | Each extracted group has protocol + rules + resources | 100% of priority 1-2 groups |
| start_session slimmed | Size of rules payload in start_session response | Minimal bootstrap instruction only |
| meta excluded from list_workflows | meta workflow hidden from workflow discovery | Not listed |
| Tests pass | All existing tests pass after migration | 100% pass rate |
| No behavioral regression | Agent execution follows same constraints | Verified through test coverage |

---

## Design Decisions

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Skill placement | Workflow-specific skills vs meta/skills/ (universal) | Universal (meta/skills/) for cross-cutting concerns | Skills like orchestrator-discipline apply to all orchestrated workflows — universal placement ensures automatic availability |
| start_session slimming | Empty rules vs minimal instruction vs full removal | Minimal bootstrap instruction | Agents need to know to call `get_skills` to load protocols; an empty response provides no guidance |
| meta visibility | Keep in list_workflows vs exclude | Exclude from list_workflows | Meta is a skill repository, not a runnable workflow — listing it confuses agents |
| Migration ordering | All at once vs phased by priority | Phased by priority tier | Reduces risk, validates pattern on highest-impact extractions first |

---

## Notes

- The current `readRules()` function reads from `meta/rules.toon` — the slimming approach needs to decide whether to keep this file with minimal content or restructure the loading path entirely.
- Workflow-level rules (`workflow.toon` `rules[]`) will shrink as protocols are extracted into skills, but some rules are genuinely workflow-specific (e.g., "PREREQUISITE: Agents MUST read and follow AGENTS.md") and should remain.
- The `start_session` response currently includes `rules` as a top-level field. Changing this shape is a breaking change for consumers — need to assess whether any external consumers depend on it.
