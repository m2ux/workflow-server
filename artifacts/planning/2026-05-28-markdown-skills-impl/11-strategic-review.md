# Strategic Review — Markdown Skills Migration

**Work Package:** Markdown Skills Migration (issue #125)
**Activity:** `strategic-review` (session `SUQLKL`)
**Date:** 2026-05-30
**Reviewer:** strategic-review worker
**Diff scope (source):** `8b16b45..HEAD` on `feat/125-markdown-skills-migration` (PR #126), 26 files, +2577 / −460
**Diff scope (content):** `workflows..HEAD` on `feat/125-markdown-skills-content`, 6 commits, ~170 SKILL.md files

---

## Review Scope

**Base branches:**
- Source side: `origin/main` → `feat/125-markdown-skills-migration`
- Content side: `origin/workflows` → `feat/125-markdown-skills-content`

**Files changed (source side, 26):**
- `src/loaders/` — `markdown-skill-loader.ts` (new, +722), `skill-loader.ts` (rewrite), `resource-loader.ts` (rewrite)
- `src/schema/skill.schema.ts` — doc-string only
- `src/tools/` — `resource-tools.ts`, `workflow-tools.ts` — slug-id parsing
- `scripts/migrate-skills/` — `migrate.ts`, `translate.ts`, `README.md` (new tools)
- `tests/` — `skill-loader.test.ts` (rewrite), `mcp-server.test.ts` (slug-id surface), 7 fixture SKILL.md files
- `.gitignore`, `.mcp.json`, `package.json` — supporting config (npm alias, ignore entries)
- `workflows` — submodule pointer to content-side branch HEAD
- `workflow-server.code-workspace` — removed (per-user editor config moved out of tracking)

**Content side (6 commits, ~170 SKILL.md files):**
- `meta/{techniques,resources}/<slug>/SKILL.md` — shared cross-workflow layer
- `work-package/{techniques,resources}/<slug>/SKILL.md` — work-package-local layer
- 9 remaining workflows translated by `scripts/migrate-skills/translate.ts`
- READMEs updated to describe new layout

---

## Findings Summary

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Investigation Artifacts | 0 | None |
| Over-Engineering | 0 | None |
| Orphaned Infrastructure | 0 | None |
| Scope Creep | 0 | None |
| README conformance | 1 (informational) | None — extra section is documentation enrichment |
| Change-fragment compliance | n/a | No `changes/` directory at either target_path |
| PR body conformance | 0 | None |
| **Total actionable** | **0** | Proceed |

All Minor-or-greater findings from the post-impl-review (`code-review.md`, `test-suite-review.md`) were resolved in iteration 1 of the `review-fix-cycle` loop (see `manual-diff-review-report.md` §"Review fix cycle iteration 1"). No additional Minor+ items surfaced in this strategic pass.

---

## Investigation Artifacts

None. The diff contains no debug logging, no exploratory print statements, no temporary workarounds, no diagnostic outputs.

Spot-checks performed:
- `src/loaders/markdown-skill-loader.ts` — `logWarn` calls are the established production telemetry channel (assumption A-016); not investigation-grade.
- `scripts/migrate-skills/{migrate,translate}.ts` — operator-facing console output is intentional (per `scripts/migrate-skills/README.md`); the scripts are one-shot migration utilities and their progress logging is the user-visible product.
- Test files — no `console.log`, no `.only`, no skip-without-reason. The 4 skipped tests (per validation report) pre-date this branch.

## Over-Engineering

None at the actionable level. The structural-findings report (L12 single-pass) records a Conservation-Law/Meta-Law analysis that identifies a deeper "single identifier loaded with four roles" structural property; that analysis explicitly classifies the consequence as a *future-consumer* concern (a hypothetical non-LLM consumer would need a new projection function), not a present over-engineering finding. The chosen design preserves wire compatibility via `projectSkillToToon` and is appropriate for the current consumer set.

Specific checks:
- `markdown-skill-loader.ts` (722 LOC) — every section parser maps to a documented canonical-ontology section (Capability, Inputs, Protocol, Operations, Outputs, Rules, Errors). No speculative section types.
- `skill-loader.ts` precedence ladder — explicit-prefix → workflow-local → meta → optional legacy TOON. Each rung is justified by the design philosophy and assumption log (A-002 explicit-prefix, A-007 legacy safety net, A-018 projection function). The duplication between `readSkill` and `readSkillRaw` was flagged as a Nit (F-CR-05) and explicitly deferred — extraction is a tidy-up, not over-engineering.
- `resource-loader.ts` — folder-shape and flat-shape branches both exist, with the flat-shape branch flagged in rationale row 11 as transitional/backward-compatible. The `guides/` fallback in `getResourceDir` is preserved per assumption A-013 and is explicitly out of scope.

## Orphaned Infrastructure

None. The legacy TOON branch in `skill-loader.ts` (behind `SKILL_LOADER_LEGACY_TOON=true`) is intentional safety-net infrastructure with a documented Phase C removal plan (assumption A-007; finding F-CR-04). It is not orphaned — it carries an explicit lifetime.

Other infrastructure checked:
- `parseActivityFilename` alias on `skill-loader.ts` — referenced by the legacy-TOON branch; removed alongside that branch in Phase C.
- Migration scripts under `scripts/migrate-skills/` — one-shot utilities; `npm run migrate-skills` alias and operator-facing README document their use. The user attested the scripts as part of the migration cohort, not as production infrastructure.
- Test fixtures under `tests/fixtures/markdown-skills/` — every fixture is used by at least one test case (TC-03 through TC-08, TC-05b). No orphans.

## Scope Assessment

**Outcome:** Minimal and focused.

The PR scope statement (issue #125, PR #126 Motivation and Planned Changes) declares:
1. Author markdown skill loader.
2. Refactor skill-loader and resource-loader to route through it.
3. Add projection function.
4. Replace cross-workflow scan-all with workflow-local → meta precedence.
5. Author migration scripts.
6. Migrate all workflows' content.
7. Update tests.

Every file in the diff maps cleanly to one of those seven scope items. No unrelated changes were detected:

| File class | Scope item | Verdict |
|---|---|---|
| `markdown-skill-loader.ts` | #1 | In scope |
| `skill-loader.ts` (rewrite) | #2, #3, #4 | In scope |
| `resource-loader.ts` (rewrite) | #2 | In scope |
| `skill.schema.ts` (doc-string) | #2 (id-only contract) | In scope |
| `resource-tools.ts`, `workflow-tools.ts` | #2 (slug-id parsing) | In scope |
| `scripts/migrate-skills/*` | #5 | In scope |
| Content-side ~170 SKILL.md files | #6 | In scope |
| `tests/skill-loader.test.ts`, `mcp-server.test.ts`, fixtures | #7 | In scope |
| `package.json` (migrate-skills alias) | #5 | In scope |
| `.gitignore`, `.mcp.json` | supporting | In scope (untrack per-user editor config; mcp config alignment) |
| `workflow-server.code-workspace` (removed) | supporting | In scope (per-user editor config moved out of tracking) |
| `workflows` (submodule pointer) | content cohort sync | In scope |

**No scope creep detected.** The change set is the minimum surface needed to deliver markdown-as-source-of-truth with wire-compatible TOON projection.

## Scope-discipline check (gitnexus)

Ran `gitnexus_detect_changes(scope=compare, base_ref=main, repo=workflow-server)` from the engineering-folder context. The reported `changed_count: 2` reflects the working-directory edits to `AGENTS.md` / `CLAUDE.md` (unrelated to this PR, pre-existing on the engineering branch), not the source-branch diff. The gitnexus index is pre-migration; it has not re-indexed the new `markdown-skill-loader.ts` file, so an authoritative call-graph orphan check on the new symbols cannot run from the index alone.

Orphan probe (`MATCH (f:Function) WHERE NOT (()-[:CodeRelation {type:'CALLS'}]->(f)) AND f.filePath CONTAINS 'loaders'`) returned only public exports (`listWorkflowSkillIds`, `readResource`, `getResourceEntry`, `listWorkflowsWithResources`, `buildSchemaPreamble`) whose callers sit in the MCP tools layer and external test files outside the indexed scope. These are not orphans; they are intended public API.

The post-impl-review `code-review.md` already covered the new loader's symbols by direct inspection — re-running orphan analysis under the stale index would duplicate that work without new signal. No new symbols-without-callers candidates surfaced.

## README conformance

`manage-artifacts::verify-readme-conforms(planning_folder_path)` produced:

```yaml
readme_conformance:
  conforms: true
  missing_sections: []
  extra_top_level_headings: []
  header_block_drift: []
```

All required H2s present (Executive Summary, Problem Overview, Solution Overview, Progress, Links). Header block carries the canonical Created / Status / Type fields. Single H1.

**Informational:** the README adds one extra H2 — `🌿 Branches & worktrees` — that documents the dual-branch (source + content) coordination unique to this work package. The template does not prohibit additional H2s; this is documentation enrichment, not drift. No action.

## Change-fragment compliance

Neither target_path (`workflow-server` worktree root nor `workflows` worktree root) contains a `changes/` directory. Per the activity definition:

- `fragment_references_issue = null` (no `changes/` directory).
- `validate (fragment_references_issue != false)` → null ≠ false → passes.

No action required.

## PR body conformance

Ran `update-pr::protocol.verify-body` against the live PR #126 body. Findings:

- Summary section present ✅
- 🐛 Issue link to #125 ✅
- 📐 Engineering link to planning README ✅
- Motivation section present ✅
- Planned Changes (Phase A / B / C breakdown) ✅
- Submission Checklist present ✅
- Fork Strategy present ✅
- TODO before merging present ✅
- `Closes #125` line at body end ✅

`body_conforms = true`. No findings to record.

## Architecture summary

`architecture-summary.md` already exists in the planning folder, authored during post-impl-review (date 2026-05-29). It carries:
- C4 system-context diagram (Mermaid) — agent → MCP tools → loaders → content submodule, with the projection layer as a first-class element.
- Package-level diagram showing the loader topology and the migration scripts.
- Sequence diagram for skill-load post-migration including the workflow-local → meta precedence and the legacy-TOON safety branch.
- Stakeholder-facing summary and an explicit "what is not changed" section.

The strategic-review activity's `create-architecture-summary` step considers the artifact present and current; no rewrite is required. Updating the date stamp to reflect strategic-review re-confirmation is not necessary — the content is unchanged.

## Minimality Assessment

| Question | Answer | Notes |
|----------|--------|-------|
| Is every changed file necessary? | Yes | 26 source-side files, each mapped to a scope item above |
| Is every added line necessary? | Yes | Spot-checks of `markdown-skill-loader.ts`, `skill-loader.ts`, `resource-loader.ts`, migration scripts found no speculative code |
| Are all new dependencies required? | Yes | No new runtime dependencies; `tsx` added under dev for `npm run migrate-skills` (one-shot tool) |
| Are all config changes required? | Yes | `.mcp.json` aligned with current dev setup (per commit 890066a series); `.gitignore` adds editor-config exclusions; `package.json` adds `migrate-skills` alias |
| Is the solution as simple as possible? | Yes (given the wire-compat constraint) | The projection function (`projectSkillToToon`) is the irreducible bridge between markdown source-of-truth and the TOON wire contract. Without it, every consumer would need a parallel update. |

## Cleanup Actions Taken

None — no actionable findings. The post-impl-review `review-fix-cycle` iteration 1 (commits `c4e619a` source-side, `0a510e3` content-side) already addressed the Minor findings from `code-review.md` and `test-suite-review.md`. The structural-findings L12 analysis classifies its meta-law consequence as future-consumer concern; no current-state cleanup follows from it.

---

## Review Result

**Outcome:** Passed. Changes are minimal, focused, and free of investigation artifacts.

**Rationale:** The diff implements exactly the seven scope items declared in PR #126 and issue #125, with no unrelated changes. All Minor findings from prior automated reviews were resolved in iteration 1 of the review-fix-cycle. README conforms to template (one informational extension), no `changes/` fragment is required, PR body conforms, architecture summary is current.

**Recommended action (checkpoint `review-findings`):** `acceptable` — proceed to `submit-for-review`.

**Next Step:** Transition to `submit-for-review` per the activity's transition table (`review_passed = true` after checkpoint acceptance).
