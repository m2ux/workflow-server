# Work Package Prism Decision Conformance

A specimen of one form: a workflow borrowing another workflow's activity file and walking it once per fixture case, so the one definition is evidenced under each binding.

The activity is the work-package prism decision. For a complex change on an implementation run it assesses whether the full prism pipeline is worth its cost and puts that recommendation to the user; for a complex change under review it raises no gate and takes the full pipeline. The fixture checkout carries no change against its default branch, so the assessment reports that no change was measured and recommends measuring again.

| Activity | Borrows | Role |
|---|---|---|
| `take-case` | nothing | binds the next case: an implementation run, then a review run |
| `prism-decision` | `work-package/16-prism-decision.yaml` | the decision under test |
| `record-case` | nothing | appends what the decision settled, and loops while a case remains |
| `report-cases` | nothing | reports each case per the [decision case report](resources/decision-case-report.md) guide |
