---
metadata:
  version: 1.0.0
---

## Capability

Work-package plan artifact — task breakdown, dependencies, ordering, and recorded design decisions.

## Inputs

### design_philosophy

Design philosophy artifact with problem classification and workflow path.

### requirements

Work package requirements, driving the task breakdown and success-criteria alignment.

### analysis_findings

*(optional)* Implementation analysis findings — baselines and gaps. Reviewed to inform the approach when analysis was performed.

### research_findings

*(optional)* Research findings from knowledge base and web. Reviewed to inform the approach when research was performed.

### planning_folder_path

Path to the planning artifacts folder where `{plan_document}` is written.

## Outputs

### plan_document

Work package plan artifact with task breakdown and dependencies. Written to `{planning_folder_path}` as `work-package-plan.md`, documenting design decisions and assumptions.

#### artifact

`work-package-plan.md`

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
- Record consumed artifacts as the template's link-only Inputs list — one line per artifact linking the section that shaped the approach
- Include task breakdown, dependencies, ordering
- Document design decisions with rationale; fill the link-only slots (problem & scope, success criteria, testing strategy, assumptions) per the template's rules
