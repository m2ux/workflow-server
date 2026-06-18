# Evaluation Workflow — Resources

> Part of the [Evaluation Workflow](../README.md)

## Resources (5)

| Name | Description |
|------|-------------|
| [Default Dimensions](default-dimensions.md) | Default evaluation dimension sets organised by target type |
| [Dimension-Lens Mapping](dimension-lens-mapping.md) | Maps evaluation dimensions to prism pipeline modes and lens configurations |
| [Evaluation Plan Template](evaluation-plan-template.md) | Structure for the evaluation-plan.md artifact (target overview, dimension plan, execution groups) |
| [Evaluation Report Template](evaluation-report-template.md) | Structure for the EVALUATION-REPORT.md artifact (executive summary, core finding, per-dimension findings, recommendations) |
| [Mitigation Plan Template](mitigation-plan-template.md) | Structure for the MITIGATION-PLAN.md artifact (summary table, detailed mitigations, implementation priority) |

---

### Default Dimensions

Provides default dimension sets when the user does not supply explicit dimensions:

| Target Type | Dimensions |
|-------------|------------|
| Proposal / strategy document | Consistency, Veracity, Plausibility, Feasibility |
| Codebase | Correctness, Robustness, Architecture, Maintainability |
| Mixed | Combined based on evaluation_description emphasis |
| Custom | Inferred from evaluation_description |

Each dimension includes a name, description, and focus_areas array.

---

### Dimension-Lens Mapping

Maps evaluation dimensions to prism lens configurations:

| Dimension Pattern | Pipeline Mode | Lenses |
|-------------------|---------------|--------|
| Consistency / coherence | full-prism | L12 (00→01→02) |
| Veracity / truthfulness | portfolio | claim-inversion (07) + knowledge-audit (40) |
| Plausibility / alternatives | portfolio | rejected-paths (09) |
| Feasibility / constraints | portfolio | scarcity (08) |

Also includes custom dimension mappings (exploration, assumptions, quality, degradation, knowledge gaps) and pipeline mode selection guidance.
