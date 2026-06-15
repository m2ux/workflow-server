---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Produce finalized roadmap documentation with timeline, navigation, and success criteria

## Inputs

### priority_order

Ordered list of work packages with execution priority

### package_plans

List of completed package [plan documents](../resources/package-plan-template.md#template)

## Protocol

### 1. Update Start Here

- Build `{start_here}` in the [final START-HERE.md format](../resources/roadmap-template.md#start-heremd-final-format)
- Write executive summary: 2-3 sentences on purpose, scope, and expected impact
- Complete the work packages table, sequencing rows by `{priority_order}` and drawing effort and dependencies from `{package_plans}`  
  > If not all packages have completed plan documents, complete the missing package plans before finalizing the roadmap.
- Add status legend and initialize all packages as Planned

### 2. Update Readme

- Add navigation links to every artifact in the `{planning_folder_path}`, including all analysis and plan documents
- Organize links by document type: analysis, package plans

### 3. Add Timeline

- Group packages into implementation phases based on dependency chains
- Calculate phase durations from effort estimates (use the [duration formula](../resources/roadmap-template.md#duration-formula))
- Present timeline as a phase table with packages and estimated duration, capturing the overall span as `{timeline_estimate}`

### 4. Document Success

- Define initiative-level success criteria (all packages complete, domain-specific criteria)
- Reference per-package criteria from individual plan documents

### 5. Present Roadmap

- Present the completed `{start_here}` roadmap to the user for final review

## Outputs

### start_here

Completed [START-HERE.md](../resources/roadmap-template.md#start-heremd-final-format) with executive summary, status, timeline, and criteria

#### artifact

`START-HERE.md`

### planning_readme

Updated [README.md](../resources/roadmap-template.md#readmemd-final-format) with navigation links

#### artifact

`README.md`

### timeline_estimate

Overall timeline span for the initiative, derived from phase durations
