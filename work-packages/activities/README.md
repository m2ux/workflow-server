# Work Packages — Activities

Sequential activity chain for planning and coordinating multiple related work packages.

Each activity binds its steps to a workflow-specific technique via `step.technique`. The supporting column lists the strategy techniques each activity declares (`variable-binding`, plus `scatter-gather` for `forEach` activities).

| # | Activity | Step Technique(s) | Supporting | Description |
|---|----------|-------------------|------------|-------------|
| 01 | **Scope Assessment** | `assess-initiative-scope` | `variable-binding` | Confirm multi-package initiative and identify work packages |
| 02 | **Folder Setup** | `version-control::initialize-folder`, `setup-planning-folder` | `variable-binding` | Create planning folder structure with documentation skeletons |
| 03 | **Analysis** | `analyze-initiative-context` | `variable-binding` | Completion or context analysis depending on initiative type |
| 04 | **Package Planning** | `plan-work-package-scope` | `variable-binding`, `scatter-gather` | Define scope, dependencies, effort, and success criteria per package |
| 05 | **Prioritization** | `prioritize-packages` | `variable-binding` | Prioritize packages by dependencies, value, risk, and effort |
| 06 | **Finalize Roadmap** | `document-roadmap` | `variable-binding` | Complete roadmap documentation with timeline and success criteria |
| 07 | **Implementation** | `orchestrate-package-execution` | `variable-binding`, `scatter-gather` | Execute each package in priority order via the work-package workflow |

## Flow

```
scope-assessment → folder-setup → analysis → package-planning → prioritization → finalize-roadmap → implementation
```

The implementation activity triggers the `work-package` workflow for each planned package in priority order.
