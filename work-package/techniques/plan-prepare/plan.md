---
metadata:
  version: 1.0.0
---

## Capability

Apply the design framework to the inputs and write the work package plan artifact — task breakdown, dependencies, ordering, and documented design decisions and assumptions.

## Inputs

### design_philosophy

Design philosophy artifact with problem classification and workflow path. Verified present and applied to structure the implementation approach.

### requirements

Work package requirements; verified present and reviewed to drive the task breakdown and success-criteria alignment.

### analysis_findings

*(optional)* Implementation analysis findings — baselines and gaps. Reviewed to inform the approach when analysis was performed.

### research_findings

*(optional)* Research findings from knowledge base and web. Reviewed to inform the approach when research was performed.

### planning_folder_path

Path to the planning artifacts folder where `{plan_document}` is written.

## Outputs

### plan_document

Work package plan artifact with task breakdown and dependencies. Written to `{planning_folder_path}` as `work-package-plan.md`, documenting design decisions and assumptions.

#### tasks

Atomic tasks with explicit dependencies and ordering — each implementable, testable, and committable independently. Ordered by dependency depth (leaves before callers) when target symbols are knowable.

## Protocol

### 1. Verify Inputs

- Verify `{design_philosophy}` and `{requirements}` are available
- Confirm prerequisite inputs are present before proceeding
- If design philosophy or analysis is not present, prompt the user to provide the prerequisite inputs before planning.

### 2. Load Guidance

- Use attached [wp-plan](../../resources/wp-plan.md) for plan template and guidance
- Review `{design_philosophy}`, `{requirements}`, `{analysis_findings}`, `{research_findings}`

### 3. Apply Design Framework

- Apply [design framework](../../resources/design-framework.md#design-framework-trizics-approach) to structure implementation approach
- Document assumptions in planning decisions
- Break work into atomic tasks with explicit dependencies
- Define task ordering — never assume ordering is obvious
- When the target symbols are knowable, apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../../meta/techniques/gitnexus-operations/impact.md) `{target, direction: 'upstream'}` to bound task scope and order tasks by dependency depth (edit leaves before callers).

### 4. Write Plan

- Create the `{plan_document}` artifact in `{planning_folder_path}`
- Include task breakdown, dependencies, ordering
- Document design decisions and assumptions
