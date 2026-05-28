---
title: "Appendix B — Per-skill ontology mapping (work-package, 25 skills)"
status: draft
phase: planning
date: 2026-05-22
relates-to: ./workflow-canonical-plan.md
---

# Appendix B — Per-skill ontology mapping

> Per-skill mapping of every existing `work-package` TOON skill onto the new ontology. Validates that the ontology covers the existing surface area without re-cutting skill boundaries.

## B.0 Structural updates since first draft

This appendix has been revised through several ontology iterations. The final state to read the table against:

- **Current model**: **Skill** is structural packaging only (a folder with a `SKILL.md`), not a content kind. **Technique** is the single ontological content kind (`metadata.kind: technique`) — its body is either **composing** (references/sequences other techniques, e.g. via a `## Techniques` manifest) or **self-contained** (states its own procedure); this is just what the body contains, not a recognised "shape". Which technique is the unit of workflow delegation is declared in `workflow.toon` (an activity binds a role to a technique by name), not by any frontmatter field. A **resource** is simply a freeform skill — a `SKILL.md` with no `metadata.ontology`/`metadata.kind` — conventionally grouped under a `resources/` folder. Role contracts live as `##` sections within the `workflow` skill's `SKILL.md`; tools appear only as parameterised API call specs in technique prose, OR as the per-endpoint techniques of a tool-dedicated **namespace resource** (a pure index/namespace with no procedure or `Output` of its own, hence a freeform skill) when warranted (e.g. `gitnexus`).
- **Path convention**: nested techniques live at `<owner>/<technique>/SKILL.md` — no `techniques/` intermediate directory.
- **Every nested folder under a grouping is a named, action-oriented technique.** Generic stubs (`procedure/`, `execute/`, `main/`) are banned. Names are disambiguated to keep meaning when stripped of context — e.g. `understand-task-context` (under `implement-task`) vs `understand-codebase-context` (under `analyze-implementation`).
- **Sub-files reserved for the `*-operations` pattern.** What earlier drafts called "skill-local sub-files" (templates, criteria, primers) are **resources** — referenced by name, resolved by precedence. The "Skill-local sub-files" column in the table below should be re-read as "Resources referenced by name" (each former sub-file becomes a workflow-local resource at `work-package/resources/<slug>/SKILL.md` — see [Appendix C §C.0](./appendix-resource-subsumption.md#c0-classification-rule-supersedes-specific-row-dispositions-where-they-conflict)). The lone structural exception is the `*-operations` pattern (e.g. `cargo-operations`, `gitnexus-operations`) — one operation per sibling `<op>.md` file inside the skill folder, used purely to split a single skill's body across files; see [legacy-plan.md §5.5](./legacy-plan.md#55-adopted-refinements-beyond-mechanical-mapping).
- **No `role:` or `uses-tools:` frontmatter fields on skills**. Role-to-activity binding is in `workflow.toon` activities; tools are described inline in technique prose. The "Role (informational)" column in the table below is now purely traceability — for the workflow author writing `workflow.toon` activity definitions.
- **Gitnexus technique name mapping**: the earlier "gitnexus-impact-check" and "gitnexus-first-exploration" were *use patterns*, not endpoint wrappers. Under the current model, `gitnexus` is a tool-dedicated **namespace resource** with one nested technique per API endpoint (`gitnexus/impact`, `gitnexus/context`, `gitnexus/cypher`, …). Use-patterns like "pre-edit impact check" live as protocol steps in the activity-bound techniques that need them, with the surrounding discipline mandated by the engineer role contract (a section inside the `workflow` skill's `SKILL.md`).
  - **Table entries reading `gitnexus-impact-check`** → in the new structure, this is a protocol step that references `gitnexus/impact` by name with `direction: upstream`, plus a role-level discipline rule.
  - **Table entries reading `gitnexus-first-exploration`** → in the new structure, exploratory work invokes specific endpoint techniques directly (`gitnexus/context`, `gitnexus/query`, or `gitnexus/route-map`) depending on the question.

The mapping table below is preserved as a traceability artifact. To translate a row to the new structure:

1. The skill's `SKILL.md` is a lean composing body + `## Techniques` manifest.
2. Each phase named in "Cross-cutting techniques used" becomes either a manifest entry referencing a cross-cutting technique (if it's a shared, cross-cutting technique) or a nested action-named technique under the skill (if it's skill-specific).
3. Each entry in "Skill-local sub-files" becomes a resource referenced by name (e.g. `pr-description-template` → `work-package/resources/pr-description-template/SKILL.md`).
4. Each entry in "Skill-local steps retained" becomes a named nested technique under the skill (e.g. `derive-test-cases` → `derive-test-cases/SKILL.md`).

Net result per skill: the composing body + 2–5 nested action-named techniques + references to 2–4 cross-cutting techniques and any reference resources.

## B.1 Mapping table

Columns:
- **Existing file** — `NN-<id>.toon` filename.
- **New skill name** — directory-slug under `skills/`.
- **Role** — proposed role from the 5-role set.
- **Cross-cutting techniques used** — references to entries in the technique catalogue.
- **Skill-local steps retained** — protocol phases that stay inside the skill body (not promoted to techniques).
- **Notes** — anything noteworthy about the mapping.

**Reading guide for the table below:**

- **Technique slugs** are short names resolved by name (precedence: workflow-local → shared/) via `get_skill(name)`; they live under their owning skill — e.g. `gitnexus-impact-check` → `gitnexus/impact/SKILL.md`. The slug→path mapping is in [Appendix C §C.4](./appendix-resource-subsumption.md#c4-technique-groupings).
- **Resources** (the "Skill-local sub-files" column) are freeform reference material referenced by name, resolved by precedence. Sourced from [Appendix C](./appendix-resource-subsumption.md).
- **Tool dependencies** are not shown explicitly in the table to keep it readable; they appear as parameterised API call specs inside the referenced techniques' prose.

| Existing file | New skill name | Role (informational) | Cross-cutting techniques used | Resources referenced (by name) | Skill-local steps retained | Notes |
|---|---|---|---|---|---|---|
| `00-review-code.toon` | `review-code` | reviewer | `load-guidance`, `gitnexus-first-exploration`, `document-findings` | `rust-substrate-criteria` (from resource 16) | scope-the-review, prioritise-findings | The `evidence-required` rule moves up to the reviewer role contract (`##` section in the `workflow` skill's `SKILL.md`). |
| `01-review-test-suite.toon` | `review-test-suite` | reviewer | `load-guidance`, `gitnexus-first-exploration`, `document-findings` | `test-suite-antipatterns` (from resource 17), `tdd-concepts-rust` (from resource 23) | coverage-assessment, gap-analysis | TDD reference material is the `tdd-concepts-rust` resource, referenced by name. |
| `02-respond-to-pr-review.toon` | `respond-to-pr-review` | reviewer | `document-findings` | `pr-review-response` (from resource 28) | fetch-comments-from-github, classify-feedback, draft-responses | GitHub-specific fetch-comments stays skill-local. |
| `03-create-issue.toon` | `create-issue` | engineer | `write-and-validate-artifact` | `github-issue-criteria` (from resource 03), `jira-issue-criteria` (from resource 04) | platform-detect, verify-issue-not-exists, draft-issue-body | Both platform criteria are resources referenced by name. |
| `04-classify-problem.toon` | `classify-problem` | maintainer | `load-guidance`, `collect-and-classify-assumptions`, `write-and-validate-artifact` | — | categorise-by-type, prioritise | Triage/classification = maintainer responsibility. |
| `05-elicit-requirements.toon` | `elicit-requirements` | planner | `write-and-validate-artifact`, `elicit-structured-requirements` | — | conduct-conversation, capture-requirements, validate-with-user | The `elicit-structured-requirements` technique derives from resource 05. |
| `06-research-knowledge-base.toon` | `research-knowledge-base` | planner | `write-and-validate-artifact`, `search-knowledge-base`, `search-external-sources` | — | identify-research-questions, conduct-searches, synthesise-findings | Both search techniques derive from resources 07 + 08. |
| `07-analyze-implementation.toon` | `analyze-implementation` | engineer | `load-guidance`, `gitnexus-first-exploration`, `document-findings`, `write-and-validate-artifact`, `analyze-implementation-baseline` | — | trace-execution, identify-hotspots | The `analyze-implementation-baseline` technique derives from resource 06. |
| `08-create-plan.toon` | `create-plan` | planner | `load-guidance`, `gitnexus-first-exploration`, `write-and-validate-artifact`, `apply-design-framework` | `wp-plan-template` (from resource 10) | decompose-into-tasks, estimate-effort, identify-dependencies | Dual-role (planner primary, engineer secondary). |
| `09-create-test-plan.toon` | `create-test-plan` | engineer | `load-guidance`, `write-and-validate-artifact`, `tdd-design` | `test-plan-template` (from resource 11), `tdd-concepts-rust` (from resource 23) | derive-test-cases, define-acceptance-criteria, identify-fixtures | The `tdd-design` technique references the `tdd-concepts-rust` resource by name. |
| `10-implement-task.toon` | `implement-task` | engineer | `gitnexus-impact-check` (pre + post modes) | — | understand-task-context, write-code, verify-locally | Direct dependency on `cargo`, `git`, `gitnexus` tools. |
| `11-review-diff.toon` | `review-diff` | reviewer | `load-guidance`, `document-findings`, `index-and-review-diffs` | — | identify-defects | The `index-and-review-diffs` technique derives from resource 22. |
| `12-review-strategy.toon` | `review-strategy` | reviewer | `load-guidance`, `gitnexus-first-exploration`, `document-findings`, `conduct-architecture-review` | `minimality-checklist` (from resource 18) | assess-scope, evaluate-approach, check-alignment | The `conduct-architecture-review` technique derives from resource 15. |
| `13-review-assumptions.toon` | `review-assumptions` | reviewer | `collect-and-classify-assumptions`, `present-and-respond-checkpoint` | — | review-classification, judge-validity | Both techniques from the `assumption-management` grouping. |
| `14-manage-artifacts.toon` | `manage-artifacts` | engineer | `write-and-validate-artifact` | `readme-template` (from resource 01) | naming-convention, organise-by-activity, version-control | |
| `15-manage-git.toon` | `manage-git` | engineer | `dco-attest-commit` | — | branch-strategy, commit-discipline, push-protocol | Direct dependency on `git` tool. |
| `16-validate-build.toon` | `validate-build` | engineer | `load-guidance`, `gitnexus-first-exploration` | — | run-build, parse-results, escalate-on-failure | Direct dependency on `cargo` tool. |
| `17-finalize-documentation.toon` | `finalize-documentation` | engineer | `load-guidance`, `gitnexus-first-exploration`, `write-and-validate-artifact`, `reconcile-assumptions-autonomously` | `complete-wp-template` (from resource 21) | inventory-docs, update-readme, update-api-docs | The `reconcile-assumptions-autonomously` technique closes any open assumptions before finalisation. |
| `18-update-pr.toon` | `update-pr` | engineer | `write-and-validate-artifact` | `pr-description-template` (from resource 12) | compose-pr-description, link-issues, request-review | |
| `19-conduct-retrospective.toon` | `conduct-retrospective` | maintainer | `write-and-validate-artifact` | `retrospective-template` (from resource 20) | gather-data, identify-themes, propose-improvements | |
| `20-summarize-architecture.toon` | `summarize-architecture` | architect | `load-guidance`, `gitnexus-first-exploration`, `write-and-validate-artifact`, `conduct-architecture-review` | `architecture-summary-template` (from resource 19) | identify-components, draw-boundaries, document-decisions | |
| `21-create-adr.toon` | `create-adr` | architect | `write-and-validate-artifact`, `conduct-architecture-review` | — | frame-decision, list-alternatives, capture-consequences | |
| `22-build-comprehension.toon` | `build-comprehension` | engineer | `load-guidance`, `gitnexus-first-exploration` | `codebase-comprehension` (from resource 25) | identify-knowledge-gaps, drive-questions, synthesise-mental-model | Dual-role (engineer + architect). |
| `23-reconcile-assumptions.toon` | `reconcile-assumptions` | planner | `collect-and-classify-assumptions`, `present-and-respond-checkpoint`, `write-and-validate-artifact`, `reconcile-assumptions-autonomously` | — | identify-conflicts, propose-resolutions | Both techniques live in the `assumption-management` grouping. |
| `24-cargo-operations.toon` | `cargo-operations` | engineer | `present-and-respond-checkpoint` | — | select-cargo-command, execute-cargo, interpret-output | Direct dependency on `cargo` tool. May shrink to a thin reference if procedural logic is minimal. |
| `25-dco-provenance.toon` | `dco-provenance` | engineer | `dco-attest-commit` | — | verify-sign-off, attest-authorship | May shrink to a thin wrapper over the technique. |

## B.2 Technique-usage frequency (after migration)

How often each cross-cutting technique appears in the 25 mapped skills:

| Technique | Used by N skills | Used in skills |
|---|---|---|
| `load-guidance` | 13 | 00, 01, 04, 07, 08, 09, 12, 14 (no), 16, 17, 20, 22, … |
| `write-and-validate-artifact` | 14 | 03, 04, 05, 06, 07, 08, 09, 14, 17, 18, 19, 20, 21, 23 |
| `document-findings` | 7 | 00, 01, 02, 07, 11, 12 |
| `gitnexus-first-exploration` | 9 | 00, 01, 07, 08, 12, 16, 17, 20, 22 |
| `gitnexus-impact-check` | 1 | 10 (only, but with high importance — pre/post-edit) |
| `collect-and-classify-assumptions` | 3 | 04, 13, 23 |
| `present-and-respond-checkpoint` | 3 | 13, 23, 24 |
| `dco-attest-commit` | 2 | 15, 25 |

**Notes**:
- `gitnexus-impact-check` is only used by one skill (`implement-task`) — but the *rule* requiring impact analysis appears in 11 skills. The pre/post-edit invocation pattern is specific to skills that *write code*; the *exploratory* gitnexus usage is captured by `gitnexus-first-exploration`. Splitting these two felt correct on inspection — they have different invocation contracts. May merge in v2 if the split proves unnecessary.
- `dco-attest-commit` is currently distributed across two skills. Once promoted to a technique, both skills shrink and stay in sync automatically.

## B.3 Role qualification matrix (after migration)

Each role qualifies a known set of skills:

| Role | Qualified skills | Count |
|---|---|---|
| **Engineer** | analyze-implementation, create-issue, create-plan (secondary), create-test-plan, implement-task, manage-artifacts, manage-git, validate-build, finalize-documentation, update-pr, cargo-operations, dco-provenance, build-comprehension | 13 |
| **Reviewer** | review-code, review-test-suite, respond-to-pr-review, review-diff, review-strategy, review-assumptions | 6 |
| **Planner** | elicit-requirements, research-knowledge-base, create-plan (primary), reconcile-assumptions | 4 |
| **Architect** | summarize-architecture, create-adr, build-comprehension (secondary) | 3 |
| **Maintainer** | classify-problem, conduct-retrospective | 2 |

(Counts include dual-role secondaries; total qualifications > 25 because some skills are qualified by two roles.)

## B.4 What's NOT in this mapping (deliberately)

- **Self-contained techniques do not decompose further.** Only a technique with a composing body nests other techniques; a self-contained technique states its own procedure.
- **No skill orchestrates another skill.** Inter-skill coordination happens at the workflow level (`workflow.toon` activities).
- **No new skills are introduced.** The migration preserves the 25-skill grain; only the *internal organisation* changes (pulling cross-cutting concerns up to techniques, roles, and named resources).
- **Resource re-cutting is covered in Appendix C.** Each former resource becomes a named resource (reference material) or a technique (procedure); skills reference them by name, resolved by precedence.

## B.5 Confidence and known weaknesses

**High confidence** (well-supported by reuse evidence):
- The 8 technique catalogue.
- The 5 roles.
- The 1:1 skill grain preservation.

**Medium confidence** (judgement-based; may shift during migration):
- Some skill-local steps may turn out to be hidden techniques once we look closely (e.g. `verify-locally` in `implement-task` may be a reusable technique). Plan: expect 1–2 splits or merges after the first 5 skills are migrated.
- The `gitnexus-impact-check` / `gitnexus-first-exploration` split is plausible but not battle-tested. Plan: re-evaluate after migration of `implement-task` and 2–3 review skills.
- Role boundaries between Engineer and Maintainer (classify-problem, conduct-retrospective) — these are defensible as Maintainer but arguably Engineer. The decision matters for the role's responsibility/refusal contract.

**Low confidence** (genuinely uncertain):
- Whether `cargo-operations` and `dco-provenance` should survive as skills or collapse entirely into their underlying techniques (`present-and-respond-checkpoint` and `dco-attest-commit`). Both skills are thin orchestrators; if the orchestration logic is trivial post-migration, the skill loses its rationale. Plan: keep them as skills for the pilot; re-evaluate after authoring.
