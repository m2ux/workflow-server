---
name: dimension-lens-mapping
description: Maps evaluation dimensions to prism pipeline modes and lens configurations.
metadata:
  order: 1
  legacy_id: 1
---

# Dimension-to-Lens Mapping Matrix

## Standard Mappings

| Dimension Pattern | Pipeline Mode | Lenses | Rationale |
|-------------------|---------------|--------|-----------|
| Consistency / coherence / contradictions | full-prism | L12 pipeline (resources 00→01→02) | The 3-pass pipeline with adversarial challenge is the strongest tool for internal consistency — it finds contradictions, challenges them, and produces synthesised findings with conservation laws. |
| Veracity / truthfulness / claims | portfolio | claim-inversion (07) + knowledge-audit (40) | Claim-inversion inverts each empirical claim and traces corruption. Knowledge-audit detects confabulated vs verified assertions. |
| Plausibility / alternatives / viability | portfolio | rejected-paths (09) | Examines alternatives that were dismissed, what problems migrate between chosen and rejected designs, and honesty of rejection assessments. |
| Feasibility / resources / constraints | portfolio | scarcity (08) | Identifies resource scarcities, conservation laws across designs, and what remains immovable regardless of redesign. |

## Custom Dimension Mappings

A dimension outside the standard patterns is matched by its analytical goal — exploration, assumptions, quality, degradation, knowledge boundaries, and the rest — against prism's own catalog, where the [lens index](../../prism/resources/README.md) names every lens by family and [recommended combinations](../../prism/resources/README.md#recommended-combinations) pairs the lenses that serve one goal. The dimension takes the lenses its closest goal names.

A dimension that matches no goal in that catalog carries no derived mapping, and needs an explicit lens override supplied for it.

## Output Subdirectory Convention

- Full-prism dimensions: use the dimension name lowercased as the subdirectory (e.g., `consistency/`)
- Portfolio dimensions: group under `dimensions/`

## Pipeline Mode Selection

Pipeline-mode semantics belong to prism; the mapping below decides only which mode a dimension takes.

- **full-prism**: each full-prism dimension takes its own execution group.
- **portfolio**: portfolio dimensions combine into a single execution group with merged lens sets.
- **single**: for a dimension that maps cleanly to exactly one lens, where multi-pass analysis adds nothing.
