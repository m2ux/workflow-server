# Work Package Assumptions Review Conformance

A specimen of one form: a workflow borrowing another workflow's activity file and walking it once per fixture case, so the one definition is evidenced under each binding.

The activity is the work-package assumptions review. It collects the assumptions a change rests on, then settles them through one routine: convergence closes what the agent can resolve, and what stays open is assembled and put to the user at a batch gate whose answer is written into the log. A review run converges into the log and raises no gate. The fixture requirement names a transport the maintainer has not asked for, so one assumption stays open for the gate.

| Activity | Borrows | Role |
|---|---|---|
| `take-case` | nothing | binds the next case: an implementation run, then a review run |
| `assumptions-review` | `work-package/07-assumptions-review.yaml` | the review under test |
| `record-case` | nothing | appends what the review settled, and loops while a case remains |
| `report-cases` | nothing | reports each case per the [assumptions case report](resources/assumptions-case-report.md) guide |

Stealth mode is on, so neither case posts a summary to an issue tracker.
