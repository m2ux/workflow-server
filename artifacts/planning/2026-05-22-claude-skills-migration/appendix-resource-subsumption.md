---
title: "Appendix C — Resource subsumption mapping (all 28 work-package resources)"
status: draft
phase: planning
date: 2026-05-22
relates-to: ./workflow-canonical-plan.md
---

# Appendix C — Resource subsumption mapping

> Per-file disposition of every file currently in `workflows/work-package/resources/`. The new ontology has NO Resource tier — every byte must land in a Skill or be deleted as redundant.
>
> Grounded in an empirical pass over all 28 files (the largest content body in the workflow at ~12,175 lines). The Explore agent's classification informed this mapping; destinations have been further updated to reflect the **no-sub-files, every-folder-is-a-named-technique** convention now in plan §5.5 rule 6, rule 10, and rule 11.

## C.0 Convention update (supersedes specific row dispositions where they conflict)

The original Appendix C used dispositions like "Skill-local sub-file" and "Technique-local sub-file" that **no longer exist in the architecture**. The replacements:

| Original disposition | Now becomes |
|---|---|
| Skill-local sub-file (template) | **Named nested technique** under the owning skill — e.g. resource 12 (`pr-description.md`) → `skills/update-pr/compose-pr-description/SKILL.md`. Template content is the body of the new technique. |
| Skill-local sub-file (criteria) | **Named nested technique** — e.g. resource 16 (`rust-substrate-code-review.md`) → `skills/review-code/apply-rust-substrate-criteria/SKILL.md`. |
| Skill-local sub-file (guide) | **Named nested technique** — e.g. resource 28 (`pr-review-response.md`) → `skills/respond-to-pr-review/fetch-and-classify-pr-comments/SKILL.md`. |
| Technique-local sub-file (primer) | **Folded into the technique body** — e.g. resource 23 (`tdd-concepts-rust.md`) becomes the body of `skills/testing/tdd-design-rust/SKILL.md`. |
| Competency-bundle sub-file | **Distributed across the bundle's SKILL.md and its nested techniques** — see resource 27 row below. |

After this convention update, the disposition summary becomes:

| Disposition | Count |
|---|---|
| **Promote to technique** (anywhere — under a deliverable-shaped skill, a competency-bundle, or a tool-dedicated skill) | 24 (was 10 + the 14 that were "Skill-local sub-file") |
| **Fold into a technique body** (single-file primer absorbed) | 1 (resource 23) |
| **Distribute across a tool-dedicated skill** (resource 27 — high-level overview into the bundle's SKILL.md; per-endpoint detail into per-endpoint techniques) | 1 |
| **Workflow docs** | 1 |
| **Delete** | 1 |
| **Total** | **28** |

The 28-row table below preserves the original detail for traceability. Where a row says "Skill-local sub-file" or similar, read it through the lens of C.0.

## C.1 Disposition summary

| Disposition | Count | Net effect |
|---|---|---|
| **Promote to technique** (nested under a competency-bundle skill) | 10 | Existing knowledge becomes first-class composable units |
| **Skill-local sub-file** (single deliverable-shaped skill) | 14 | Templates/criteria attach to the owning skill |
| **Technique-local sub-file** (single nested technique) | 1 | Reference primer attaches to the owning technique |
| **Distributed into a tool-dedicated skill** (resource 27 → gitnexus skill + per-endpoint techniques) | 1 | Tool's operational reference becomes the body of a tool-dedicated bundle skill, broken into one nested technique per API endpoint |
| **Workflow docs** (not part of skill content) | 1 | Moves to workflow-level README or `workflow.toon`-adjacent docs |
| **Delete** (obsolete) | 1 | Removed |
| **Total** | **28** | `resources/` directory deleted after migration |

## C.2 Per-file disposition table

| # | Filename | Lines | Disposition | Final destination | Rationale |
|---|---|---|---|---|---|
| 01 | `01-readme.md` | ~100 | Skill-local sub-file | `skills/manage-artifacts/readme-template.md` | Template and guidelines for the work-package README artifact; consumed by `manage-artifacts`. |
| 02 | `02-readme.md` | ~15 | **Delete** | — | Deprecation pointer consolidating into `01-readme.md`; redundant. |
| 03 | `03-github-issue-creation.md` | ~80 | Skill-local sub-file | `skills/create-issue/github-issue-criteria.md` | Platform-specific issue-creation reference for GitHub; consumed only by `create-issue`. |
| 04 | `04-jira-issue-creation.md` | ~80 | Skill-local sub-file | `skills/create-issue/jira-issue-criteria.md` | Platform-specific issue-creation reference for Jira; consumed only by `create-issue`. |
| 05 | `05-requirements-elicitation.md` | ~80 | **Promote → technique** | `skills/research/techniques/elicit-structured-requirements/SKILL.md` | Named procedure with inputs (problem statement), outputs (structured requirements), reusable across `elicit-requirements`, `classify-problem`, `review-strategy`. Frontmatter `kind: technique`. |
| 06 | `06-implementation-analysis.md` | ~80 | **Promote → technique** | `skills/design/techniques/analyze-implementation-baseline/SKILL.md` | Establishes pre-change baseline; clear procedure (review existing usage, effectiveness eval, baseline metrics); reused by `analyze-implementation` and `review-strategy`. |
| 07 | `07-knowledge-base-research.md` | ~80 | **Promote → technique** | `skills/research/techniques/search-knowledge-base/SKILL.md` | Structured concept-rag research methodology; reusable across design, analysis, research skills. |
| 08 | `08-web-research.md` | ~80 | **Promote → technique** | `skills/research/techniques/search-external-sources/SKILL.md` | Web research procedure with step-by-step guidance; reusable across `research-knowledge-base` and `elicit-requirements`. |
| 09 | `09-design-framework.md` | ~80 | **Promote → technique** | `skills/design/techniques/apply-design-framework/SKILL.md` | Structured TRIZICS-style design methodology; reusable across problem classification, planning, and architecture review. |
| 10 | `10-wp-plan.md` | ~80 | Skill-local sub-file | `skills/create-plan/plan-template.md` | Artifact template for work-package planning documents; consumed only by `create-plan`. |
| 11 | `11-test-plan.md` | ~80 | Skill-local sub-file | `skills/create-test-plan/tdd-test-design.md` | Test plan template; consumed only by `create-test-plan`. |
| 12 | `12-pr-description.md` | ~80 | Skill-local sub-file | `skills/update-pr/pr-description-template.md` | PR description sections and checklist; consumed by `update-pr` (and informationally by `manage-git`). If `manage-git` ends up needing it, promote to a `git`-themed technique with this as a sub-file. |
| 13 | `13-assumptions-review.md` | ~100 | **Promote → technique** | `skills/assumption-management/techniques/collect-and-classify-assumptions/SKILL.md` | Named procedure for identifying/categorising assumptions; reused across `classify-problem`, `review-assumptions`, `reconcile-assumptions`. |
| 14 | `14-task-completion-review.md` | ~80 | **Promote → technique** | `skills/code-review/techniques/verify-task-deliverables/SKILL.md` | Three-part checklist (symbol verification, assumption review, quality checks); independently meaningful and reused. |
| 15 | `15-architecture-review.md` | ~80 | **Promote → technique** | `skills/design/techniques/conduct-architecture-review/SKILL.md` | Named procedure for evaluating design decisions; produces ADRs; reused across `create-adr` and `review-strategy`. |
| 16 | `16-rust-substrate-code-review.md` | ~80 | Skill-local sub-file | `skills/review-code/rust-substrate-criteria.md` | Language- and framework-specific review criteria; specific to one review skill. (Explore agent classified as technique-local; reclassified to skill-local because the criteria are codebase-specific, not technique-cross-cutting.) |
| 17 | `17-test-suite-review.md` | ~80 | Skill-local sub-file | `skills/review-test-suite/test-antipatterns-reference.md` | Test quality anti-patterns and assessment methodology; consumed only by `review-test-suite`. |
| 18 | `18-strategic-review.md` | ~80 | Skill-local sub-file | `skills/review-strategy/minimality-checklist.md` | Checklist for eliminating speculative changes and ensuring solution minimality; specific to `review-strategy`. |
| 19 | `19-architecture-summary.md` | ~80 | Skill-local sub-file | `skills/summarize-architecture/summary-template.md` | Artifact template; consumed only by `summarize-architecture`. |
| 20 | `20-workflow-retrospective.md` | ~80 | Skill-local sub-file | `skills/conduct-retrospective/retrospective-template.md` | Methodology and template; consumed only by `conduct-retrospective`. |
| 21 | `21-complete-wp.md` | ~80 | Skill-local sub-file | `skills/finalize-documentation/completion-summary-template.md` | Artifact template for COMPLETE.md generation. |
| 22 | `22-manual-diff-review.md` | ~80 | **Promote → technique** | `skills/code-review/techniques/index-and-review-diffs/SKILL.md` | Structured diff indexing and human review; reusable across `review-diff` and any post-impl review. |
| 23 | `23-tdd-concepts-rust.md` | ~100 | Technique-local sub-file | `skills/testing/techniques/tdd-design/tdd-reference-rust.md` | Knowledge primer (Three Laws, Red-Green-Refactor, language-specific patterns); reference for the TDD design technique. |
| 24 | `24-review-mode.md` | ~80 | **Workflow docs** | `workflows/work-package/README.md` (or a workflow-mode-doc adjacent to `workflow.toon`) | Schema-level mode definition and per-activity behaviour; this is workflow-engine configuration, not skill/technique content. Should NOT live as a skill or technique. |
| 25 | `25-codebase-comprehension.md` | ~80 | Skill-local sub-file | `skills/build-comprehension/comprehension-techniques.md` | Techniques from program-comprehension literature; reference content for `build-comprehension`. Strictly skill-local. |
| 26 | `26-assumption-reconciliation.md` | ~80 | **Promote → technique** | `skills/assumption-management/techniques/reconcile-assumptions-autonomously/SKILL.md` | Named classify→analyze→update→capture cycle; autonomous assumption resolution; reused across `review-assumptions` and `finalize-documentation`. |
| 27 | `27-gitnexus-reference.md` | 592 | **Distributed → tool-dedicated skill (per-endpoint techniques)** | `skills/gitnexus/SKILL.md` (overview) + one nested technique per API endpoint at `skills/gitnexus/<endpoint>/SKILL.md` (e.g. `skills/gitnexus/impact/SKILL.md`, `skills/gitnexus/context/SKILL.md`, …) | Resource 27 is the operational reference for the gitnexus MCP server. Per the user's design: tools are subsumed as parameterised API call specs **inside techniques**, and a complex tool warrants a *tool-dedicated competency-bundle skill* where each nested technique is the operational description of one API endpoint. Resource 27's content distributes accordingly: high-level system overview into the bundle's `SKILL.md`; per-endpoint sections into the matching nested technique SKILL.md. NOT a unified sub-file. |
| 28 | `28-pr-review-response.md` | ~200 | Skill-local sub-file | `skills/respond-to-pr-review/comment-analysis-guide.md` | Structured process for analysing and responding to PR review comments; consumed only by `respond-to-pr-review`. |

## C.3 Promoted techniques summary (10 new technique slugs)

Each promotion creates a new `SKILL.md` file with `kind: technique` frontmatter, nested under its owning competency-bundle skill.

| # | New technique slug | Owning bundle | Source resource |
|---|---|---|---|
| 1 | `elicit-structured-requirements` | `research` | 05 |
| 2 | `analyze-implementation-baseline` | `design` | 06 |
| 3 | `search-knowledge-base` | `research` | 07 |
| 4 | `search-external-sources` | `research` | 08 |
| 5 | `apply-design-framework` | `design` | 09 |
| 6 | `collect-and-classify-assumptions` | `assumption-management` | 13 |
| 7 | `verify-task-deliverables` | `code-review` | 14 |
| 8 | `conduct-architecture-review` | `design` | 15 |
| 9 | `index-and-review-diffs` | `code-review` | 22 |
| 10 | `reconcile-assumptions-autonomously` | `assumption-management` | 26 |

These 10 plus the 8 derived from skill-body reuse (Appendix A) = **18 techniques** in the post-migration catalogue.

## C.4 Competency-bundle skill set and technique housing

The 18 techniques distribute into 7 competency-bundle skills:

| Competency-bundle skill | Kind | Techniques housed (nested SKILL.md folders) | Notes |
|---|---|---|---|
| `gitnexus` | tool-bundle | 6–10 per-endpoint techniques (`impact`, `context`, `cypher`, `detect-changes`, `query`, `rename`, `shape-check`, …) — exact set distributed from resource 27 during Phase 3 | Each nested technique is the operational spec for one gitnexus MCP API endpoint. The bundle's `SKILL.md` is the high-level gitnexus overview. |
| `workflow` | domain-bundle | `load-guidance`, `write-and-validate-artifact`, `present-and-respond-checkpoint`, `dco-attest-commit` | Also houses the 5 role sub-files at the bundle level (`engineer.md`, `reviewer.md`, `planner.md`, `architect.md`, `maintainer.md`). |
| `code-review` | domain-bundle | `document-findings`, `verify-task-deliverables`, `index-and-review-diffs` | |
| `research` | domain-bundle | `elicit-structured-requirements`, `search-knowledge-base`, `search-external-sources` | |
| `design` | domain-bundle | `analyze-implementation-baseline`, `apply-design-framework`, `conduct-architecture-review` | |
| `assumption-management` | domain-bundle | `collect-and-classify-assumptions`, `reconcile-assumptions-autonomously` | |
| `testing` | domain-bundle | `tdd-design` | Technique sub-file `tdd-reference-rust.md` (from resource 23). Single-technique bundle — may consolidate post-pilot. |

Note: technique paths drop the previously-proposed `techniques/` intermediate directory. A nested technique lives at `skills/<bundle>/<technique>/SKILL.md` (e.g. `skills/gitnexus/impact/SKILL.md`, `skills/code-review/document-findings/SKILL.md`).

**Bundle-set finalisation is empirical** — the 7-bundle proposal may consolidate to 5–6 during authoring (e.g. `testing` could merge into `code-review` if scope warrants).

## C.5 Concerns and conflicts (carried forward from the empirical pass)

1. **Resource 12 (PR description template)** — primarily used by `update-pr` but may also be consumed by `manage-git`. If a second consumer emerges during migration, promote the template to a technique under a `git` bundle with the template as its sub-file. Current proposal keeps it skill-local to `update-pr`.

2. **Resource 13 (assumptions-review) vs Resource 26 (assumption-reconciliation)** — overlapping conceptual ground (both about assumption handling). Kept as separate techniques because: 13 is *collection* (manual triage of which assumptions exist), 26 is *reconciliation* (autonomous validation/resolution cycle). Distinct enough to remain separate.

3. **Resource 23 (TDD reference, 100+ lines)** — substantial document. Most of it is load-bearing (Three Laws, Red-Green-Refactor, state machine, language patterns); keep as sub-file of `tdd-design` technique. If the technique grows beyond ~5 sub-files, reconsider whether `testing` bundle should split into `tdd` and `test-review`.

4. **Resource 27 (GitNexus reference, 592 lines)** — the largest single file in the resources directory. **Distributed across a tool-dedicated competency-bundle skill** (`skills/gitnexus/`) and its per-endpoint nested techniques. The bundle `SKILL.md` carries the gitnexus overview; each nested `<endpoint>/SKILL.md` carries the operational spec for one gitnexus MCP API endpoint. This is the canonical pattern for complex tools per the user's design: "tools are parameterised API call specs in technique prose" — and the techniques *are* the per-endpoint specs.

5. **Resource 24 (review-mode)** — NOT a skill or technique. It describes workflow-engine behaviour when the workflow runs in review mode. The right home is workflow-level documentation, possibly adjacent to `workflow.toon`. Phase 8 documentation update should incorporate this material into the workflow README or a new `workflows/work-package/MODES.md`.

## C.6 Fidelity acceptance criteria for resource subsumption

Each disposition is verified by:

- **Content fidelity** — every paragraph from the source resource lands in one (and only one) destination file. A diff-based audit script compares the union of all destination files against the pre-migration resource content; missing paragraphs are fidelity violations.
- **Reference fidelity** — every skill in the new structure that needs the content of a pre-migration resource has a working reference (relative path) to the destination. Any pre-migration `resources: ["<id>"]` reference in a TOON skill must have an equivalent `uses-techniques:` or `bundles-subfiles:` entry in the new skill.
- **Behavioural fidelity** — Phase 7 cutover verification confirms the post-migration worker behaves equivalently to the pre-migration worker for representative tasks (per §10.2).

Only after all three pass is the pre-migration `resources/` directory deleted (Phase 7 cleanup step).
