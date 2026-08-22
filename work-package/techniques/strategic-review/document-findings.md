---
metadata:
  version: 1.5.0
---

## Capability

Strategic review document with findings typed from the review-scope pass, or a clean-review result.

## Outputs

### strategic_review_doc

The strategic review [document](../../resources/strategic-review.md#strategic-review-artifact-template), written under `{planning_folder_path}` as bare `strategic-review-{n}.md` (artifact-prefix; n increments on successive reviews), stating every finding with its category and the action it argues for — or a clean review result when all changes are justified.

#### artifact

`strategic-review-{n}.md`

#### audience

`human`

### strategic_review_method

Method [record](../../resources/strategic-review.md#method-record-template) of how the review was conducted — the scope, conformance and minimality passes, and the delivery class each designator falls in.

#### artifact

`strategic-review-{n}-method.md`

#### audience

`human`


## Protocol

### 1. Document Findings

- State each finding in the `{strategic_review_doc}` in the shape [Finding Layout](../../resources/findings-report.md#finding-layout) declares, carrying the fields under [Field List](../../resources/strategic-review.md#field-list) and no others, with its severity derived through the map per [Severity](../../resources/findings-report.md#severity) and its reachability settled from the code the finding cites per [Reachability](../../resources/findings-report.md#reachability)
- Categorize each finding per the group's [finding-categories](./TECHNIQUE.md#finding-categories), assigning each a stable designator that downstream surfaces reference, per [Designators](../../resources/findings-report.md#designators)
- Report exceptions only: a clean review result is one line ("all changes justified — no findings"), never a per-section template fill; findings from other reviews are referenced by ID
- Record any deferred finding as a deferred-items register row (shape per the [deferred-items template](../../resources/deferred-items.md#template)) linked from the finding

### 2. Record the Method

- Create the `{strategic_review_method}` under `{planning_folder_path}` from the [Method Record Template](../../resources/strategic-review.md#method-record-template): the scope, PR-body conformance and minimality passes, and the delivery table placing every designator the run produced in exactly one class, per [Delivery Completeness](../../resources/findings-report.md#delivery-completeness)
