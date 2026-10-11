---
name: evaluation-plan-template
description: Template for the evaluation plan document.
metadata:
  order: 2
  legacy_id: 2
---

# Evaluation Plan Template

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

## Rules

- **Every dimension carries a substantive focus.** An `analysis_focus` cell that restates the dimension's name tells the run nothing; it names content this target holds.
- **Grouping follows the mode.** A full-prism dimension occupies a group alone; portfolio dimensions share one group with their lens indices unioned.
- **Line budget:** ~60 lines. A plan longer than that is doing the evaluation rather than scoping it.
