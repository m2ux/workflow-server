# Completion Summary — Markdown Skills Migration

**Work Package:** Markdown Skills Migration (issue [#125](https://github.com/m2ux/workflow-server/issues/125))
**Session:** `SUQLKL` (work-package), parent `F4346H` (meta)
**Type:** Refactor
**Complexity:** Simple (path-gated)
**Date completed:** 2026-05-31
**Status at completion:** Implemented, validated, strategically reviewed, PR review outcome **Approved**. Both PRs open and non-draft, pending merge.

---

## Deliverables

The migration replaces the TOON-encoded per-workflow skill source with plain-markdown techniques and resources stored under each workflow folder, served by the workflow-server with workflow-local → `meta` precedence resolution and a TOON-projection delivery pass that preserves the on-the-wire payload byte-for-byte.

It ships as two coordinated PRs that merge in order — content first, then source.

| Side | PR | Branch → Base | Scope |
|------|----|--------------|-------|
| Content | [#127](https://github.com/m2ux/workflow-server/pull/127) | `feat/125-markdown-skills-content` → `workflows` | ~170 `SKILL.md` files across `meta/` + 10 workflows, under `{techniques,resources}/<slug>/` |
| Source | [#126](https://github.com/m2ux/workflow-server/pull/126) | `feat/125-markdown-skills-migration` → `main` | markdown loader, precedence resolver, projection pass, resource-loader flip, migration scripts, tests |

### Source-side changes (PR #126)

- **`src/loaders/markdown-skill-loader.ts`** (new, ~722 LOC) — parses `SKILL.md` in both single-file and folder-with-op-children shapes into a `Skill` object; frontmatter parser scoped to top-level scalars plus a single nested `metadata` mapping.
- **`src/loaders/skill-loader.ts`** (rewrite) — routes through the markdown reader; precedence ladder is explicit-prefix → workflow-local → `meta`, with an optional legacy-TOON safety net behind `SKILL_LOADER_LEGACY_TOON` (default off). Adds `projectSkillToToon` — the irreducible bridge that re-projects markdown-sourced skills into the legacy TOON wire form so every existing consumer sees an unchanged payload.
- **`src/loaders/resource-loader.ts`** (rewrite) — flipped to markdown-only with an id-only (slug) lookup contract; numeric-prefix lookup removed.
- **`src/tools/resource-tools.ts`, `src/tools/workflow-tools.ts`** — parse text-only slug ids.
- **`scripts/migrate-skills/`** — `migrate.ts` (legacy → workflows copy) and `translate.ts` (TOON-to-markdown translator for the remaining 9 workflows); one-shot operator utilities behind `npm run migrate-skills`.
- **`tests/skill-loader.test.ts`** (rewrite), **`tests/mcp-server.test.ts`** (slug-id surface), and fixtures under `tests/fixtures/markdown-skills/`.

### Content-side changes (PR #127)

- `meta/{techniques,resources}/<slug>/SKILL.md` — shared cross-workflow layer.
- `work-package/{techniques,resources}/<slug>/SKILL.md` — work-package-local layer.
- Remaining 9 workflows translated via `translate.ts`.
- READMEs documenting the new layout.
- Documentation fixes during review: `172e4126` (rename `readme-02` slug to drop numeric tail), `a288910e` (substrate-node-security-audit template), `487d4fe4` (inline technique Resources safety-net sections).

---

## Test coverage

Full suite: **329 passing / 4 skipped** (the 4 skipped pre-date this branch). No regressions introduced.

Behaviour preservation is the success criterion: every `get_skill` / `get_workflow` / `get_activity` / `get_resource` call produces a payload wire-equivalent to the pre-migration baseline. The load-bearing guarantee is the projection round-trip — `decodeToon(projectSkillToToon(skill))` deep-equals the loaded `Skill` — plus real-content tests run against the migrated `workflows/` tree.

Implemented cases (see [05-test-plan.md §Test Source Locations](05-test-plan.md) for per-case anchors):

- Op-as-child-files assembly, precedence fallback to `meta`, workflow-local override suppression, explicit `meta/` prefix wins, malformed-op loud failure, not-found surfacing — `tests/skill-loader.test.ts` (PR126-TC-03..08, TC-05b, TC-15).
- Projection round-trip via `readSkillRaw` (TC-09 path), markdown-only resource loading edge cases (TC-10/11).
- `get_workflow` / `get_activity` preamble shape parity (TC-13/14, integration) — `tests/mcp-server.test.ts`.
- Backward compatibility (TC-16) — the real-content `readSkill` suite against live content.

---

## Review history

- **Post-impl review** (`code-review.md`, `structural-findings.md`, `test-suite-review.md`): 0 Critical/Major; 2 Minor (stale resource count F-CR-01; `readme-02` numeric-tail slug F-CR-02); 4 Nits; 2 Informational. All Minor findings resolved in review-fix-cycle iteration 1 (source `c4e619a`, content `0a510e3` / `172e4126`).
- **Strategic review** (`11-strategic-review.md`): 0 actionable findings. Scope assessed minimal and focused — every changed file maps to one of the seven declared scope items. README conforms (one informational extension); PR body conforms; architecture summary current. Outcome **Passed → acceptable**.
- **PR review:** Outcome **Approved** (`review_requires_changes = false`). Two documentation fixes pushed to PR #127 during the cycle (`a288910e`, `487d4fe4`).

---

## Deferred items / known limitations

Carried forward intentionally; none block merge:

- **F-CR-04 / Phase C cutover** — the legacy-TOON safety branch behind `SKILL_LOADER_LEGACY_TOON` and the `parseActivityFilename` alias remain for one release cycle as a roll-back net. Phase C removes them once the markdown layout is confirmed stable in production.
- **F-CR-05 (Nit)** — `readSkill` / `readSkillRaw` duplicate the precedence ladder. Extraction of a parameterised resolver is a follow-up tidy-up; no correctness concern.
- **F-CR-06 (Nit)** — `findResourceSkillMd` does an O(n) `readFile` scan on a slug miss; negligible at current sizes (~28 resources). Cache the slug↔name map if a profile ever shows it matters.
- **F-CR-03, F-CR-08 (Nits)** — over-escaped regex and unused-import `void` suppressors in the one-shot migration scripts; left as minimal-churn since the scripts are not expected to run again.
- **Migration scripts** are not covered by automated tests; correctness is validated indirectly through the live-content tests and the byte-deterministic translator output.

---

## Decisions of record

No ADR was produced — the work package is path-gated **simple**; ADRs are reserved for moderate/complex implementations. The key architectural decision (markdown source-of-truth with a wire-stable TOON projection bridge) is documented in [01-design-philosophy.md](01-design-philosophy.md) and the [architecture-summary.md](architecture-summary.md) (C4 context + package + sequence diagrams).

---

## Outstanding before close

- **Merge order:** content PR [#127](https://github.com/m2ux/workflow-server/pull/127) first (populate the new layout), then source PR [#126](https://github.com/m2ux/workflow-server/pull/126) (flip the loader). Both are approved and non-draft at completion time but **not yet merged**.
- **Session history capture** (`ai-metadata` private repo): the full session transcript export for `SUQLKL` is a manual step performed outside this worker; not yet captured.
