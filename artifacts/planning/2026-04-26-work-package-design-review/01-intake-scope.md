# Work-Package Workflow — Review Scope (Intake)

Generated: 2026-04-26
Mode: Review (audit existing workflow against design principles)
Target workflow: `work-package`
Target path: `workflows/work-package/`

## Workflow metadata

| Field | Value |
|-------|-------|
| id | `work-package` |
| version | 3.7.0 |
| title | Work Package Implementation Workflow |
| author | m2ux |
| primary skill | `meta/workflow-orchestrator` |
| initialActivity | `start-work-package` |
| tags (6) | implementation, engineering, planning, feature, bug-fix, pr |
| workflow-level rules | 7 |
| variables | 70 |
| modes | 1 (`review` — activates on `is_review_mode`, recognition: "start review work package", "review pr", "review existing implementation"; skips `requirements-elicitation` and `implement`) |
| artifactLocations | planning, reviews, adr, comprehension |

## File enumeration

| Category | Count | Notes |
|----------|-------|-------|
| workflow.toon | 1 | Root manifest |
| activities/*.toon | 14 | Numbered 01..14 |
| activities/README.md | 1 | |
| skills/*.toon | 24 | Numbered 00..23 |
| skills/README.md | 1 | |
| resources/*.md | 28 (excluding README) | Numbered 01..28 |
| resources/README.md | 1 | |
| Root README.md | 1 | |
| Root REVIEW-MODE.md | 1 | Top-level companion doc for review mode |
| **Total files** | **72** | |

## Activity sequence

| # | id | name | checkpoints | transitions |
|---|----|------|-------------|-------------|
| 01 | start-work-package | Start Work Package | 11 | 1 |
| 02 | design-philosophy | Design Philosophy | 3 | 1 |
| 03 | requirements-elicitation | Requirements Elicitation | 2 | 2 |
| 04 | research | Research | 3 | 1 |
| 05 | implementation-analysis | Implementation Analysis | 2 | 1 |
| 06 | plan-prepare | Plan & Prepare | 1 | 1 |
| 07 | assumptions-review | Assumptions Review | 2 | 4 |
| 08 | implement | Implement Tasks | 4 | 1 |
| 09 | post-impl-review | Post-Implementation Review | 3 | 1 |
| 10 | validate | Verify & Validate Design | 0 | 1 |
| 11 | strategic-review | Strategic Review | 2 | 3 |
| 12 | submit-for-review | Submit for Review | 4 | 3 |
| 13 | complete | Complete Work Package | 0 | 0 |
| 14 | codebase-comprehension | Codebase Comprehension | 2 | 4 |
| **Totals** |  |  | **39** | **24** |

`initialActivity` = `start-work-package`. Activity `13-complete` is the terminal node (0 transitions, 0 checkpoints).

## Skills

24 skill files (00..23), covering: review-code, review-test-suite, respond-to-pr-review, create-issue, classify-problem, elicit-requirements, research-knowledge-base, analyze-implementation, create-plan, create-test-plan, implement-task, review-diff, review-strategy, review-assumptions, manage-artifacts, manage-git, validate-build, finalize-documentation, update-pr, conduct-retrospective, summarize-architecture, create-adr, build-comprehension, reconcile-assumptions.

## Resources

28 markdown resources (01..28), covering: project READMEs, GitHub/Jira issue creation guides, requirements elicitation, implementation analysis, knowledge-base/web research, design framework, work-package plan, test plan, PR description, assumptions review, task completion review, architecture review, rust-substrate code review, test-suite review, strategic review, architecture summary, workflow retrospective, complete-wp, manual diff review, TDD-concepts-rust, review-mode, codebase-comprehension, assumption-reconciliation, gitnexus-reference, pr-review-response.

## Aggregate counts (for compliance review baseline)

- Activities: 14
- Skills: 24
- Resources: 28
- Modes: 1
- Workflow-level rules: 7
- Variables: 70
- Activity-level checkpoints (sum): 39
- Activity-level transitions (sum): 24

## Confirmation

- Mode: review
- Target: `work-package`
- Planning folder: `.engineering/artifacts/planning/2026-04-26-work-package-design-review`
- Pre-confirmed by user: yes (`review_scope_confirmed = true` per dispatch context)
