# WP-02 Strategic Review

## Scope Assessment

| Criterion | Status |
|-----------|--------|
| All 15 findings addressed | ✅ |
| No out-of-scope changes | ✅ |
| No source code modified | ✅ |
| Only `schemas/*.schema.json` touched | ✅ |
| No Zod schema changes (WP-03 scope) | ✅ |
| No documentation changes (WP-12 scope) | ✅ |

## Diff Analysis

- **5 files changed**, +76 −35 lines
- Every hunk maps to a specific finding ID (QC-001 through QC-127)
- No formatting churn, no whitespace-only changes
- No new dependencies introduced

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `additionalProperties: false` breaks existing TOON files | Medium | Low | Stakeholder approved (Option C). Caught during workflow validation, not at runtime. WP-03 will align Zod schemas. |
| `triggers` type change (object→array) breaks existing activities | Low | Low | Very few activities use `triggers`. Zod alignment in WP-03. |
| `activities` now required in workflow schema | None | None | Aligns with existing Zod schema. All workflows already have activities. |
| `if/then` for `currentActivity` unsupported by some validators | Low | Low | Draft-07 feature. Worst case: `currentActivity` becomes fully optional (acceptable). |

## Architecture Impact

None. This is a schema-only change with no new modules, patterns, or architectural decisions. The `if/then` conditional for `currentActivity` is the only structural pattern addition, and it's a standard JSON Schema draft-07 construct.

**ADR needed:** No — no architectural decisions required.

## Cross-WP Impact

| WP | Impact |
|----|--------|
| WP-03 (Zod alignment) | Must align Zod schemas for: `triggers` (array), `additionalProperties` (strict), `activities` (already done in Zod) |
| WP-04 (Cross-schema sync) | JSON Schema `$id` additions make cross-file `$ref` resolution explicit — simplifies WP-04 |
| WP-12 (Documentation) | Schema description updates reduce WP-12 documentation burden for `rules` type differences |

## Verdict

**Acceptable.** Changes are tightly scoped to the 15 audit findings, minimal in size, and well-documented. No scope creep detected. Downstream impact is limited to WP-03 Zod alignment, which was already planned.
