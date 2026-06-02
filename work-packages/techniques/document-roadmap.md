---
name: document-roadmap
description: Complete the roadmap documentation.
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

### planning-folder-path

Path to the planning folder containing all artifacts

### priority-order

Ordered list of work packages with execution priority

### package-plans

List of completed package plan document paths

## Protocol

### 1. Update Start Here

- Use attached [roadmap-template](../resources/roadmap-template.md) (roadmap-template) for the final START-HERE.md format
- Write executive summary: 2-3 sentences on purpose, scope, and expected impact
- Complete the work packages table with priority, effort, and dependencies from plans
- Add status legend and initialize all packages as Planned

### 2. Update Readme

- Add navigation links to all analysis and plan documents
- Organize links by document type: analysis, package plans

### 3. Add Timeline

- Group packages into implementation phases based on dependency chains
- Calculate phase durations from effort estimates (use formula from resource)
- Present timeline as a phase table with packages and estimated duration
- Timeline estimates use ranges, not point estimates, derived from package effort estimates

### 4. Document Success

- Define initiative-level success criteria (all packages complete, domain-specific criteria)
- Reference per-package criteria from individual plan documents
- Initiative-level success criteria must be measurable and verifiable

### 5. Present Roadmap

- Present the completed roadmap to the user for final review
- Set roadmap_complete to true after user confirms

## Outputs

### start-here

Completed START-HERE.md with executive summary, status, timeline, and criteria

- **artifact**: `START-HERE.md`

### readme

Updated README.md with navigation links

- **artifact**: `README.md`

## Rules

### complete-before-implementation

Roadmap must be fully documented and approved before implementation begins

## Errors

### missing_plans

**Cause:** Not all packages have completed plan documents

**Recovery:** Complete the missing package plans before finalizing the roadmap
