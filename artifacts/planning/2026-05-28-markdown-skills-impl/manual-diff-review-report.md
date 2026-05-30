# Manual Diff Review Report — Markdown Skills Migration

**Activity:** `post-impl-review` (session `SUQLKL`)
**Date:** 2026-05-29
**Reviewer:** Mike Clay (mike.clay@shielded.io)
**Worktree (source):** `/home/mike1/projects/work/workflow-server/2026-05-28-markdown-skills-impl/` on `feat/125-markdown-skills-migration`
**Worktree (content):** `/home/mike1/projects/work/workflows/2026-05-28-markdown-skills-impl/` on `feat/125-markdown-skills-content`

## Scope

This report records the manual diff review for the markdown-skills migration implementation against the change-block-index produced earlier in the activity. It captures user-supplied corrections to the rationale paragraphs, the resulting edits, and any follow-up items that need orchestrator or user attention.

## Provenance — user-supplied corrections

| # | Date | Reviewer | Verbatim correction | Scope | Resolution |
|---|------|----------|---------------------|-------|------------|
| 1 | 2026-05-29 | Mike Clay | "all resources and techniques are obtained by id only. the numbering system is deprecated. ensure this is reflected in the update" | Global — applies to all rationale paragraphs that describe the lookup contract | Edited `change-block-index.md` rows 10 (skill-loader.ts) and 11 (resource-loader.ts) to state id-only lookup as the canonical contract and treat numeric prefixes on flat filenames as deprecated/transitional. Updated the "How to use this index" preamble to clarify that the `#` column is a review-only row index, not a resource/technique ID. |

## Rationale edits applied

### Row 10 — `src/loaders/skill-loader.ts`

- Replaced "with `meta/<id>` explicit-prefix lookups still honoured" with a sentence framing technique resolution as id-only (folder slug or frontmatter `id`), with `meta/<id>` as an explicit-prefix targeting form rather than as a co-equal lookup mode.
- Replaced "Listing helper `listWorkflowSkillIds` now enumerates technique folders first and only falls back to the legacy `skills/` dir when the flag is on and the markdown side is empty" with a phrasing that calls the numeric-prefix `skills/` filenames deprecated and only consulted under the legacy flag.

### Row 11 — `src/loaders/resource-loader.ts`

- Removed the "alongside the legacy flat `NN-name.md` shape" framing that suggested parity between shapes.
- Replaced with: id-only lookup is the canonical contract; folder shape is the primary resolution path; flat-shape filenames may still be consulted for backward compatibility but the `NN-` numeric prefix is transitional and is **not** part of the lookup contract.
- Replaced "sorts flat-numeric resources first, folder-shape (alpha) after" with "emits id-keyed entries; flat-shape entries are surfaced for backward compatibility only."

### "How to use this index" preamble

- Added a sentence clarifying that the `#` column is a review-document row index, not a resource/technique ID, and that the `NN-` numeric prefix on flat resource filenames is deprecated.

## Findings that may require orchestrator/user follow-up

The user's correction was framed as a rationale correction. However, the underlying code state has implications worth flagging explicitly so the orchestrator can decide whether to surface them to the user.

### Finding F1 — Numeric flat-shape lookup is still implemented in `resource-loader.ts`

- `parseResourceFilename` (lines 75-81) matches only `^(\d+)-(.+)\.md$` — i.e., it **requires** an `NN-` numeric prefix to recognise a flat-shape resource file.
- `normalizeResourceIndex`, `resolveResourceRefToIndex`, and the trailing block in `readResourceRaw` (lines 167-190) all operate on numeric indices for the flat-shape branch.
- `listResources` (lines 197-244) emits `index` fields populated from the `NN` prefix for flat files; the sort comparator prefers numeric ordering.
- Tests, fixtures, and the migrated content tree (`work-package/resources/01-readme.md` through `28-pr-review-response.md`, plus three flat files in `meta/resources/`) all carry the `NN-` prefix on disk.
- The rationale now treats numbering as deprecated; the code still operates on it. If the user's intent is to remove the numeric branch entirely, that is a follow-up code change (Phase C-style cleanup) — not in scope for this review. If the user's intent is only to correct the framing while the code retains the transitional branch, the current edit is sufficient.

**Recommended action:** orchestrator surfaces F1 to the user with the following question:
> "The rationale now treats `NN-` numeric prefixes as deprecated. The loader code still resolves the flat shape via the numeric branch, and the migrated content tree still uses numeric filenames (28 in work-package, 3 in meta). Do you want a follow-up work item to remove the numeric branch from `resource-loader.ts` and rename the flat files to drop the `NN-` prefix, or is the deprecation a contract-only signal (the code branch stays as a transitional safety net until Phase C)?"

### Finding F2 — Numeric path is absent from `skill-loader.ts`

- The main markdown skill loader is already id-only (folder slug or frontmatter `id`). Numeric parsing only appears in the legacy TOON branch behind `SKILL_LOADER_LEGACY_TOON=true`, which the planning artifact already labels as a Phase C-removable safety net.
- No code change implied by the user's correction for skills/techniques. Rationale row 10 was rephrased for symmetry with row 11 and for the "explicit-prefix targeting" framing.

## Activity-level next steps

- The `block-interview` checkpoint that gated this resumption was driven by the user-supplied global correction. With the rationale now updated to reflect id-only contract, no per-block interview is required.
- Subject to orchestrator clearance of the active checkpoint, the activity should proceed to its remaining steps (impact analysis, lint, type-check verification, summary) per the activity definition.

## Review fix cycle iteration 1

Iteration 1 of the `review-fix-cycle` loop. Applied the five Minor findings from the automated reviews. Loop exit condition (no remaining Minor+ findings) is satisfied after this iteration.

| Finding | Source | Severity | Status | Fix commit | Note |
|---|---|---|---|---|---|
| F-CR-01 | code-review.md | Minor | Fixed | (doc-only — `.engineering`) | Updated row 17 in `change-block-index.md` from `22 resources` to `28 resources`; appended the post-F1 explanation naming the six appended slugs. |
| F-CR-02 | code-review.md | Minor | Fixed | `0a510e3` (content branch `feat/125-markdown-skills-content`) | Renamed `work-package/resources/readme-02/` → `work-package/resources/readme-deprecated-notice/`; dropped `metadata.order` and `metadata.legacy_id`; fixed broken `[01-readme.md]` body link to point at `../readme/SKILL.md`; updated the resources README table row. |
| F-TS-01 | test-suite-review.md | Minor | Fixed | `c4e619a` (source branch `feat/125-markdown-skills-migration`) | Tightened PR126-TC-06 to assert both `success === false` AND `error.name === 'SkillNotFoundError'`; replaced the "either path passes" comment with one that pins the now-closed regression gap. |
| F-TS-02 | test-suite-review.md | Minor | Fixed | `c4e619a` (source branch) | Added a four-line comment above the magic-number thresholds in `tests/skill-loader.test.ts` declaring them as lower bounds, naming the content path they couple to, and stating the intentional shrink-detection signal. |
| F-TS-03 | test-suite-review.md | Minor | Fixed | `c4e619a` (source branch) | Added PR126-TC-05b asserting `meta/<id>` explicit-prefix wins over a workflow-local override. Backed by a new dedicated `explicit-prefix-target` fixture pair (meta + work-package) so TC-04's no-override premise stays intact. Suite grew from 329 → 330 tests; typecheck clean. |

**Exit condition:** `needs_code_fixes==true OR needs_test_improvements==true` evaluates to **false** after iteration 1 — no remaining Minor+ findings across either automated review report. The `blocker-gate` decision evaluates `has_critical_blocker=false` (stale `true` from the prior worker has been cleared by the F1 remediation it referred to; F1 itself is closed in this report's row 1 above).
