---
title: "Appendix C — Resource subsumption mapping (all 28 work-package resources)"
status: draft
phase: planning
date: 2026-05-22
relates-to: ./workflow-canonical-plan.md
---

# Appendix C — Resource subsumption mapping

> Per-file disposition of every file currently in `workflows/work-package/resources/`. Not every byte must become a technique: reference material stays a freeform skill (a resource), and only genuine reusable procedures become Techniques. A "resource" is not a distinct kind — it is simply a freeform skill (a `SKILL.md` with no `metadata.ontology`/`metadata.kind`), conventionally grouped under a `resources/` folder.
>
> Grounded in an empirical pass over all 28 files (the largest content body in the workflow at ~12,175 lines). The Explore agent's classification informed this mapping; destinations have been further updated to reflect the current model: **Skill = structural packaging only; Technique = the single content kind; a resource = a freeform skill — a SKILL.md carrying neither `metadata.ontology` nor `metadata.kind` — conventionally grouped under a `resources/` folder.**

## C.0 Classification rule (supersedes specific row dispositions where they conflict)

An earlier draft of Appendix C used dispositions like "Skill-local sub-file" and "Technique-local sub-file" that **no longer exist in the architecture** — there are no sub-files of any kind. The clean rule replacing them:

| Content type | Destination |
|---|---|
| Reference material — templates, criteria, primers, checklists, references, glossaries | **Resource** (freeform SKILL.md; no `ontology`/`kind`). Work-package-specific → `work-package/resources/<slug>/SKILL.md`; genuinely shared → `shared/resources/<slug>/SKILL.md`. |
| A genuine reusable procedure (inputs → steps → output) | **Technique** (`metadata.kind: technique`) at `<owner>/<slug>/SKILL.md`. |
| Workflow-engine config / mode definition | **Workflow docs** (not ontology content). |
| Obsolete / redundant | **Delete.** |

Resources are referenced by name and resolved by precedence (workflow-local → shared/) via `get_skill(name)`. A complex tool warrants a tool-dedicated **namespace resource** (e.g. `gitnexus`) — a freeform skill with no procedure or `Output` of its own — whose nested techniques are per-endpoint operational specs; its high-level overview is split out as a shared resource.

The 28-row table below carries the per-file detail. Where a legacy phrasing survives, read it through the lens of C.0.

## C.1 Disposition summary

| Disposition | Count | Net effect |
|---|---|---|
| **Resource** (freeform skill; no `ontology`/`kind`) | 15 | Templates/criteria/primers/references become name-resolved freeform skills, conventionally grouped under a `resources/` folder |
| **Technique** (`kind: technique`, nested under its owner) | 10 | Reusable procedures become first-class composable content units |
| **Split — gitnexus** (resource 27 → shared `gitnexus-reference` resource + per-endpoint techniques under the `gitnexus` namespace) | 1 | Tool overview becomes a shared resource; per-endpoint specs become techniques |
| **Workflow docs** (not ontology content) | 1 | Moves to workflow-level README or `workflow.toon`-adjacent docs |
| **Delete** (obsolete) | 1 | Removed |
| **Total** | **28** | `resources/` directory removed after migration |

## C.2 Per-file disposition table

| # | Filename | Lines | Disposition | Final destination | Rationale |
|---|---|---|---|---|---|
| 01 | `01-readme.md` | ~100 | **Resource** | `work-package/resources/readme-template/SKILL.md` | Template and guidelines for the work-package README artifact; reference material, referenced by `manage-artifacts`. |
| 02 | `02-readme.md` | ~15 | **Delete** | — | Deprecation pointer consolidating into `01-readme.md`; redundant. |
| 03 | `03-github-issue-creation.md` | ~80 | **Resource** | `work-package/resources/github-issue-criteria/SKILL.md` | Platform-specific issue-creation reference for GitHub; reference material, referenced by `create-issue`. |
| 04 | `04-jira-issue-creation.md` | ~80 | **Resource** | `work-package/resources/jira-issue-criteria/SKILL.md` | Platform-specific issue-creation reference for Jira; reference material, referenced by `create-issue`. |
| 05 | `05-requirements-elicitation.md` | ~80 | **Technique** | `research/elicit-structured-requirements/SKILL.md` | Named procedure with inputs (problem statement), outputs (structured requirements), reusable across `elicit-requirements`, `classify-problem`, `review-strategy`. `kind: technique`. |
| 06 | `06-implementation-analysis.md` | ~80 | **Technique** | `design/analyze-implementation-baseline/SKILL.md` | Establishes pre-change baseline; clear procedure (review existing usage, effectiveness eval, baseline metrics); reused by `analyze-implementation` and `review-strategy`. |
| 07 | `07-knowledge-base-research.md` | ~80 | **Technique** | `research/search-knowledge-base/SKILL.md` | Structured concept-rag research methodology; reusable across design, analysis, research skills. |
| 08 | `08-web-research.md` | ~80 | **Technique** | `research/search-external-sources/SKILL.md` | Web research procedure with step-by-step guidance; reusable across `research-knowledge-base` and `elicit-requirements`. |
| 09 | `09-design-framework.md` | ~80 | **Technique** | `design/apply-design-framework/SKILL.md` | Structured TRIZICS-style design methodology; reusable across problem classification, planning, and architecture review. |
| 10 | `10-wp-plan.md` | ~80 | **Resource** | `work-package/resources/wp-plan-template/SKILL.md` | Artifact template for work-package planning documents; reference material, referenced by `create-plan`. |
| 11 | `11-test-plan.md` | ~80 | **Resource** | `work-package/resources/test-plan-template/SKILL.md` | Test plan template; reference material, referenced by `create-test-plan`. |
| 12 | `12-pr-description.md` | ~80 | **Resource** | `work-package/resources/pr-description-template/SKILL.md` | PR description sections and checklist; reference material, referenced by `update-pr` (and informationally by `manage-git`). Both consumers reference the one resource by name. |
| 13 | `13-assumptions-review.md` | ~100 | **Technique** | `assumption-management/collect-and-classify-assumptions/SKILL.md` | Named procedure for identifying/categorising assumptions; reused across `classify-problem`, `review-assumptions`, `reconcile-assumptions`. |
| 14 | `14-task-completion-review.md` | ~80 | **Technique** | `code-review/verify-task-deliverables/SKILL.md` | Three-part checklist (symbol verification, assumption review, quality checks); independently meaningful and reused. |
| 15 | `15-architecture-review.md` | ~80 | **Technique** | `design/conduct-architecture-review/SKILL.md` | Named procedure for evaluating design decisions; produces ADRs; reused across `create-adr` and `review-strategy`. |
| 16 | `16-rust-substrate-code-review.md` | ~80 | **Resource** | `work-package/resources/rust-substrate-criteria/SKILL.md` | Language- and framework-specific review criteria; codebase-specific reference material, referenced by `review-code`. |
| 17 | `17-test-suite-review.md` | ~80 | **Resource** | `work-package/resources/test-suite-antipatterns/SKILL.md` | Test quality anti-patterns and assessment methodology; reference material, referenced by `review-test-suite`. |
| 18 | `18-strategic-review.md` | ~80 | **Resource** | `work-package/resources/minimality-checklist/SKILL.md` | Checklist for eliminating speculative changes and ensuring solution minimality; reference material, referenced by `review-strategy`. |
| 19 | `19-architecture-summary.md` | ~80 | **Resource** | `work-package/resources/architecture-summary-template/SKILL.md` | Artifact template; reference material, referenced by `summarize-architecture`. |
| 20 | `20-workflow-retrospective.md` | ~80 | **Resource** | `work-package/resources/retrospective-template/SKILL.md` | Methodology and template; reference material, referenced by `conduct-retrospective`. |
| 21 | `21-complete-wp.md` | ~80 | **Resource** | `work-package/resources/complete-wp-template/SKILL.md` | Artifact template for COMPLETE.md generation; reference material, referenced by `finalize-documentation`. |
| 22 | `22-manual-diff-review.md` | ~80 | **Technique** | `code-review/index-and-review-diffs/SKILL.md` | Structured diff indexing and human review; reusable across `review-diff` and any post-impl review. |
| 23 | `23-tdd-concepts-rust.md` | ~100 | **Resource** | `work-package/resources/tdd-concepts-rust/SKILL.md` | Knowledge primer (Three Laws, Red-Green-Refactor, language-specific patterns); reference material, referenced by `create-test-plan`/`review-test-suite`. |
| 24 | `24-review-mode.md` | ~80 | **Workflow docs** | `workflows/work-package/README.md` (or a workflow-mode-doc adjacent to `workflow.toon`) | Schema-level mode definition and per-activity behaviour; this is workflow-engine configuration, not ontology content. Should NOT be a technique or resource skill. |
| 25 | `25-codebase-comprehension.md` | ~80 | **Resource** | `work-package/resources/codebase-comprehension/SKILL.md` | Techniques from program-comprehension literature; reference material, referenced by `build-comprehension`. |
| 26 | `26-assumption-reconciliation.md` | ~80 | **Technique** | `assumption-management/reconcile-assumptions-autonomously/SKILL.md` | Named classify→analyze→update→capture cycle; autonomous assumption resolution; reused across `review-assumptions` and `finalize-documentation`. |
| 27 | `27-gitnexus-reference.md` | 592 | **Split — gitnexus** | `shared/resources/gitnexus-reference/SKILL.md` (shared resource: overview/schema/CLI) + one technique per API endpoint under the `gitnexus` namespace at `gitnexus/<endpoint>/SKILL.md` (e.g. `gitnexus/impact/SKILL.md`, `gitnexus/context/SKILL.md`, …) | Resource 27 is the operational reference for the gitnexus MCP server. It splits: the high-level overview/schema/CLI reference becomes a **shared resource** in the `shared/` layer (no `ontology`/`kind`); the per-endpoint operational specs become **techniques** under the `gitnexus` **namespace resource**, one per endpoint. |
| 28 | `28-pr-review-response.md` | ~200 | **Resource** | `work-package/resources/pr-review-response/SKILL.md` | Guide for analysing and responding to PR review comments; reference material, referenced by `respond-to-pr-review`. |

## C.3 New techniques summary (10 technique slugs)

Each creates a new `SKILL.md` file with `metadata.kind: technique` frontmatter, nested under its owning skill.

| # | New technique slug | Owning skill | Source resource |
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

These 10 plus the 8 derived from skill-body reuse (Appendix A) = **18 techniques** in the post-migration catalogue (alongside the per-endpoint `gitnexus` techniques from the resource-27 split).

## C.4 Technique groupings

The 18 techniques are organised under 7 **groupings**. A grouping is just a freeform **index skill** — a `SKILL.md` carrying no `metadata.ontology` (so it is a resource), with a `## Techniques` manifest and the techniques in nested folders. It collects related techniques; it isn't itself a governed unit. (`gitnexus` is additionally the tool's namespace.)

| Grouping (freeform index skill) | Techniques housed (nested SKILL.md folders) | Notes |
|---|---|---|
| `gitnexus` | 6–10 per-endpoint techniques (`impact`, `context`, `cypher`, `detect-changes`, `query`, `rename`, `shape-check`, …) — exact set split from resource 27 during Phase 3 | A pure tool namespace with no procedure or `Output` of its own. Each nested technique is the operational spec for one gitnexus MCP API endpoint. The high-level gitnexus overview lives as the shared resource `shared/resources/gitnexus-reference/SKILL.md`, referenced by name. |
| `workflow` | `load-guidance`, `write-and-validate-artifact`, `present-and-respond-checkpoint`, `dco-attest-commit` | Also houses the 5 role contracts as `##` sections inside `workflow/SKILL.md` (engineer, reviewer, planner, architect, maintainer). |
| `code-review` | `document-findings`, `verify-task-deliverables`, `index-and-review-diffs` | |
| `research` | `elicit-structured-requirements`, `search-knowledge-base`, `search-external-sources` | |
| `design` | `analyze-implementation-baseline`, `apply-design-framework`, `conduct-architecture-review` | |
| `assumption-management` | `collect-and-classify-assumptions`, `reconcile-assumptions-autonomously` | |
| `testing` | `tdd-design` | TDD reference material is the resource `tdd-concepts-rust` (from resource 23), referenced by name. Single-technique grouping — may consolidate post-pilot. |

Note: technique paths use no `techniques/` intermediate directory. A nested technique lives at `<owner>/<technique>/SKILL.md` (e.g. `gitnexus/impact/SKILL.md`, `code-review/document-findings/SKILL.md`).

**Grouping-set finalisation is empirical** — the 7-grouping proposal may consolidate to 5–6 during authoring (e.g. `testing` could merge into `code-review` if scope warrants).

## C.5 Concerns and conflicts (carried forward from the empirical pass)

1. **Resource 12 (PR description template)** — referenced by `update-pr` and possibly `manage-git`. As a resource it is referenced by name and resolved by precedence, so a second consumer needs no restructuring — both simply reference `pr-description-template`. Kept workflow-local to `work-package`.

2. **Resource 13 (assumptions-review) vs Resource 26 (assumption-reconciliation)** — overlapping conceptual ground (both about assumption handling). Kept as separate techniques because: 13 is *collection* (manual triage of which assumptions exist), 26 is *reconciliation* (autonomous validation/resolution cycle). Distinct enough to remain separate.

3. **Resource 23 (TDD reference, 100+ lines)** — substantial document. It is reference material (Three Laws, Red-Green-Refactor, state machine, language patterns), not a procedure, so it becomes the resource `tdd-concepts-rust`, referenced by name from the `tdd-design` technique and from the test-related skills. No technique-body folding is needed.

4. **Resource 27 (GitNexus reference, 592 lines)** — the largest single file in the resources directory. **Split**: the high-level overview/schema/CLI reference becomes the shared resource `shared/resources/gitnexus-reference/SKILL.md`; the per-endpoint operational specs become techniques under the `gitnexus` namespace resource, one `<endpoint>/SKILL.md` per endpoint. This separates ontology-agnostic reference material (resource) from the reusable per-endpoint procedures (techniques).

5. **Resource 24 (review-mode)** — NOT ontology content. It describes workflow-engine behaviour when the workflow runs in review mode. The right home is workflow-level documentation, possibly adjacent to `workflow.toon`. Phase 8 documentation update should incorporate this material into the workflow README or a new `workflows/work-package/MODES.md`.

## C.6 Fidelity acceptance criteria for resource subsumption

Each disposition is verified by:

- **Content fidelity** — every paragraph from the source resource lands in one (and only one) destination file. A diff-based audit script compares the union of all destination files against the pre-migration resource content; missing paragraphs are fidelity violations.
- **Reference fidelity** — every technique or resource in the new structure that needs the content of a pre-migration resource has a working **by-name reference resolved by precedence** (workflow-local → shared/) via `get_skill(name)`. Any pre-migration `resources: ["<id>"]` reference in a TOON skill must have an equivalent by-name reference to the destination technique or resource.
- **Behavioural fidelity** — Phase 7 cutover verification confirms the post-migration worker behaves equivalently to the pre-migration worker for representative tasks (per §10.2).

Only after all three pass is the pre-migration `resources/` directory removed (Phase 7 cleanup step).
