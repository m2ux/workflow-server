# Evaluation Workflow — Resources

> Part of the [Evaluation Workflow](../README.md)

## Resources (2)

| Index | Name | Description |
|-------|------|-------------|
| 00 | [Default Dimensions](00-default-dimensions.md) | Default evaluation dimension sets organised by target type |
| 01 | [Dimension-Lens Mapping](01-dimension-lens-mapping.md) | Maps evaluation dimensions to prism pipeline modes and lens configurations |

---

### 00 — Default Dimensions

Provides default dimension sets when the user does not supply explicit dimensions:

| Target Type | Dimensions |
|-------------|------------|
| Proposal / strategy document | Consistency, Veracity, Plausibility, Feasibility |
| Codebase | Correctness, Robustness, Architecture, Maintainability |
| Mixed | Combined based on evaluation_description emphasis |
| Custom | Inferred from evaluation_description |

Each dimension includes a name, description, and focus_areas array.

---

### 01 — Dimension-Lens Mapping

Maps evaluation dimensions to prism lens configurations:

| Dimension Pattern | Pipeline Mode | Lenses |
|-------------------|---------------|--------|
| Consistency / coherence | full-prism | L12 (00→01→02) |
| Veracity / truthfulness | portfolio | claim-inversion (07) + knowledge-audit (40) |
| Plausibility / alternatives | portfolio | rejected-paths (09) |
| Feasibility / constraints | portfolio | scarcity (08) |

Also includes custom dimension mappings (exploration, assumptions, quality, degradation, knowledge gaps) and pipeline mode selection guidance.
