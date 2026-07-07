---
metadata:
  version: 1.0.0
---

## Capability

Define scope, dependencies, effort, and success criteria for a single package within a multi-package initiative, and document them as a plan.

## Inputs

### current_package

The work package currently being planned

## Outputs

### package_plan

Work package [plan document](../../resources/package-plan-template.md#template)

#### artifact

`{package_name}-plan.md`

#### scope_definitions

In-scope and out-of-scope definitions

#### dependencies

Blocker and soft dependency list

#### effort

Effort estimate with rationale

#### success_criteria

Measurable success criteria with verification methods

### package_name

Kebab-case identifier for the work package, derived from `{current_package}`.

## Protocol

### 1. Define Scope

- Identify what is in scope for the `{current_package}` — specific deliverables and changes  
  > Scope items must name specific deliverables — vague scope leads to scope creep.
- Identify what is explicitly out of scope with reasons for exclusion
- Apply the independence test: could this package be shipped without any other package?

### 2. Identify Dependencies

- Document hard blockers: packages or external factors that must complete first
- Document soft dependencies: helpful but not required
- Flag circular dependencies as decomposition problems requiring resolution
- If two packages depend on each other, identify the shared component and extract it as a separate package, or merge the two packages

### 3. Estimate Effort

- Assess complexity: Low / Medium / High based on scope and unknowns
- Estimate agentic time, review time, and calendar time as ranges
- Document the rationale for the estimate, noting key complexity drivers
- If the package scope exceeds 8 hours of agentic work, split it into two or more packages along natural boundaries

### 4. Define Success

- Establish measurable success criteria — each must be objectively verifiable
- Include verification method for each criterion (tests, review, demonstration)

### 5. Document Plan

- Derive the kebab-case package name `{package_name}` from `{current_package}`
- Create `{package_plan}` in `{planning_folder_path}` using the [package-plan-template](../../resources/package-plan-template.md#template)
