---
name: dimension-lens-mapping
description: Maps evaluation dimensions to prism pipeline modes and lens configurations.
metadata:
  order: 1
  legacy_id: 1
---

# Dimension-to-Lens Mapping Matrix

Maps evaluation dimensions to prism pipeline modes and lens configurations.

## Standard Mappings

| Dimension Pattern | Pipeline Mode | Lenses | Rationale |
|-------------------|---------------|--------|-----------|
| Consistency / coherence / contradictions | full-prism | L12 pipeline (resources 00→01→02) | The 3-pass pipeline with adversarial challenge is the strongest tool for internal consistency — it finds contradictions, challenges them, and produces synthesised findings with conservation laws. |
| Veracity / truthfulness / claims | portfolio | claim-inversion (07) + knowledge-audit (40) | Claim-inversion inverts each empirical claim and traces corruption. Knowledge-audit detects confabulated vs verified assertions. |
| Plausibility / alternatives / viability | portfolio | rejected-paths (09) | Examines alternatives that were dismissed, what problems migrate between chosen and rejected designs, and honesty of rejection assessments. |
| Feasibility / resources / constraints | portfolio | scarcity (08) | Identifies resource scarcities, conservation laws across designs, and what remains immovable regardless of redesign. |

## Custom Dimension Mappings

For dimensions not matching the standard patterns above, match the dimension's analytical goal against prism's own catalog: the [lens index](../../prism/resources/README.md) names every lens by family, and [recommended combinations](../../prism/resources/README.md#recommended-combinations) pairs the lenses that serve a goal together. prism owns that catalog and keeps it loadable by any workflow, so this resource carries no copy of it to drift against. Take the lenses the closest goal names (exploration, assumptions, quality, degradation, knowledge-boundary, and the rest) and, when the dimension maps to no clear goal, request a `{lens_overrides}` entry.

## Output Subdirectory Convention

- Full-prism dimensions: use the dimension name lowercased as the subdirectory (e.g., `consistency/`)
- Portfolio dimensions: group under `dimensions/`

## Per-Dimension Findings Source

Each triggered prism run writes its authoritative findings to `DEFINITIVE-FINDINGS.md` in the dimension's output subdirectory (see prism's [definitive-findings contract](../../prism/resources/definitive-findings-template.md)), alongside `REPORT.md` and `RUN-MANIFEST.json`. Consolidation reads DEFINITIVE-FINDINGS.md as the per-dimension findings source — it does not read the raw pass artifacts (`synthesis.md`, `portfolio-*.md`).

## Pipeline Mode Selection Guidance

Pipeline-mode semantics are defined by prism (see the modes table in the [prism README](../../prism/README.md)); this workflow only decides how dimensions map onto them:

- **full-prism**: each full-prism dimension gets its own execution group.
- **portfolio**: portfolio dimensions can be combined into a single execution group with merged lens sets.
- **single**: use when a dimension maps cleanly to exactly one lens and deep multi-pass analysis is unnecessary.
