---
metadata:
  version: 1.2.0
---

## Capability

Write a one-task specimen plan whose Contract follows the case under walk.

## Inputs

### contract_complete

Whether the case writes every Contract field.

## Outputs

### plan_document

The plan written for the case.

#### artifact

`work-package-plan.md`

#### audience

`human`

## Protocol

### 1. Write Plan

- Write `{plan_document}` in `{planning_folder_path}` with one Implementation Task named `Fixture task`
- Include Goal and Deliverables for that task
- When `{contract_complete}` is true, write the Contract with Signatures, Behaviours, Error cases and Acceptance, each one concrete line
- When `{contract_complete}` is false, write the Contract with Signatures, Behaviours and Acceptance only — omit Error cases
- Follow the Contract field names the [plan guide](/work-package/resources/plan-guide.md#rules) requires
