---
metadata:
  version: 1.0.0
---

## Capability

Write a one-task specimen plan whose Contract follows the case under walk.

## Inputs

### contract_complete

Whether every Contract field is written. When false, Error cases is omitted.

## Outputs

### plan_path

Path of the plan written into `{planning_folder_path}`.

#### artifact

`work-package-plan.md`

#### audience

`human`

## Protocol

### 1. Write Plan

- Write `{plan_path}` as `work-package-plan.md` in `{planning_folder_path}` with one Implementation Task named `Fixture task`
- Include Goal and Deliverables for that task
- When `{contract_complete}` is true, write the Contract with Signatures, Behaviours, Error cases and Acceptance, each one concrete line
- When `{contract_complete}` is false, write the Contract with Signatures, Behaviours and Acceptance only — omit Error cases
- Follow the Contract field names the [wp-plan](/work-package/resources/wp-plan.md#rules) guide requires
