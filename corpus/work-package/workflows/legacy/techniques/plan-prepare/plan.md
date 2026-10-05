---
metadata:
  version: 1.4.0
---

## Capability

Work-package plan artifact — task breakdown, a contract per task, dependencies, ordering, and recorded design decisions.

## Inputs

### strategic_fix_selection

*(optional)* Text the user typed naming the strategic-review findings to address, by priority. Unset until a strategic review selects findings to fix.

## Outputs

### plan_document

Work package plan carrying the task breakdown, each task's contract, the dependencies between tasks, and the design decisions the approach rests on.

#### artifact

`work-package-plan.md`

#### audience

`human`

#### tasks

Atomic tasks with explicit dependencies, ordering and a Contract — each implementable, testable, and committable independently. Ordered by dependency depth (leaves before callers) when target symbols are knowable.

## Protocol

### 1. Verify Inputs

- Verify `{design_philosophy_doc}` and `{requirements}` are available
- Confirm prerequisite inputs are present before proceeding

### 2. Load Guidance

- Follow the [plan guide](/work-package/workflows/legacy/resources/plan-guide.md#rules) for the plan template
- Review `{design_philosophy_doc}`, `{requirements}`, `{analysis_document}`, `{research_document}`

### 3. Apply Design Framework

- Apply [design framework](../../resources/design-framework.md#design-framework-trizics-approach) to structure implementation approach
- Document assumptions in planning decisions
- Break work into atomic tasks with explicit dependencies
  > When `{strategic_fix_selection}` is bound, the tasks address the strategic-review findings it names, in the priority it gives.
- Define task ordering — never assume ordering is obvious
- Order tasks by dependency depth, leaves before callers, from the symbols named in `{analysis_document}` and `{requirements}`

### 4. Write Plan

- Create the `{plan_document}` artifact in `{planning_folder_path}`
- Record consumed artifacts as the template's link-only Inputs list — one line per artifact linking the section that shaped the approach
- Include task breakdown, dependencies, ordering
- For each task, write its Contract per the [plan guide](/work-package/workflows/legacy/resources/plan-guide.md#rules)
- Document design decisions with rationale; fill the link-only slots (problem & scope, success criteria, testing strategy, assumptions) per the template's rules
