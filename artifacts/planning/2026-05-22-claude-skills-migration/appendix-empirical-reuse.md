---
title: "Appendix A — Empirical reuse evidence (the 25 work-package skills)"
status: draft
phase: planning
date: 2026-05-22
relates-to: ./workflow-canonical-plan.md
---

# Appendix A — Empirical reuse evidence

> Grounding evidence for [workflow-canonical-ontology.md §9](./workflow-canonical-ontology.md#9-empirical-validation--mapping-the-existing-25-skills--28-resources). Built from a systematic survey of all 25 TOON skill files under `workflows/work-package/skills/`.

## A.1 Protocol phase reuse matrix

Phases that appear in 3+ skills are strong technique candidates. Phases used in 2 skills are weak candidates; phases used in 1 skill are skill-local steps.

### High-frequency (3+ skills, strong technique candidates)

| Phase name | Skills using it | Count | Reuse quality |
|---|---|---|---|
| `load-guidance` | 00, 01, 04, 07, 08, 09, 12, 14, 16, 17, 20, 21, 22 | 13 | Clean — same shape (read resources → review criteria) |
| `create-artifact` / `write-artifact` | 03, 04, 05, 06, 08, 09, 14, 17, 18, 19, 20, 21, 22, 23 | 14 | Clean — same shape (compose sections → write file) |
| `document-findings` | 00, 01, 02, 07, 08, 11, 12 | 7 | Clean — severity/category + artifact creation |
| `collect-assumptions` | 04, 13, 23 | 3 | Clean — identify implicit decisions, classify |

### Medium-frequency (2 skills)

| Phase name | Skills using it | Reuse quality |
|---|---|---|
| `understand-context` | 10, 22 | Clean — read task/problem, identify scope |
| `categorize` | 02, 04 | Clean — categorize items by type, prioritize |
| `present-for-review` | 13, 24 | Drift — different contexts (assumptions checkpoint vs DCO attestation) |
| `verify-inputs` / `verify-existing` | 03, 08 | Drift — different verify intent (issue exists vs prerequisites) |
| `fetch-comments` | 02, 03 | Drift — different sources (GitHub vs platform detection) |
| `update-status` | 12, 19 | Clean — mark progress/merge status |

### Skill-local (1 skill, NOT technique candidates)

| Phase | Skill |
|---|---|
| `pre-edit-impact-check` | 10 |
| `post-edit-verification` | 10 |
| `write-code` | 10 |
| `verify-locally` | 10 |

Note: although `pre-edit-impact-check` appears as a *phase* in only one skill, its *rule equivalent* (`gitnexus-discipline`) appears in 11. The phase mechanics are skill-local to `implement-task`; the underlying *technique* (impact analysis) is broadly applicable.

## A.2 Rule reuse — the strongest cross-cutting signal

| Rule pattern | Skills | Count | Substance |
|---|---|---|---|
| `gitnexus-discipline` / `gitnexus-first-locate` / `gitnexus-usage` | 07, 08, 10, 11, 12, 13, 16, 17, 20, 22, 23 | **11** | "Use GitNexus as primary tool; fall back to grep only when not indexed." Naming drifts; substance consistent. |
| `evidence-required` | 00, 01 | 2 | "Every finding must cite code with file/line." |
| `conversation-not-interrogation` | 05 | 1 | Skill-local. |
| `prioritize-required` | 02 | 1 | Skill-local. |
| `activity-prefix` | 14 | 1 | Skill-local artifact naming convention. |
| `measure-before-improve` | 07 | 1 | Skill-local baseline discipline. |
| `single-task-focus` | 10 | 1 | Skill-local. |

**The GitNexus rule is the clearest reuse signal in the entire codebase.** 11 of 25 skills have near-identical rule text under three different rule names. In the new ontology, this becomes either:

- A **technique** (`gitnexus-impact-check`) referenced by all 11 skills, OR
- A **role-level rule** on the Engineer role that all Engineer skills inherit, OR
- Both — the rule lives on the role, the technique provides the procedure.

The plan (Section 5.7) proposes the third option.

## A.3 Resource reuse

| Resource ID | Skills referencing it | Count | Suggests |
|---|---|---|---|
| 27 (GitNexus reference) | 00, 01, 02, 04, 07, 08, 10, 11, 12, 13, 16, 17, 20, 22, 23 | **15** | Foundational reference — consumed by the gitnexus technique(s) |
| 12 (PR description template) | 15, 18 | 2 | Domain toolkit — PR family |
| 23 (TDD best practices, Rust) | 01, 10 | 2 | Domain toolkit — testing family |
| 03, 04 (issue creation: GitHub/Jira) | 03 | 2 (within one skill) | Platform-specific reference pair |
| 18, 15 (strategic/architecture review) | 12 | 2 (within one skill) | Domain toolkit — review family |
| 22 (manual diff review) | 11 | 1 | Skill-local |
| 28 (PR review response) | 02 | 1 | Skill-local |
| 05 (requirements elicitation) | 05 | 1 | Skill-local |
| 01 (README template) | 14 | 1 | Skill-local |

**Resource 27 (GitNexus reference) is referenced by 60% of skills.** In the new ontology this resource is naturally consumed by the gitnexus techniques, not directly by skills.

## A.4 Skill size distribution

| Quintile | Line count range | Skills | Examples |
|---|---|---|---|
| Micro (5 skills) | 29–60 lines | 05, 06, 25 + 2 others | DCO provenance, research KB, elicit-requirements |
| Compact (6 skills) | 61–100 lines | 02, 03, 04, 09, 19, 21 | PR response, create issue, classify problem |
| Standard (9 skills) | 101–150 lines | 01, 11, 14, 15, 16, 17, 18, 20, 24 | Review test, review diff, manage artifacts |
| Substantial (8 skills) | 151–188 lines | 00, 07, 08, 10, 12, 13, 22, 23 | Review code, analyse impl, create plan |

- Mean: ~73 lines/skill. Total: 1818 lines.
- The substantial tier (avg ~165 lines) covers deep activities: planning, implementation, strategy review, comprehension. These are the skills least amenable to mechanical decomposition; their bulk is skill-specific reasoning that doesn't reuse.
- The micro tier (avg ~45 lines) are skills that are mostly orchestration of a single technique — they may shrink further in the new ontology by referencing the technique instead of inlining the steps.

## A.5 Apparent role groupings (proposed for plan §5.7)

Mapping skills to roles based on `capability` and `description` fields. Each skill has exactly one primary role; some have secondary roles.

| Role | Skills | Count |
|---|---|---|
| **Engineer** | 07 analyze-implementation, 08 create-plan, 09 create-test-plan, 10 implement-task, 14 manage-artifacts, 15 manage-git, 16 validate-build, 17 finalize-documentation, 18 update-pr, 24 cargo-operations, 25 dco-provenance + 03 create-issue (problem-definition flavour) | 12 |
| **Reviewer** | 00 review-code, 01 review-test-suite, 02 respond-to-pr-review, 11 review-diff, 12 review-strategy, 13 review-assumptions | 6 |
| **Planner** | 05 elicit-requirements, 06 research-knowledge-base, 23 reconcile-assumptions | 3 |
| **Architect** | 20 summarize-architecture, 21 create-adr | 2 |
| **Maintainer** | 04 classify-problem, 19 conduct-retrospective | 2 |

Some skills are dual-role:
- `22 build-comprehension` — Engineer + Architect (it's an exploration/understanding skill that informs both implementation and architecture).
- `08 create-plan` — Engineer + Planner (planning a work-package is an engineering activity but draws on planning discipline).

The proposed roles are intentionally small in number (5) — fewer roles → simpler workflow bindings → clearer authority and refusal contracts.

## A.6 Synthesis — what this evidence licenses

Direct mappings into the plan:

1. **8 technique candidates** are well-supported by reuse evidence:
   - `gitnexus-impact-check` (the pre-edit / verify pattern; rule appears in 11 skills)
   - `gitnexus-first-exploration` (the exploratory flavour; same rule family)
   - `load-guidance` (in 13 skills, identical shape)
   - `document-findings` (in 7 review-family skills)
   - `write-and-validate-artifact` (in 14 skills as `create-artifact` / `write-artifact`)
   - `collect-and-classify-assumptions` (in 3 skills: 04, 13, 23)
   - `present-and-respond-checkpoint` (the human checkpoint pattern — present for review + handle response)
   - `dco-attest-commit` (currently skill 25; applicable to any commit-producing skill)

2. **5 roles** cover the surface area cleanly (Engineer, Reviewer, Planner, Architect, Maintainer).

3. **Skill grain is largely correct** — most existing files map 1:1 to a skill in the new ontology. The grain change is in pulling techniques up out of the skill bodies, not in re-cutting skill boundaries.

4. **Resource 27 (GitNexus reference)** naturally becomes the canonical resource consumed by the gitnexus techniques rather than referenced directly by 15 skills.

5. **Phase 1 (Foundations)** of the migration plan can therefore land confident technique and role catalogues without further investigation — the evidence is already there.
