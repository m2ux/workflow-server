# Evaluation Workflow — Skills

> Part of the [Evaluation Workflow](../README.md)

## Skills (2)

| # | Skill ID | Capability | Used By |
|---|----------|------------|---------|
| 00 | `plan-evaluation` | Target classification, dimension derivation, dimension-to-lens mapping, execution grouping | scope-definition, dimension-planning, execute-analysis |
| 01 | `compose-evaluation-report` | Cross-artifact extraction, cross-dimensional synthesis, report composition, result presentation | consolidate-report, deliver-results |

---

### plan-evaluation (00)

**Protocol sections:**

| Section | Purpose |
|---------|---------|
| classify-target | Examine target_path to determine type (document, document-set, codebase, mixed) |
| derive-dimensions | Load resource 00 defaults or validate user-supplied dimensions |
| survey-target | Read target structure, identify key topics and claims for analysis_focus |
| map-dimensions-to-lenses | Load resource 01 mapping matrix, assign pipeline mode and lenses per dimension |
| group-for-execution | Group dimensions by pipeline mode into execution_groups |
| write-evaluation-plan | Compose evaluation-plan.md artifact |

**Resources:** 00 (default-dimensions), 01 (dimension-lens-mapping)

**Tools:** glob, read_file, grep, write_file, gitnexus_list_repos, gitnexus_query

---

### compose-evaluation-report (01)

**Protocol sections:**

| Section | Purpose |
|---------|---------|
| locate-artifacts | Find prism output artifacts per dimension in output subdirectories |
| extract-findings-per-dimension | Extract findings with IDs (CON-xx, VER-xx, etc.), severity, title, description |
| identify-cross-dimensional-patterns | Find the core finding and cross-cutting patterns spanning dimensions |
| compose-report | Write EVALUATION-REPORT.md with methodology stripped |
| verify-report | Validate finding IDs, severity counts, and absence of methodology metadata |
| present-results | Read report, compile metrics, present structured results with artifact index |

**Tools:** read_file, write_file, glob

**Key rules:** methodology-stripping, finding-id-convention, severity-rubric
