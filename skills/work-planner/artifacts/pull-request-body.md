# Pull Request Body

Populates one pull request body from its change, review scope and validation evidence.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)

## Operations

### *Populate* Pull Request Body

One pull request body from supplied change and validation evidence.

**Inputs:** Change summary, supplied delivery scope, validation evidence, optional current body and output path.

1. Populate the body from the [Template](#template) using the change and its evidence, using [Populate Review Body](#populate-review-body) for an epic review.
   - All populated fields must meet [Fields](#fields).
2. Verify each result link against [Test Plan](#test-plan) before publishing the body.
3. Return the complete body file and any unresolved evidence links to the caller for publication.

### *Populate* Review Body

The current change carried by one epic base.

**Inputs:** Current base change, supplied task-merge evidence and optional existing review body.

1. Populate the review body from the [Template](#template) using the actual task merges into the base.
   - All populated fields must meet [Fields](#fields), including the review-specific requirements in [Review Body](#review-body).
2. For a later task merge:
   - Add its functional change under the corresponding area.
   - Cite the merged task pull request as the next reference.
3. Return the complete updated body file to the caller.

### *Link* Architecture Overview

One pull request body referencing its published overview.

**Inputs:** Current body, published overview URL on the engineering branch and output body path.

1. Add the Architecture Overview reference to the body's References section, creating that section in its [Template](#template) position when absent.
2. Preserve an existing row already naming the overview. The link uses the engineering-artifacts base URL so later files resolve from the same record.

      ```markdown
      - **R1.** [Architecture Overview](https://github.com/{owner}/{repo}/tree/engineering/artifacts/planning/2026-10-08-950-queue-placement/architecture-overview.md) — the change's structure, its flows, and the order to read the diff.
      ```

3. Return the complete updated body file for publication.

## Fields

### Template

````markdown
## Overview

{{One paragraph: what this pull request delivers and why.}}

## Changes

{{One sentence on what changed and why it was needed. Then one heading per area the changes sit in. A heading is two to five words, in title case, such as Queue Placement or Task Readiness. Under each heading, one bullet per functional change in that area. The bullet opens with a bold lead, as the scheme's Bold leads rule lays one out. The change is at most two lines, the lead included: the lead names what it does, and the behavior is the single line under it.}}

### {{Queue Placement}}

- **{{What it does.}}**
  {{The behavior as it is.}}

## Test Plan

| Test | Description | Coverage | Pass |
| --- | --- | --- | --- |
| T1 | {{Check name, per [Test Plan](#test-plan).}} | {{Observed criteria, if any.}} | [{{Result}}]({{Planning document URL#test-section}}) |

## Open Questions

- {{An undecided point. Resolve it, then delete the section.}}

## References

- **R1.** [{{Title}}]({{URL}}) — {{What the reader finds there. The issue this pull request delivers is not a reference: the Development field carries that link, as [Issue Links](pull-request.md#issue-links) state. Delete the section when there is none.}}
````

### Titles

- A pull request's title starts with the epic it works on: `[I07:E00] Purpose`.
- A pull request working on no epic takes `Name: Subtitle`, with no prefix, as a revision of the skill itself does.
- The prefix is how an epic's pull requests are found, and each one, open or merged, is matched to the tasks it works on from its changes and the tasks' Descriptions.
- The pull request that merges an epic base carries the same prefix. Its head is the epic base, which tells it from a task pull request.

### Review Body

- Overview is one paragraph on what the base carries.
- Changes holds one heading per area, with a bullet per functional change.
- References cites each task pull request merged into that base.
- It carries no Test Plan, since it delivers no task of its own, and no statement about what the epic has yet to deliver. The epic's Work Breakdown is where delivery state is read.

### Test Plan

A task pull request carries a Test Plan.

- **Table.**
  The pull request's Test Plan section contains only one table, with columns Test, Description, Coverage and Pass, in that order.
- **Columns.**
  - Test names the id.
  - Description briefly names the check.
  - Coverage names the criteria the check observes, `AC1, AC3`, and is empty when the check observes none.
  - A row whose Test cell is empty names a criterion no check observes, and its Pass cell is empty.
  - Pass is empty while a check awaits a result. A recorded result uses ✓ when the check ran and held, or an accurate label such as Partial, Fail or Not run.
- **Evidence.**
  - Test procedures, tested revisions, observations, limitations and supporting evidence belong in the work's published planning document.
  - Each recorded result in Pass links to its relevant section in that document, using the result as link text: `[✓](URL#check)` or `[Partial](URL#check)`.
  - Each evidence link is accessible to the pull request's readers and resolves to the intended section.
- **Completion.**
  The test plan has passed when every row with a Test id carries ✓ as its result. Partial, failed and unexecuted checks remain incomplete.

### Test Coverage

- Every criterion a unit's Coverage names has an observing test in its work item and pull request. A criterion no test can observe remains in the [coverage report](issue-body.md#coverage-reports) and in a test-plan row with an empty Test cell.
- The criterion selects the test kind: a unit test for one component, an integration test for a seam between components, and an end-to-end or system test for running-system behaviour. That evidence meets [Coverage Reports](issue-body.md#coverage-reports).
- An instrument that does not exist yet is work the task carries, as the verified rule defines. Use the project's own system test where it can observe the criterion.
- One row per check, in execution order, followed by any unobserved criteria. Every criterion in the unit's Coverage appears in at least one row.
