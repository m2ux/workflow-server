# Ontology Optimization: Summary and Recommendations

**Date:** 2026-01-28

---

## Executive Summary

After analyzing the workflow-server's structural ontology across three dimensions (orthogonality, redundancy, subsumption), the system is **generally well-designed** with a few opportunities for improvement.

| Area | Finding | Action Required |
|------|---------|-----------------|
| Orthogonality | Step vs Activity distinction is sound | None |
| Field Redundancy | Minor inconsistencies exist | Low-priority cleanup |
| Resource Subsumption | Strong opportunity for Skills | Recommended |

---

## Key Findings

### 1. Orthogonality: Sound ✓

**Question:** Does a Step need to be a Step rather than an Activity instance?

**Answer:** Yes. The distinction is well-founded:
- Activities are navigable (transitions), Steps are sequential
- Activities support control flow (checkpoints, decisions), Steps don't
- Activities are matchable by user intent, Steps aren't
- Activities can be external files, Steps are always inline

**Recommendation:** No changes needed.

### 2. Field Redundancy: Minor Issues

**Confirmed Redundancies:**
| Field | Issue | Impact |
|-------|-------|--------|
| `Checkpoint.blocking` | Always `true`, invariant | Low |

**Inconsistencies:**
| Pattern | Issue | Impact |
|---------|-------|--------|
| `title` vs `name` | Workflow uses `title`, others use `name` | Low |
| `skill` vs `skills` | Step uses singular, Activity uses object | Medium |

**Overlapping Fields (Keep With Clarification):**
- `description` vs `problem` on Activity
- `exitActions` vs `outcome` on Activity
- `recognition` vs `problem` on Activity
- `capability` vs `description` on Skill

**Recommendation:** Document field purposes more clearly. Consider optional schema cleanup.

### 3. Resource Subsumption: Strong Opportunity ✓

**Finding:** Resources like `github-issue-creation.md` and `jira-issue-creation.md` contain structured procedural content that would benefit from the Skill schema.

**Benefits:**
- Structured `execution_pattern` vs prose parsing
- Explicit `tools` section with usage guidance
- `errors` section with recovery strategies
- Versioned evolution

**Recommendation:** Create Skills for issue creation processes, keep Resources as companion documents for templates/examples.

---

## Recommendations by Priority

### High Priority

| ID | Recommendation | Effort | Impact |
|----|----------------|--------|--------|
| R1 | Create `github-issue-creation` skill | Medium | High |
| R2 | Create `jira-issue-creation` skill | Medium | High |
| R3 | Update issue-verification activity to reference new skills | Low | Medium |

### Medium Priority

| ID | Recommendation | Effort | Impact |
|----|----------------|--------|--------|
| R4 | Align Step.skill with SkillsReference pattern | Low | Medium |
| R5 | Document field purposes in schemas/README.md | Low | Medium |
| R6 | Consider Skills for requirements-elicitation, implementation-analysis | Medium | Medium |

### Low Priority

| ID | Recommendation | Effort | Impact |
|----|----------------|--------|--------|
| R7 | Decide on `title` vs `name` standardization | Low | Low |
| R8 | Consider removing Checkpoint.blocking (always true) | Low | Low |

---

## Implementation Plan

### Phase 1: Skill Creation (Recommended First)

1. **Create Skills**
   - `workflows/work-package/skills/03-github-issue-creation.toon`
   - `workflows/work-package/skills/04-jira-issue-creation.toon`

2. **Structure Skills with:**
   - `execution_pattern` for tool sequences
   - `tools` with detailed guidance
   - `flow` for human-readable process
   - `errors` for recovery strategies

3. **Reference Resources**
   - Skills link to companion resources for templates/examples

### Phase 2: Activity Updates

1. **Update `01-issue-verification.toon`**
   - Add new skills to `skills.supporting`
   - Or create checkpoint options that specify which skill to use

2. **Verify tool loading**
   - Ensure `get_skill` returns new skills
   - Test activity → skill flow

### Phase 3: Documentation

1. **Update schemas/README.md**
   - Clarify field purposes for overlapping fields
   - Document Step vs Activity distinction rationale
   - Add guidance on when to use Resources vs Skills

### Phase 4: Optional Cleanup

1. **Schema refinements** (breaking changes, low priority)
   - Standardize `title`/`name`
   - Remove `Checkpoint.blocking`
   - Align `Step.skill` with `SkillsReference`

---

## Draft: GitHub Issue Creation Skill

```toon
id: github-issue-creation
version: 1.0.0
capability: Create well-structured GitHub issues that define problems without prescribing solutions

execution_pattern:
  analysis[2]:
    - Analyze user requirement
    - Determine if formal issue is warranted
  drafting[4]:
    - Draft problem statement (current vs desired state)
    - Draft goal (one sentence, solution-agnostic)
    - Draft scope (in/out boundaries)
    - Draft user stories with acceptance criteria
  validation[2]:
    - Verify against anti-pattern checklist
    - Present draft for user approval
  creation[2]:
    - Create issue via gh CLI
    - Confirm and return issue URL

tools:
  gh_issue_create:
    when: User approves issue draft
    usage: "gh issue create --title 'TITLE' --body 'BODY'"
    returns: Issue number and URL

flow[7]:
  - "1. Analyze requirement: is a formal issue warranted?"
  - "2. Skip for trivial fixes (typos, formatting, refactoring)"
  - "3. Draft Problem Statement: current state, desired state, impact"
  - "4. Draft Goal: one sentence capturing success (no implementation)"
  - "5. Draft Scope: explicit in-scope and out-of-scope items"
  - "6. Draft User Stories: as [persona], I want [capability] so that [benefit]"
  - "7. Validate: no solutions, testable criteria, clear problem"

errors:
  solution_prescribed:
    cause: Issue contains implementation details
    detection: "Mentions files, schemas, algorithms, code patterns"
    recovery: "Reframe: 'What user problem does this solve?'"
  vague_problem:
    cause: Problem statement too broad
    detection: No concrete examples of current failures
    recovery: Add specific examples of what's broken/missing
  untestable_criteria:
    cause: Acceptance criteria specify implementation
    detection: "Mentions tables, columns, functions, endpoints"
    recovery: Rewrite as observable outcomes

resources[1]:
  - 03-github-issue-creation.md
```

---

## Decision Points

Before proceeding, consider these decisions:

### D1: Skill-Resource Relationship

**Option A: Skills supersede Resources**
- Resources become minimal (templates only)
- All procedural content in Skills
- Cleaner but may lose valuable prose

**Option B: Skills complement Resources**
- Resources remain comprehensive
- Skills extract structured process
- Some duplication but richer context

**Recommendation:** Option B (complement) for now, evolve toward A if duplication becomes problematic.

### D2: Activity Structure

**Option A: Single activity with skill selection**
- `issue-verification` activity references both skills
- Checkpoint determines which to use

**Option B: Separate activities per platform**
- `github-issue-creation` activity
- `jira-issue-creation` activity
- Current `issue-verification` delegates

**Recommendation:** Option A matches current structure. Consider B if platform-specific logic grows.

### D3: Schema Breaking Changes

**Option A: Make breaking changes now**
- Standardize `title`→`name`
- Remove `Checkpoint.blocking`
- Bump schema versions

**Option B: Defer breaking changes**
- Document inconsistencies
- Address in future major version

**Recommendation:** Option B. The issues are minor; focus on high-value Skill creation.

---

## Metrics for Success

| Metric | Current | Target |
|--------|---------|--------|
| Issue creation consistency | Variable | Skill-guided |
| Agent tool sequence accuracy | Prose-dependent | Pattern-defined |
| Error recovery | Implicit | Explicit in skill.errors |
| Onboarding clarity | Read long docs | Follow structured flow |

---

## Next Steps

1. **User Decision:** Proceed with Skill creation? (R1, R2)
2. **If yes:** Create skill files, update activities
3. **If no:** Archive this analysis for future reference

---

## Appendix: Files Analyzed

| File | Purpose |
|------|---------|
| `schemas/README.md` | Ontology documentation |
| `src/schema/activity.schema.ts` | Activity Zod schema |
| `src/schema/skill.schema.ts` | Skill Zod schema |
| `src/schema/workflow.schema.ts` | Workflow Zod schema |
| `workflows/work-package/workflow.toon` | Work package workflow |
| `workflows/work-package/activities/01-issue-verification.toon` | Issue activity |
| `workflows/work-package/resources/03-github-issue-creation.md` | GitHub guide |
| `workflows/work-package/resources/04-jira-issue-creation.md` | Jira guide |
| `workflows/meta/skills/01-workflow-execution.toon` | Workflow skill example |
