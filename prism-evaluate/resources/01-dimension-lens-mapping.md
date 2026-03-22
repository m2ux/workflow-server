# Dimension-to-Lens Mapping Matrix

Maps evaluation dimensions to prism pipeline modes and lens configurations. Used by the plan-evaluation skill during the map-dimensions-to-lenses protocol step.

## Standard Mappings

| Dimension Pattern | Pipeline Mode | Lenses | Rationale |
|-------------------|---------------|--------|-----------|
| Consistency / coherence / contradictions | full-prism | L12 pipeline (resources 00→01→02) | The 3-pass pipeline with adversarial challenge is the strongest tool for internal consistency — it finds contradictions, challenges them, and produces synthesised findings with conservation laws. |
| Veracity / truthfulness / claims | portfolio | claim-inversion (07) + knowledge-audit (40) | Claim-inversion inverts each empirical claim and traces corruption. Knowledge-audit detects confabulated vs verified assertions. |
| Plausibility / alternatives / viability | portfolio | rejected-paths (09) | Examines alternatives that were dismissed, what problems migrate between chosen and rejected designs, and honesty of rejection assessments. |
| Feasibility / resources / constraints | portfolio | scarcity (08) | Identifies resource scarcities, conservation laws across designs, and what remains immovable regardless of redesign. |

## Custom Dimension Mappings

For dimensions not matching the standard patterns, use the prism plan-analysis skill's goal-mapping matrix:

| Goal Pattern | Recommended Lenses |
|--------------|-------------------|
| Exploration / discovery | claim-inversion (07) + rejected-paths (09) |
| Assumptions / dependencies | claim-inversion (07) + scarcity (08) |
| Quality / correctness | L12 (00→01→02) via full-prism |
| Degradation / decay | degradation (10) |
| Knowledge gaps / boundaries | knowledge-boundary (41) |

## Output Subdirectory Convention

- Full-prism dimensions: use the dimension name lowercased as the subdirectory (e.g., `consistency/`)
- Portfolio dimensions: group under `dimensions/`

## Pipeline Mode Selection Guidance

- **full-prism**: Deep 3-pass analysis (structural → adversarial → synthesis). Use for dimensions requiring rigorous internal consistency checking. Each full-prism dimension gets its own execution group.
- **portfolio**: Breadth across complementary lenses in a single pass. Use for dimensions served by specialised lenses. Portfolio dimensions can be combined into a single execution group with merged lens sets.
- **single**: Targeted single-lens evaluation. Use when a dimension maps cleanly to exactly one lens and deep multi-pass analysis is unnecessary.
