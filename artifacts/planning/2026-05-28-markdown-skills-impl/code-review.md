# Code Review Report — Markdown Skills Migration

**Activity:** `post-impl-review` (session `SUQLKL`)
**Date:** 2026-05-29
**Reviewer:** post-impl-review worker
**Diff scope (source):** `1d76647..HEAD` on `feat/125-markdown-skills-migration` (commits `e2a5988`, `31487f6`, `2a7d4be`, `3534906`, `3f9b21f`, `3dbf648`)
**Diff scope (content):** `workflows..HEAD` on `feat/125-markdown-skills-content` (commits `f9a673c`, `538de1d`, `8d8591f`, `f52b565`, `a8907bc`)

## Scope

This report covers the source-side and content-side implementation of the markdown-skills migration:

- New markdown skill loader (`src/loaders/markdown-skill-loader.ts`, 722 LOC).
- Skill loader rewrite to route through the markdown reader with workflow-local → `meta` precedence and an optional legacy TOON safety net behind `SKILL_LOADER_LEGACY_TOON` (`src/loaders/skill-loader.ts`).
- Resource loader flipped to markdown-only with id-only lookup as the canonical contract (`src/loaders/resource-loader.ts`).
- Resource-tool surface updated to parse text-only slug ids (`src/tools/resource-tools.ts`, `src/tools/workflow-tools.ts`).
- Migration utilities under `scripts/migrate-skills/` — `migrate.ts` (legacy → workflows copy) and `translate.ts` (TOON-to-markdown translator for the remaining 9 workflows).
- Test suite reshaped to cover real content, the PR126 fixture suite (TC-03 through TC-08, TC-15), and tempdir parsing edge cases.

GitNexus impact analysis (run during the review) reported LOW risk on the key public symbols (`readSkill`, `listResources`); the index is pre-migration and reflects the public-API surface that survived the refactor unchanged.

## Findings

### F-CR-01 — Stale resource count in change-block-index row 17 (Minor — documentation)

- **Status:** **Resolved** in review-fix-cycle iteration 1 (doc-only edit in `.engineering`; no commit SHA). Row 17 now reads `28 resources` and carries a one-sentence note naming the six post-F1 appended slugs.
- **File:** `.engineering/artifacts/planning/2026-05-28-markdown-skills-impl/change-block-index.md` (row 17)
- **Evidence:** row 17 says `work-package/resources/<slug>/SKILL.md (22 resources)`. The current tree under `workflows/work-package/resources/` contains **28** resource folders (verified by `ls -d work-package/resources/*/`). The discrepancy is a stale rationale: rows 14–17 were authored before the F1 flat-shape conversion appended the remaining six resources (`gitnexus-reference`, `manual-diff-review`, `readme`, `readme-02`, `review-mode`, `web-research`) to the folder shape on commit `f52b565`.
- **Impact:** No code impact. The provenance attestation already covered the F1 conversion globally (see manual-diff-review-report row 1). The change-block-index simply did not get its row-17 count refreshed.
- **Recommendation:** Update row 17's count from `22 resources` to `28 resources` for documentation accuracy. Severity: **Minor** (cosmetic — does not affect runtime).

### F-CR-02 — `readme-02` slug retains a numeric tail in the canonical id (Minor — content)

- **Status:** **Resolved** in review-fix-cycle iteration 1 — commit `0a510e3` on `feat/125-markdown-skills-content`. Renamed the folder to `readme-deprecated-notice/`, updated the frontmatter `name:` to match, dropped the now-meaningless `metadata.order` and `metadata.legacy_id` numeric fields, fixed the broken `[01-readme.md]` body link to point at the sibling `../readme/SKILL.md`, and updated the resources README table row. The redirect notice itself is preserved during the migration window.
- **File:** `workflows/work-package/resources/readme-02/SKILL.md`
- **Evidence:** the slug `readme-02` is the canonical id under the new id-only contract, yet it contains a numeric ordering tail (`-02`) — the very pattern the F1 correction declared deprecated. The companion `readme/` slug already exists and is the primary resource; `readme-02/` is now a one-paragraph redirect notice ("the standalone README guide has been merged into the primary README resource").
- **Impact:** Low — the redirect notice is benign and short. The principle violation is that the canonical id leaks a numbering artifact that the contract treats as deprecated.
- **Recommendation:** Either delete the `readme-02/` folder outright (the merged content already lives under `readme/`) or rename to a slug that names its purpose without a numeric tail (e.g. `readme-deprecated-notice`). Severity: **Minor** — content-side cleanup. Defer to a follow-up if user prefers to keep the redirect in place during the migration window.

### F-CR-03 — Regex character-class escape in `translate.ts::bodyContainsResourceRef` is over-escaped (Nit)

- **File:** `scripts/migrate-skills/translate.ts:480`
- **Evidence:** `slug.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')` — the inner character class contains `[\\]\\\\` which expands (in a regex literal) to a class accepting `]` and `\`, and the replacement is `\\$&` (literal backslash + whole match). Slug values that flow through this function are kebab-case alphanumeric/hyphen (produced by `parseFilename`), so the escape never triggers in practice. The construct is defensively correct but cluttered.
- **Impact:** None at runtime — no input ever activates the branch. Aesthetic.
- **Recommendation:** Simplify to `slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` (single backslash escapes, the standard pattern). Severity: **Nit**. Leave alone if the user prefers minimal churn — the script is a one-shot migration utility.

### F-CR-04 — Legacy TOON safety fallback retained behind `SKILL_LOADER_LEGACY_TOON` (Informational — by design)

- **File:** `src/loaders/skill-loader.ts:19,151-153,165-167,192-213`
- **Evidence:** the `LEGACY_TOON_ENABLED` branch reads the deprecated `skills/<NN-slug>.toon` files when the env-var is on. The branch is explicitly called out as a Phase C removable safety net in the design philosophy (assumption A-007).
- **Impact:** No runtime effect with the env-var off (default). The code-path is unused after the content migration but stays for one release cycle as a roll-back safety net.
- **Recommendation:** Informational only — no change. Phase C will remove the branch and the `parseActivityFilename` import. Severity: **Informational**.

### F-CR-05 — Two `readSkill` / `readSkillRaw` precedence chains duplicate the lookup logic (Nit — duplication)

- **File:** `src/loaders/skill-loader.ts:234-314`
- **Evidence:** `readSkill` and `readSkillRaw` differ only in their underlying call (`tryLoadSkillInWorkflow` vs `tryReadSkillRawInWorkflow`) and return type. The precedence ladder (explicit prefix → workflow-local → meta fallback) is duplicated verbatim across both functions.
- **Impact:** Maintenance — any future change to precedence has to be applied twice.
- **Recommendation:** Extract a precedence-resolution helper parameterised over the leaf loader (`<T>(load: (wf, id) => Promise<T | null>) => Promise<T | null>`) and have both functions call it with their respective loaders. Severity: **Nit** — defer to a follow-up cleanup. No correctness concern.

### F-CR-06 — `findResourceSkillMd` performs a sequential `readFile` scan over directory children on every miss (Nit — performance)

- **File:** `src/loaders/resource-loader.ts:67-90`
- **Evidence:** when the direct folder slug match fails (line 73), the loader falls back to opening every child SKILL.md to compare frontmatter `name:` (lines 76-88). On a `workflowDir` of moderate size (~28 resources for work-package) this is `O(n)` `readFile` calls per miss.
- **Impact:** Negligible at current sizes (sub-millisecond per `readFile`, no production hot path). Could matter for workflows that grow beyond ~100 resources or on cold-cache cold-start.
- **Recommendation:** Cache the slug↔name reverse map per `(workflowDir, workflowId)` on first access. Severity: **Nit** — defer until a profile shows it matters. Document the current behaviour in a TODO comment if desired.

### F-CR-07 — `parseFrontmatter` in `markdown-skill-loader.ts` accepts only top-level scalars and one nested level (`metadata`) (Informational — by design)

- **File:** `src/loaders/markdown-skill-loader.ts:61-100`
- **Evidence:** the YAML subset is deliberately scoped: top-level scalar pairs and a single nested mapping under `metadata:`. Anything deeper (lists, double-nested objects) is silently ignored.
- **Impact:** No impact — the canonical ontology does not permit deeper structures today, and the docstring (lines 53-60) explicitly states the scope.
- **Recommendation:** Informational only — no change. If a future canonical-ontology evolution introduces lists or deeper nesting, this parser must be extended; a code comment already marks the constraint. Severity: **Informational**.

### F-CR-08 — Migration script `void` statements suppress unused-import warnings (Nit — style)

- **File:** `scripts/migrate-skills/translate.ts:871-872`, `scripts/migrate-skills/migrate.ts:181-182`
- **Evidence:** `void dirname;`, `void readFileSync;`, `void writeFileSync;` — explicit no-ops to satisfy `noUnusedLocals`. These imports are not actually used in either file.
- **Impact:** None.
- **Recommendation:** Remove the unused imports (`dirname` in translate.ts, `readFileSync`/`writeFileSync` in migrate.ts) and drop the `void` statements. Severity: **Nit** — defer or apply as a tidy-up. No correctness concern.

## Summary by severity

| Severity | Count | Findings |
|---|---|---|
| Critical | 0 | — |
| Major | 0 | — |
| Minor | 2 | F-CR-01 (stale count in change-block-index), F-CR-02 (readme-02 numeric-tail slug) |
| Nit | 4 | F-CR-03 (over-escaped regex), F-CR-05 (precedence-chain duplication), F-CR-06 (resource-loader O(n) scan), F-CR-08 (unused imports + void suppressors) |
| Informational | 2 | F-CR-04 (legacy TOON branch is intentional), F-CR-07 (frontmatter parser scope) |

## Notes on review breadth

- The diff is large by surface area (+~13k lines content, +~2.5k lines source) but most of the content delta is mechanical translation/copy of pre-reviewed planning-folder material; spot-checking is sufficient at the per-file level since the translator and migrator are byte-deterministic.
- The markdown parser in `markdown-skill-loader.ts` is the new high-impact unit. Its parse logic was exercised by both fixture-based tests (TC-03 through TC-08) and real-content tests (TC-16 against the live `workflows/meta/techniques/` tree). No new findings were surfaced by re-reading the parser source.
- The resource-loader rewrite removed the entire numeric branch (per F1 remediation). The current code is markdown-only and id-only, matching the rationale corrections recorded in `manual-diff-review-report.md`.
