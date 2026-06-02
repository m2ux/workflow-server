---
name: evaluation-plan-template
description: Template for the evaluation plan document produced by the plan-evaluation technique.
metadata:
  order: 2
  legacy_id: 2
---

# Evaluation Plan Template

Template for the human-readable evaluation plan produced by the plan-evaluation technique. The plan
classifies the target, surveys its structure, maps each dimension to prism lens and pipeline-mode
configurations, and groups dimensions for execution. The three sections below mirror the technique's
write-evaluation-plan protocol step.

## Evaluation Plan Template

```markdown
# Evaluation Plan: {target name}

## 1. Target Overview

- **Target type:** {document | document-set | codebase | mixed}
- **Target path:** {target_path}
- **Summary:** {target_summary — what the target is and what it sets out to do}

**Structure inventory**

| Section / Module | Size |
|------------------|------|
| {section or module name} | {word count, section count, or LOC} |

**Key topics:** {key_topics discovered during survey — claims, goals, architectural decisions}

## 2. Dimension Plan

| Dimension | Pipeline Mode | Lenses | Analysis Focus | Output Location |
|-----------|---------------|--------|----------------|-----------------|
| {dimension name} | {full-prism | portfolio} | {lens indices, e.g. 07, 40} | {substantive analysis_focus referencing specific target content — never a bare label} | {output_subdir} |

## 3. Execution Groups

| Group | Pipeline Mode | Dimensions | Lenses | Combined Analysis Focus | Output Subdir |
|-------|---------------|------------|--------|-------------------------|---------------|
| {n} | {full-prism | portfolio} | {dimension names in group} | {merged lens indices} | {combined focus} | {output_subdir} |

- **Execution order:** {order in which groups are triggered}
- **Estimated sub-agent dispatches:** {count}
```

**What good looks like:** every dimension maps to a pipeline mode and a substantive `analysis_focus`
(not a bare label like "security audit"); full-prism dimensions sit in their own group, portfolio
dimensions are merged into a single group with their lens indices unioned.
